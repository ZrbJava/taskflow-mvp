import { describe, expect, it } from 'vitest'
import { dueTodayDedupeKey, dueTomorrowDedupeKey } from '@/lib/due-reminders'

describe('due reminder dedupe keys', () => {
	it('今日键含 UTC 日历日', () => {
		const dueDate = new Date(Date.UTC(2026, 3, 21, 15, 30, 0))
		expect(
			dueTodayDedupeKey({ taskId: 'task_a', userId: 'user_b', dueDate })
		).toBe('due:today:task_a:user_b:2026-04-21')
	})

	it('明日键与今日键前缀不同', () => {
		const dueDate = new Date(Date.UTC(2026, 3, 22, 0, 0, 0))
		expect(dueTomorrowDedupeKey({ taskId: 't', userId: 'u', dueDate })).toBe(
			'due:tomorrow:t:u:2026-04-22'
		)
	})
})
