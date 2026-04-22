import Link from 'next/link'
import { auth } from '@/auth'
import { listGlobalTaskActivitiesForUserAction } from '@/app/actions/task-activity'
import { redirect } from 'next/navigation'

export const metadata = {
	title: '全部动态',
	description: '跨任务的活动与审计摘要',
}

export default async function ActivityFeedPage() {
	const session = await auth()
	if (!session?.user?.id) {
		redirect('/login')
	}

	const res = await listGlobalTaskActivitiesForUserAction()
	const items = res.ok ? res.items : []

	return (
		<div>
			<div>
				<p className='font-mono text-xs uppercase tracking-wider text-zinc-400'>
					Activity
				</p>
				<h1 className='mt-1 text-2xl font-semibold tracking-tight text-zinc-900'>
					全部动态
				</h1>
				<p className='mt-2 text-sm text-zinc-500'>
					汇总你名下任务产生的操作记录（与任务详情内「活动流」同源），最近{' '}
					<strong className='font-medium text-zinc-700'>100</strong> 条。
				</p>
			</div>

			{items.length === 0 ? (
				<p className='mt-8 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500'>
					暂无动态。创建或编辑任务后，记录会出现在这里。
				</p>
			) : (
				<ul className='mt-8 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white'>
					{items.map(row => (
						<li key={row.id} className='px-4 py-3 transition hover:bg-zinc-50/80'>
							<div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
								<div className='min-w-0 flex-1'>
									<p className='text-sm text-zinc-800'>
										<span className='font-medium text-zinc-900'>
											{row.actorLabel}
										</span>
										<span> {row.summary}</span>
									</p>
									<p className='mt-1 text-xs text-zinc-500'>
										任务：
										<Link
											href={`/tasks?taskId=${encodeURIComponent(row.taskId)}`}
											className='font-medium text-violet-600 hover:text-violet-700'
										>
											{row.taskTitle}
										</Link>
									</p>
								</div>
								<time
									className='shrink-0 text-[11px] text-zinc-400 sm:pt-0.5'
									dateTime={row.createdAt}
								>
									{new Date(row.createdAt).toLocaleString('zh-CN')}
								</time>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
