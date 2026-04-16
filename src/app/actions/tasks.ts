'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { createTaskSchema, updateTaskSchema } from '@/lib/validations/task'

function revalidateTaskViews(projectId?: string | null) {
	revalidatePath('/tasks')
	revalidatePath('/dashboard/projects')
	if (projectId) {
		revalidatePath(`/projects/${projectId}`)
	}
}

export async function createTaskAction(formData: FormData) {
	const session = await auth()
	if (!session?.user?.id) {
		return { ok: false as const, error: '未登录' }
	}

	const parsed = createTaskSchema.safeParse({
		title: formData.get('title'),
		description: formData.get('description') ?? '',
		status: formData.get('status') ?? undefined,
	})

	if (!parsed.success) {
		return {
			ok: false as const,
			error: parsed.error.flatten().fieldErrors.title?.[0] ?? '校验失败',
		}
	}

	const { title, description, status } = parsed.data
	const projectIdRaw = formData.get('projectId')
	const projectId =
		typeof projectIdRaw === 'string' && projectIdRaw.length > 0
			? projectIdRaw
			: null

	if (projectId) {
		const project = await prisma.project.findFirst({
			where: { id: projectId, userId: session.user.id },
		})
		if (!project) {
			return { ok: false as const, error: '项目不存在或无权限' }
		}
	}

	await prisma.task.create({
		data: {
			title,
			description: description?.trim() ? description.trim() : null,
			status: status ?? 'todo',
			userId: session.user.id,
			projectId,
		},
	})

	revalidateTaskViews(projectId)
	return { ok: true as const }
}

export async function updateTaskStatusAction(taskId: string, status: string) {
	const session = await auth()
	if (!session?.user?.id) {
		return { ok: false as const, error: '未登录' }
	}

	const parsed = updateTaskSchema.safeParse({ id: taskId, status })
	if (!parsed.success) {
		return { ok: false as const, error: '状态不合法' }
	}

	const existing = await prisma.task.findFirst({
		where: { id: taskId, userId: session.user.id },
		select: { projectId: true },
	})
	if (!existing) {
		return { ok: false as const, error: '任务不存在或无权限' }
	}

	await prisma.task.updateMany({
		where: { id: taskId, userId: session.user.id },
		data: { status: parsed.data.status },
	})

	revalidateTaskViews(existing.projectId)
	return { ok: true as const }
}

export async function updateTaskAction(formData: FormData) {
	const session = await auth()
	if (!session?.user?.id) {
		return { ok: false as const, error: '未登录' }
	}

	const parsed = updateTaskSchema.safeParse({
		id: formData.get('id'),
		title: formData.get('title') ?? undefined,
		description: formData.get('description') ?? '',
		status: formData.get('status') ?? undefined,
	})
	console.log('parsed', parsed)

	if (!parsed.success) {
		return { ok: false as const, error: '校验失败' }
	}

	const { id, title, description, status } = parsed.data
	const data: {
		title?: string
		description?: string | null
		status?: 'todo' | 'doing' | 'done'
	} = {}

	if (title !== undefined) data.title = title
	if (description !== undefined) {
		data.description = description.trim() ? description.trim() : null
	}
	if (status !== undefined) data.status = status

	const existing = await prisma.task.findFirst({
		where: { id, userId: session.user.id },
		select: { projectId: true },
	})
	if (!existing) {
		return { ok: false as const, error: '任务不存在或无权限' }
	}

	await prisma.task.updateMany({
		where: { id, userId: session.user.id },
		data,
	})

	revalidateTaskViews(existing.projectId)
	return { ok: true as const }
}

export async function deleteTaskAction(taskId: string) {
	const session = await auth()
	if (!session?.user?.id) {
		return { ok: false as const, error: '未登录' }
	}

	const existing = await prisma.task.findFirst({
		where: { id: taskId, userId: session.user.id },
		select: { projectId: true },
	})
	if (!existing) {
		return { ok: false as const, error: '任务不存在或无权限' }
	}

	await prisma.task.deleteMany({
		where: { id: taskId, userId: session.user.id },
	})

	revalidateTaskViews(existing.projectId)
	return { ok: true as const }
}
