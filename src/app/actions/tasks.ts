'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { assertCan, can } from '@/lib/acl'
import { dueDateFromYmd } from '@/lib/due-date'
import { createTaskSchema, updateTaskSchema } from '@/lib/validations/task'
import type { TaskPriority } from '@/types/task'

function revalidateTaskViews(projectId?: string | null) {
	revalidatePath('/tasks')
	revalidatePath('/dashboard/projects')
	revalidatePath('/dashboard/insights')
	if (projectId) {
		revalidatePath(`/projects/${projectId}`)
	}
}

function parseDueForUpdate(
	raw: FormDataEntryValue | null
): Date | null | undefined {
	if (raw === null) return undefined
	if (typeof raw !== 'string') return undefined
	const t = raw.trim()
	if (t === '') return null
	const d = dueDateFromYmd(t)
	return d === null ? undefined : d
}

export async function createTaskAction(formData: FormData) {
	const session = await auth()
	const userId = session?.user?.id

	const gate = assertCan(userId, 'create', { type: 'task', own: true })
	if (!gate.ok) return { ok: false as const, error: gate.error }

	const parsed = createTaskSchema.safeParse({
		title: formData.get('title'),
		description: formData.get('description') ?? '',
		status: formData.get('status') ?? undefined,
		priority: formData.get('priority') ?? undefined,
		dueDate: formData.get('dueDate') ?? '',
	})

	if (!parsed.success) {
		return {
			ok: false as const,
			error: parsed.error.flatten().fieldErrors.title?.[0] ?? '校验失败',
		}
	}

	const { title, description, status, priority, dueDate: dueYmd } = parsed.data
	const dueDateResolved =
		dueYmd && dueYmd.trim() ? (dueDateFromYmd(dueYmd) ?? null) : null
	const projectIdRaw = formData.get('projectId')
	const projectId =
		typeof projectIdRaw === 'string' && projectIdRaw.length > 0
			? projectIdRaw
			: null

	if (projectId) {
		const project = await prisma.project.findUnique({
			where: { id: projectId },
			select: { userId: true },
		})
		if (!project) {
			return { ok: false as const, error: '项目不存在' }
		}
		if (!can(userId, 'update', { type: 'project', ownerId: project.userId })) {
			return { ok: false as const, error: '无权限在该项目下创建任务' }
		}
	}

	const assignToMe =
		formData.get('assignToMe') === 'on' ||
		formData.get('assignToMe') === 'true'

	await prisma.task.create({
		data: {
			title,
			description: description?.trim() ? description.trim() : null,
			status: status ?? 'todo',
			priority: priority ?? ('none' as TaskPriority),
			dueDate: dueDateResolved,
			userId: userId!,
			projectId,
			assigneeId: assignToMe ? userId! : null,
		},
	})

	revalidateTaskViews(projectId)
	return { ok: true as const }
}

export async function updateTaskStatusAction(taskId: string, status: string) {
	const session = await auth()
	const userId = session?.user?.id

	if (!userId) return { ok: false as const, error: '未登录' }

	const parsed = updateTaskSchema.safeParse({ id: taskId, status })
	if (!parsed.success) {
		return { ok: false as const, error: '状态不合法' }
	}

	const existing = await prisma.task.findUnique({
		where: { id: taskId },
		select: { userId: true, projectId: true },
	})
	if (!existing) {
		return { ok: false as const, error: '任务不存在' }
	}

	const gate = assertCan(userId, 'update', {
		type: 'task',
		ownerId: existing.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error }

	await prisma.task.update({
		where: { id: taskId },
		data: { status: parsed.data.status },
	})

	revalidateTaskViews(existing.projectId)
	return { ok: true as const }
}

export async function updateTaskAction(formData: FormData) {
	const session = await auth()
	const userId = session?.user?.id

	if (!userId) return { ok: false as const, error: '未登录' }

	const parsed = updateTaskSchema.safeParse({
		id: formData.get('id'),
		title: formData.get('title') ?? undefined,
		description: formData.get('description') ?? '',
		status: formData.get('status') ?? undefined,
		priority: formData.get('priority') ?? undefined,
		dueDate: formData.get('dueDate') ?? '',
	})

	if (!parsed.success) {
		return { ok: false as const, error: '校验失败' }
	}

	const { id, title, description, status, priority } = parsed.data

	const existing = await prisma.task.findUnique({
		where: { id },
		select: { userId: true, projectId: true },
	})
	if (!existing) {
		return { ok: false as const, error: '任务不存在' }
	}

	const gate = assertCan(userId, 'update', {
		type: 'task',
		ownerId: existing.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error }

	const dueParsed = parseDueForUpdate(formData.get('dueDate'))

	const data: {
		title?: string
		description?: string | null
		status?: 'todo' | 'doing' | 'done'
		priority?: TaskPriority
		dueDate?: Date | null
	} = {}
	if (title !== undefined) data.title = title
	if (description !== undefined) {
		data.description = description.trim() ? description.trim() : null
	}
	if (status !== undefined) data.status = status
	if (priority !== undefined) data.priority = priority
	if (dueParsed !== undefined) {
		data.dueDate = dueParsed
	}

	await prisma.task.update({
		where: { id },
		data,
	})

	revalidateTaskViews(existing.projectId)
	return { ok: true as const }
}

export async function setTaskAssigneeAction(
	taskId: string,
	mode: 'unassigned' | 'self',
) {
	const session = await auth()
	const userId = session?.user?.id

	if (!userId) return { ok: false as const, error: '未登录' }

	const existing = await prisma.task.findUnique({
		where: { id: taskId },
		select: { userId: true, projectId: true },
	})
	if (!existing) {
		return { ok: false as const, error: '任务不存在' }
	}

	const gate = assertCan(userId, 'update', {
		type: 'task',
		ownerId: existing.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error }

	// MVP：仅支持将负责人设为当前用户本人或清空（多人指派可后续扩展）
	const assigneeId = mode === 'self' ? userId : null
	if (mode === 'self' && userId !== existing.userId) {
		return { ok: false as const, error: '仅任务所有者可指派给自己' }
	}

	await prisma.task.update({
		where: { id: taskId },
		data: { assigneeId },
	})

	revalidateTaskViews(existing.projectId)
	return { ok: true as const }
}

export async function deleteTaskAction(taskId: string) {
	const session = await auth()
	const userId = session?.user?.id

	if (!userId) return { ok: false as const, error: '未登录' }

	const existing = await prisma.task.findUnique({
		where: { id: taskId },
		select: { userId: true, projectId: true },
	})
	if (!existing) {
		return { ok: false as const, error: '任务不存在' }
	}

	const gate = assertCan(userId, 'delete', {
		type: 'task',
		ownerId: existing.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error }

	await prisma.task.delete({ where: { id: taskId } })

	revalidateTaskViews(existing.projectId)
	return { ok: true as const }
}
