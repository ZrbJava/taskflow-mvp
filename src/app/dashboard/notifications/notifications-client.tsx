'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { markNotificationReadAction } from '@/app/actions/notifications'

export type NotificationKindUi = 'mention' | 'due_today' | 'due_tomorrow'

export type NotificationRow = {
	id: string
	readAt: string | null
	createdAt: string
	kind: NotificationKindUi
	taskId: string
	taskTitle: string
	commentSnippet: string | null
	authorLabel: string | null
	commentId: string | null
}

export function NotificationsClient({ items }: { items: NotificationRow[] }) {
	const [pending, startTransition] = useTransition()

	const onOpen = (notificationId: string) => {
		startTransition(() => {
			void markNotificationReadAction(notificationId)
		})
	}

	if (items.length === 0) {
		return (
			<p className='rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500'>
				暂无通知。在任务评论中使用 <span className='font-mono text-violet-600'>@邮箱</span>{' '}
				或 <span className='font-mono text-violet-600'>@显示名</span>{' '}
				可提及他人；截止日当天与前一天也会收到站内提醒（需部署 Cron）。
			</p>
		)
	}

	return (
		<ul className='divide-y divide-zinc-100'>
			{items.map(n => (
				<li key={n.id}>
					<Link
						href={`/tasks?taskId=${encodeURIComponent(n.taskId)}`}
						onClick={() => onOpen(n.id)}
						className={`block px-1 py-3 transition hover:bg-zinc-50 ${
							!n.readAt ? 'bg-violet-50/40' : ''
						} ${pending ? 'pointer-events-none opacity-70' : ''}`}
					>
						{n.kind === 'mention' ? (
							<>
								<p className='text-sm text-zinc-800'>
									<span className='font-medium text-zinc-900'>
										{n.authorLabel ?? '用户'}
									</span>
									<span className='text-zinc-600'> 在 </span>
									<span className='font-medium text-violet-700'>
										「{n.taskTitle}」
									</span>
									<span className='text-zinc-600'> 的评论中提到了你</span>
								</p>
								{n.commentSnippet ? (
									<p className='mt-1 line-clamp-2 text-xs text-zinc-500'>
										{n.commentSnippet}
									</p>
								) : null}
							</>
						) : n.kind === 'due_today' ? (
							<p className='text-sm text-zinc-800'>
								<span className='font-medium text-amber-800'>今日到期</span>
								<span className='text-zinc-600'> · </span>
								<span className='font-medium text-violet-700'>「{n.taskTitle}」</span>
								<span className='text-zinc-600'>
									{' '}
									按 UTC 日历日已到截止日；打开任务处理或调整日期。
								</span>
							</p>
						) : (
							<p className='text-sm text-zinc-800'>
								<span className='font-medium text-zinc-800'>明日到期</span>
								<span className='text-zinc-600'> · </span>
								<span className='font-medium text-violet-700'>「{n.taskTitle}」</span>
								<span className='text-zinc-600'>
									{' '}
									将于明日（UTC）到期，可提前安排。
								</span>
							</p>
						)}
						<p className='mt-1 text-[11px] text-zinc-400'>
							{new Date(n.createdAt).toLocaleString('zh-CN')}
							{!n.readAt ? (
								<span className='ml-2 text-violet-600'>未读</span>
							) : null}
						</p>
					</Link>
				</li>
			))}
		</ul>
	)
}
