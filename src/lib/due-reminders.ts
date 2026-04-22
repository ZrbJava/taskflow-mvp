import { prisma } from '@/lib/db'
import { dueDateFilterFromBucket, formatUtcYmd } from '@/lib/date-query'

/** 今日到期提醒的幂等键（UTC 日历日与任务绑定）。 */
export function dueTodayDedupeKey(params: {
	taskId: string
	userId: string
	dueDate: Date
}): string {
	const ymd = formatUtcYmd(params.dueDate)
	return `due:today:${params.taskId}:${params.userId}:${ymd}`
}

/** 明日到期提醒的幂等键。 */
export function dueTomorrowDedupeKey(params: {
	taskId: string
	userId: string
	dueDate: Date
}): string {
	const ymd = formatUtcYmd(params.dueDate)
	return `due:tomorrow:${params.taskId}:${params.userId}:${ymd}`
}

/**
 * 扫描未完成任务中「今日 / 明日」到期（UTC 日界），写入站内通知；重复键跳过。
 * 由 Vercel Cron 或本地带 `Authorization: Bearer CRON_SECRET` 调用。
 */
export async function runDueReminderNotificationSweep(): Promise<{
	insertedToday: number
	insertedTomorrow: number
}> {
	const [todayTasks, tomorrowTasks] = await Promise.all([
		prisma.task.findMany({
			where: {
				status: { not: 'done' },
				dueDate: dueDateFilterFromBucket('today'),
			},
			select: { id: true, userId: true, dueDate: true },
		}),
		prisma.task.findMany({
			where: {
				status: { not: 'done' },
				dueDate: dueDateFilterFromBucket('tomorrow'),
			},
			select: { id: true, userId: true, dueDate: true },
		}),
	])

	let insertedToday = 0
	let insertedTomorrow = 0

	if (todayTasks.length > 0) {
		const r = await prisma.notification.createMany({
			data: todayTasks.map(t => ({
				userId: t.userId,
				taskId: t.id,
				kind: 'due_today' as const,
				commentId: null,
				dedupeKey: dueTodayDedupeKey({
					taskId: t.id,
					userId: t.userId,
					dueDate: t.dueDate!,
				}),
			})),
			skipDuplicates: true,
		})
		insertedToday = r.count
	}

	if (tomorrowTasks.length > 0) {
		const r = await prisma.notification.createMany({
			data: tomorrowTasks.map(t => ({
				userId: t.userId,
				taskId: t.id,
				kind: 'due_tomorrow' as const,
				commentId: null,
				dedupeKey: dueTomorrowDedupeKey({
					taskId: t.id,
					userId: t.userId,
					dueDate: t.dueDate!,
				}),
			})),
			skipDuplicates: true,
		})
		insertedTomorrow = r.count
	}

	return { insertedToday, insertedTomorrow }
}
