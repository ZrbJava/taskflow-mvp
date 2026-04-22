'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { assertCan } from '@/lib/acl'
import { createMentionNotificationsForComment } from '@/app/actions/notifications'

function revalidateTaskThread(projectId?: string | null) {
	revalidatePath('/tasks')
	if (projectId) revalidatePath(`/projects/${projectId}`)
}

export async function addCommentAction(taskId: string, body: string) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录' }

	const trimmed = body.trim()
	if (trimmed.length < 1 || trimmed.length > 8000) {
		return { ok: false as const, error: '内容长度 1–8000 字符' }
	}

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

	const comment = await prisma.comment.create({
		data: {
			taskId,
			userId,
			body: trimmed,
		},
		select: { id: true },
	})

	await createMentionNotificationsForComment({
		body: trimmed,
		authorId: userId,
		taskId,
		commentId: comment.id,
	})

	revalidateTaskThread(task.projectId)
	return { ok: true as const }
}

export async function deleteCommentAction(commentId: string) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录' }

	const c = await prisma.comment.findUnique({
		where: { id: commentId },
		select: {
			userId: true,
			task: { select: { userId: true, projectId: true } },
		},
	})
	if (!c) return { ok: false as const, error: '评论不存在' }

	if (c.userId !== userId) {
		return { ok: false as const, error: '只能删除自己的评论' }
	}

	await prisma.comment.delete({ where: { id: commentId } })
	revalidateTaskThread(c.task.projectId)
	return { ok: true as const }
}

export async function listCommentsForTaskAction(taskId: string) {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录', comments: [] }

	const task = await prisma.task.findUnique({
		where: { id: taskId },
		select: { userId: true },
	})
	if (!task) return { ok: false as const, error: '任务不存在', comments: [] }

	const gate = assertCan(userId, 'read', {
		type: 'task',
		ownerId: task.userId,
	})
	if (!gate.ok) return { ok: false as const, error: gate.error, comments: [] }

	const comments = await prisma.comment.findMany({
		where: { taskId },
		orderBy: { createdAt: 'asc' },
		select: {
			id: true,
			body: true,
			createdAt: true,
			user: { select: { email: true } },
		},
	})

	return {
		ok: true as const,
		comments: comments.map(c => ({
			id: c.id,
			body: c.body,
			createdAt: c.createdAt.toISOString(),
			authorEmail: c.user.email,
		})),
	}
}
