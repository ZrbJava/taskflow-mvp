import { NextResponse } from 'next/server'
import { runDueReminderNotificationSweep } from '@/lib/due-reminders'

export const dynamic = 'force-dynamic'

/**
 * Vercel Cron：每日 UTC 0 点触发（见根目录 `vercel.json`）。
 * 需在环境变量中配置 `CRON_SECRET`；请求头 `Authorization: Bearer <CRON_SECRET>`。
 */
export async function GET(request: Request) {
	const secret = process.env.CRON_SECRET
	if (!secret) {
		return NextResponse.json(
			{ ok: false as const, error: 'CRON_SECRET 未配置' },
			{ status: 500 }
		)
	}

	const auth = request.headers.get('authorization')
	if (auth !== `Bearer ${secret}`) {
		return new NextResponse('Unauthorized', { status: 401 })
	}

	const { insertedToday, insertedTomorrow } =
		await runDueReminderNotificationSweep()

	return NextResponse.json({
		ok: true as const,
		insertedToday,
		insertedTomorrow,
	})
}
