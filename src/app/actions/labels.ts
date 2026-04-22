'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { assertCan } from '@/lib/acl'
import { logTaskActivity } from '@/lib/task-activity-log'

function revalidateAllTaskSurfaces(projectId?: string | null) {
	revalidatePath('/tasks')
	revalidatePath('/dashboard/labels')
	revalidatePath('/dashboard/insights')
	if (projectId) {
		revalidatePath(`/projects/${projectId}`)
	}
}

export async function createLabelAction(name: string, color?: string | null) {
	const session = await auth()
	const userId = session?.user?.id
	const gate = assertCan(userId, 'create', { type: 'task', own: true })
	if (!gate.ok) return { ok: false as const, error: gate.error }

	const trimmed = name.trim()
	if (trimmed.length < 1 || trimmed.length > 48) {
		return { ok: false as const, error: '标签名长度 1–48 字符' }
	}

	try {
		const label = await prisma.label.create({
			data: {
				userId: userId!,
				name: trimmed,
				color: color?.trim() || null,
			},
			select: { id: true, name: true, color: true },
		})
		revalidatePath('/dashboard/labels')
		return { ok: true as const, label }
	} catch {
		return { ok: false as const, error: '名称可能已存在' }
	}
}

export async function deleteLabelAction(labelId: string) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录' }

	const label = await prisma.label.findUnique({
		where: { id: labelId },
		select: { userId: true },
	})
	if (!label || label.userId !== userId) {
		return { ok: false as const, error: '标签不存在' }
	}

	await prisma.label.delete({ where: { id: labelId } })
	revalidatePath('/dashboard/labels')
	revalidatePath('/tasks')
	return { ok: true as const }
}

export async function setTaskLabelsAction(taskId: string, labelIds: string[]) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录' }

	const task = await prisma.task.findUnique({
		where: { id: taskId },
		select: { userId: true, projectId: true },
	})
	if (!task) return { ok: false as const, error: '任务不存在' }

	const gate = assertCan(userId, 'update', {
		type: 'task',
		ownerId: task.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error }

	const unique = [...new Set(labelIds)]
	if (unique.length > 0) {
		const owned = await prisma.label.count({
			where: { userId, id: { in: unique } },
		})
		if (owned !== unique.length) {
			return { ok: false as const, error: '包含无效标签' }
		}
	}

	await prisma.task.update({
		where: { id: taskId },
		data: {
			labels: { set: unique.map(id => ({ id })) },
		},
	})

	await logTaskActivity({
		taskId,
		userId,
		kind: 'labels',
		summary: `更新了标签（共 ${unique.length} 个）`,
	})

	revalidateAllTaskSurfaces(task.projectId)
	return { ok: true as const }
}

export async function listLabelsForUserAction() {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录', labels: [] }

	const labels = await prisma.label.findMany({
		where: { userId },
		orderBy: { name: 'asc' },
		select: { id: true, name: true, color: true },
	})
	return { ok: true as const, labels }
}
