'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { assertCan } from '@/lib/acl'

export async function listTaskActivitiesForTaskAction(taskId: string) {
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

	const rows = await prisma.taskActivity.findMany({
		where: { taskId },
		orderBy: { createdAt: 'desc' },
		take: 40,
		include: {
			user: { select: { email: true, name: true } },
		},
	})

	return {
		ok: true as const,
		items: rows.map(r => ({
			id: r.id,
			kind: r.kind,
			summary: r.summary,
			createdAt: r.createdAt.toISOString(),
			actorLabel:
				r.user.name?.trim() || r.user.email.split('@')[0] || r.user.email,
		})),
	}
}
