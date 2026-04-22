'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { extractMentionQueries } from '@/lib/mentions'

export async function resolveMentionRecipientIds(
	body: string,
	authorId: string
): Promise<string[]> {
	const queries = extractMentionQueries(body)
	const ids = new Set<string>()

	for (const q of queries) {
		const user = q.includes('@')
			? await prisma.user.findFirst({
					where: { email: { equals: q, mode: 'insensitive' } },
					select: { id: true },
				})
			: await prisma.user.findFirst({
					where: { name: { equals: q, mode: 'insensitive' } },
					select: { id: true },
				})
		if (user && user.id !== authorId) {
			ids.add(user.id)
		}
	}

	return [...ids]
}

export async function createMentionNotificationsForComment(params: {
	body: string
	authorId: string
	taskId: string
	commentId: string
}) {
	const recipientIds = await resolveMentionRecipientIds(
		params.body,
		params.authorId
	)
	if (recipientIds.length === 0) return

	await prisma.notification.createMany({
		data: recipientIds.map(userId => ({
			userId,
			taskId: params.taskId,
			commentId: params.commentId,
		})),
		skipDuplicates: true,
	})

	revalidatePath('/dashboard/notifications')
}

export async function listNotificationsAction() {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return { ok: false as const, error: '未登录', items: [] }

	const rows = await prisma.notification.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		take: 80,
		include: {
			task: { select: { id: true, title: true } },
			comment: {
				select: {
					id: true,
					body: true,
					user: { select: { email: true, name: true } },
				},
			},
		},
	})

	return {
		ok: true as const,
		items: rows.map(n => ({
			id: n.id,
			readAt: n.readAt?.toISOString() ?? null,
			createdAt: n.createdAt.toISOString(),
			taskId: n.task.id,
			taskTitle: n.task.title,
			commentId: n.comment.id,
			commentSnippet: n.comment.body.slice(0, 160),
			authorLabel:
				n.comment.user.name?.trim() || n.comment.user.email.split('@')[0],
		})),
	}
}

export async function markNotificationReadAction(
	notificationId: string
): Promise<void> {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return

	const n = await prisma.notification.findUnique({
		where: { id: notificationId },
		select: { userId: true },
	})
	if (!n || n.userId !== userId) return

	await prisma.notification.update({
		where: { id: notificationId },
		data: { readAt: new Date() },
	})

	revalidatePath('/dashboard/notifications')
}

export async function markAllNotificationsReadAction(): Promise<void> {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return

	await prisma.notification.updateMany({
		where: { userId, readAt: null },
		data: { readAt: new Date() },
	})

	revalidatePath('/dashboard/notifications')
}

export async function getUnreadNotificationCountAction(): Promise<number> {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) return 0

	return prisma.notification.count({
		where: { userId, readAt: null },
	})
}
