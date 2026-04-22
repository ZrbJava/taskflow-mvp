'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { assertCan } from '@/lib/acl'
import { logTaskActivity } from '@/lib/task-activity-log'

const MAX_ITEMS = 50
const TITLE_MAX = 200

function revalidateTaskSurfaces(projectId?: string | null) {
	revalidatePath('/tasks')
	revalidatePath('/dashboard/insights')
	if (projectId) {
		revalidatePath(`/projects/${projectId}`)
	}
}

async function getTaskGateForUpdate(taskId: string) {
	const task = await prisma.task.findUnique({
		where: { id: taskId },
		select: { userId: true, projectId: true },
	})
	return task
}

export async function listChecklistForTaskAction(taskId: string) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录', items: [] }

	const task = await prisma.task.findUnique({
		where: { id: taskId },
		select: { userId: true },
	})
	if (!task) return { ok: false as const, error: '任务不存在', items: [] }

	const gate = assertCan(userId, 'read', {
		type: 'task',
		ownerId: task.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error, items: [] }

	const items = await prisma.taskChecklistItem.findMany({
		where: { taskId },
		orderBy: { position: 'asc' },
		select: { id: true, title: true, done: true },
	})

	return { ok: true as const, items }
}

export async function addChecklistItemAction(taskId: string, title: string) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录' }

	const trimmed = title.trim()
	if (trimmed.length < 1 || trimmed.length > TITLE_MAX) {
		return { ok: false as const, error: `标题长度 1–${TITLE_MAX} 字符` }
	}

	const task = await getTaskGateForUpdate(taskId)
	if (!task) return { ok: false as const, error: '任务不存在' }

	const gate = assertCan(userId, 'update', {
		type: 'task',
		ownerId: task.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error }

	const count = await prisma.taskChecklistItem.count({ where: { taskId } })
	if (count >= MAX_ITEMS) {
		return { ok: false as const, error: `单任务最多 ${MAX_ITEMS} 条清单项` }
	}

	const agg = await prisma.taskChecklistItem.aggregate({
		where: { taskId },
		_max: { position: true },
	})
	const position = (agg._max.position ?? -1) + 1

	const item = await prisma.taskChecklistItem.create({
		data: { taskId, title: trimmed, position },
		select: { id: true, title: true, done: true },
	})

	await logTaskActivity({
		taskId,
		userId,
		kind: 'checklist_add',
		summary: `添加清单项「${trimmed.slice(0, 80)}」`,
	})

	revalidateTaskSurfaces(task.projectId)
	return { ok: true as const, item }
}

export async function toggleChecklistItemAction(itemId: string) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录' }

	const row = await prisma.taskChecklistItem.findUnique({
		where: { id: itemId },
		select: {
			done: true,
			title: true,
			taskId: true,
			task: { select: { userId: true, projectId: true } },
		},
	})
	if (!row) return { ok: false as const, error: '清单项不存在' }

	const gate = assertCan(userId, 'update', {
		type: 'task',
		ownerId: row.task.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error }

	const nowDone = !row.done

	await prisma.taskChecklistItem.update({
		where: { id: itemId },
		data: { done: nowDone },
	})

	await logTaskActivity({
		taskId: row.taskId,
		userId,
		kind: 'checklist_toggle',
		summary: nowDone
			? `完成清单项「${row.title.slice(0, 80)}」`
			: `将清单项「${row.title.slice(0, 80)}」标回未完成`,
	})

	revalidateTaskSurfaces(row.task.projectId)
	return { ok: true as const, done: nowDone }
}

export async function deleteChecklistItemAction(itemId: string) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录' }

	const row = await prisma.taskChecklistItem.findUnique({
		where: { id: itemId },
		select: {
			title: true,
			taskId: true,
			task: { select: { userId: true, projectId: true } },
		},
	})
	if (!row) return { ok: false as const, error: '清单项不存在' }

	const gate = assertCan(userId, 'update', {
		type: 'task',
		ownerId: row.task.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error }

	await prisma.taskChecklistItem.delete({ where: { id: itemId } })

	await logTaskActivity({
		taskId: row.taskId,
		userId,
		kind: 'checklist_delete',
		summary: `删除清单项「${row.title.slice(0, 80)}」`,
	})

	revalidateTaskSurfaces(row.task.projectId)
	return { ok: true as const }
}
