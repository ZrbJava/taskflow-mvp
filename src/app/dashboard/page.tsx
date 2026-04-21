import {
	AlarmClock,
	ArrowRight,
	CircleCheck,
	CircleDashed,
	CircleDot,
	LayoutGrid,
	LineChart,
	List,
	ListChecks,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { StatCard } from '@/components/insights/stat-card'
import { prisma } from '@/lib/db'

const btnPrimary =
	'inline-flex items-center justify-center gap-1.5 rounded-lg bg-linear-to-b from-violet-500 to-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm outline-none transition hover:from-violet-500 hover:to-violet-700 focus-visible:ring-2 focus-visible:ring-violet-500/40'
const btnSecondary =
	'inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 outline-none transition hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-violet-500/30'
const btnOutline =
	'inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 outline-none transition hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-violet-500/30'

export const metadata = {
	title: '仪表盘',
	description: '任务概览、快捷入口与最近项目',
}

function startOfTodayUtc(): Date {
	const d = new Date()
	return new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
	)
}

export default async function DashboardPage() {
	const session = await auth()
	if (!session?.user?.id) {
		redirect('/login')
	}
	const userId = session.user.id
	const dayStartUtc = startOfTodayUtc()

	const [totalTasks, todoTasks, doingTasks, doneTasks, overdueTasks, projects] =
		await Promise.all([
			prisma.task.count({ where: { userId } }),
			prisma.task.count({ where: { userId, status: 'todo' } }),
			prisma.task.count({ where: { userId, status: 'doing' } }),
			prisma.task.count({ where: { userId, status: 'done' } }),
			prisma.task.count({
				where: {
					userId,
					status: { not: 'done' },
					dueDate: { lt: dayStartUtc },
				},
			}),
			prisma.project.findMany({
				where: { userId },
				orderBy: { updatedAt: 'desc' },
				take: 5,
				select: {
					id: true,
					name: true,
					updatedAt: true,
					_count: { select: { tasks: true } },
				},
			}),
		])

	const doneRate =
		totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)

	return (
		<div>
			<div>
				<p className='font-mono text-xs uppercase tracking-wider text-zinc-400'>
					Dashboard
				</p>
				<h1 className='mt-1 text-2xl font-semibold tracking-tight text-zinc-900'>
					工作台
				</h1>
				<p className='mt-2 text-sm text-zinc-500'>
					对标 Linear / Jira 类产品的「首页」：一眼看到体量、快捷进入列表或看板、跳到洞察。
				</p>
			</div>

			<div className='mt-6 flex flex-wrap gap-2'>
				<Link href='/tasks' className={btnPrimary}>
					<List className='h-3.5 w-3.5' />
					任务列表
				</Link>
				<Link href='/tasks?view=board' className={btnSecondary}>
					<LayoutGrid className='h-3.5 w-3.5' />
					看板
				</Link>
				<Link href='/dashboard/insights' className={btnSecondary}>
					<LineChart className='h-3.5 w-3.5' />
					数据洞察
				</Link>
				<Link href='/tasks?compose=1' className={btnOutline}>
					新建任务
					<ArrowRight className='h-3.5 w-3.5' />
				</Link>
			</div>

			{overdueTasks > 0 ? (
				<Link
					href='/tasks'
					className='mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 transition hover:border-amber-300'
				>
					<AlarmClock className='h-4 w-4 shrink-0 text-amber-600' />
					<span>
						<span className='font-medium'>{overdueTasks}</span>{' '}
						条未完成任务已逾期（按 UTC 日界），可在任务页筛选处理。
					</span>
					<ArrowRight className='ml-auto h-4 w-4 shrink-0 text-amber-700' />
				</Link>
			) : null}

			<div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
				<Link
					href='/tasks'
					className='block rounded-xl outline-none ring-offset-2 transition hover:ring-2 hover:ring-violet-400/40 focus-visible:ring-2 focus-visible:ring-violet-500'
					aria-label={`全部任务 ${totalTasks}，完成率 ${doneRate}%`}
				>
					<StatCard
						label='全部任务'
						value={totalTasks}
						icon={ListChecks}
						hint={`完成率 ${doneRate}%`}
						accent='violet'
					/>
				</Link>
				<Link
					href='/tasks?status=todo'
					className='block rounded-xl outline-none ring-offset-2 transition hover:ring-2 hover:ring-violet-400/40 focus-visible:ring-2 focus-visible:ring-violet-500'
					aria-label={`待处理 ${todoTasks}`}
				>
					<StatCard
						label='待处理'
						value={todoTasks}
						icon={CircleDot}
						accent='zinc'
					/>
				</Link>
				<Link
					href='/tasks?status=doing'
					className='block rounded-xl outline-none ring-offset-2 transition hover:ring-2 hover:ring-violet-400/40 focus-visible:ring-2 focus-visible:ring-violet-500'
					aria-label={`进行中 ${doingTasks}`}
				>
					<StatCard
						label='进行中'
						value={doingTasks}
						icon={CircleDashed}
						accent='amber'
					/>
				</Link>
				<Link
					href='/tasks?status=done'
					className='block rounded-xl outline-none ring-offset-2 transition hover:ring-2 hover:ring-violet-400/40 focus-visible:ring-2 focus-visible:ring-violet-500'
					aria-label={`已完成 ${doneTasks}`}
				>
					<StatCard
						label='已完成'
						value={doneTasks}
						icon={CircleCheck}
						accent='emerald'
					/>
				</Link>
			</div>

			<div className='mt-8 border-t border-zinc-100 pt-6'>
				<div className='flex flex-wrap items-end justify-between gap-3'>
					<div>
						<p className='text-sm font-medium text-zinc-900'>最近项目</p>
						<p className='mt-0.5 text-xs text-zinc-500'>
							与「项目」页一致的数据，按最近更新时间。
						</p>
					</div>
					<Link
						href='/dashboard/projects'
						className='text-sm font-medium text-violet-600 hover:text-violet-700'
					>
						全部项目 →
					</Link>
				</div>

				{projects.length === 0 ? (
					<p className='mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center text-sm text-zinc-500'>
						暂无项目。
						<Link
							href='/dashboard/projects'
							className='font-medium text-violet-600 hover:underline'
						>
							去创建
						</Link>
					</p>
				) : (
					<ul className='mt-4 grid gap-2 sm:grid-cols-2'>
						{projects.map(p => (
							<li key={p.id}>
								<Link
									href={`/projects/${p.id}`}
									className='flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-violet-300 hover:shadow-sm'
								>
									<span className='min-w-0 truncate text-sm font-medium text-zinc-900'>
										{p.name}
									</span>
									<span className='shrink-0 text-xs tabular-nums text-zinc-500'>
										{p._count.tasks} 个任务
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	)
}
