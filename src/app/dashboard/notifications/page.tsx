import { auth } from '@/auth'
import { listNotificationsAction, markAllNotificationsReadAction } from '@/app/actions/notifications'
import { NotificationsClient } from '@/app/dashboard/notifications/notifications-client'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export const metadata = {
	title: '通知',
	description: '评论 @ 提及、截止日站内提醒与未读通知',
}

export default async function NotificationsPage() {
	const session = await auth()
	if (!session?.user?.id) {
		redirect('/login')
	}

	const res = await listNotificationsAction()
	const items = res.ok ? res.items : []

	return (
		<div>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div>
					<p className='font-mono text-xs uppercase tracking-wider text-zinc-400'>
						Notifications
					</p>
					<h1 className='mt-1 text-2xl font-semibold tracking-tight text-zinc-900'>
						通知
					</h1>
					<p className='mt-2 text-sm text-zinc-500'>
						评论中使用 <code className='rounded bg-zinc-100 px-1 text-xs'>@完整邮箱</code> 或{' '}
						<code className='rounded bg-zinc-100 px-1 text-xs'>@账户显示名</code>{' '}
						提及已注册用户；对方将收到一条站内通知。未完成任务在截止日当天与前一天（UTC）也会收到提醒（需配置{' '}
						<code className='rounded bg-zinc-100 px-1 text-xs'>CRON_SECRET</code> 并部署 Cron）。
					</p>
				</div>
				<form action={markAllNotificationsReadAction}>
					<Button type='submit' variant='secondary' className='text-sm'>
						全部标为已读
					</Button>
				</form>
			</div>

			<div className='mt-8'>
				<NotificationsClient items={items} />
			</div>
		</div>
	)
}
