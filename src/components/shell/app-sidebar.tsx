'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
	Columns2,
	Inbox,
	LayoutGrid,
	FolderKanban,
	Info,
	LineChart,
	LogOut,
	CircleDot,
	Bell,
	History,
	Search,
	Sparkles,
	Tag,
} from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'

interface SidebarProject {
	id: string
	name: string
}

interface AppSidebarProps {
	userEmail?: string | null
	projects: SidebarProject[]
	unreadNotificationCount?: number
}

const NAV_ITEMS = [
	{ href: '/dashboard', label: '概览', icon: LayoutGrid, exact: true },
	{
		href: '/dashboard/projects',
		label: '项目列表',
		icon: FolderKanban,
		exact: false,
	},
	{ href: '/dashboard/labels', label: '标签', icon: Tag, exact: true },
	{
		href: '/dashboard/insights',
		label: '数据洞察',
		icon: LineChart,
		exact: true,
	},
	{
		href: '/dashboard/activity',
		label: '全部动态',
		icon: History,
		exact: true,
	},
	{ href: '/about', label: '关于', icon: Info, exact: true },
]

function isActive(pathname: string, href: string, exact: boolean): boolean {
	if (exact) return pathname === href
	return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({
	userEmail,
	projects,
	unreadNotificationCount = 0,
}: AppSidebarProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const tasksView = searchParams.get('view')
	/** 与「任务 / 项目内任务」列表、看板对应（对标多入口统一高亮） */
	const isTaskSurface =
		pathname === '/tasks' || /^\/projects\/[^/]+$/.test(pathname)
	const tasksListActive = isTaskSurface && tasksView !== 'board'
	const tasksBoardActive = isTaskSurface && tasksView === 'board'

	return (
		<aside className='sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex'>
			<div className='relative flex items-center gap-2 overflow-hidden border-b border-zinc-200 px-4 py-3'>
				<div
					aria-hidden
					className='pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl'
				/>
				<div
					aria-hidden
					className='pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl'
				/>
				<div className='relative flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-indigo-500 text-white shadow-sm shadow-violet-500/30'>
					<Sparkles className='h-4 w-4' />
				</div>
				<div className='relative flex min-w-0 flex-col'>
					<span className='truncate text-sm font-semibold'>TaskFlow</span>
					<span className='truncate text-xs text-zinc-500'>
						{userEmail ?? '未登录'}
					</span>
				</div>
			</div>

			<div className='px-3 pt-3'>
				<button
					type='button'
					onClick={() => {
						const event = new KeyboardEvent('keydown', {
							key: 'k',
							metaKey: true,
							bubbles: true,
						})
						window.dispatchEvent(event)
					}}
					className='group flex w-full items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50/80 px-2.5 py-1.5 text-sm text-zinc-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-zinc-700'
				>
					<Search className='h-3.5 w-3.5' />
					<span className='flex-1 text-left'>搜索 / 跳转</span>
					<kbd className='rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 group-hover:border-violet-300'>
						⌘K
					</kbd>
				</button>
			</div>

			<nav className='flex-1 overflow-y-auto px-2 py-3 text-sm'>
				<div className='px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400'>
					工作区
				</div>
				<ul className='space-y-0.5'>
					<li>
						<Link
							href='/tasks'
							className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100 ${
								tasksListActive
									? 'bg-violet-50 font-medium text-violet-700'
									: ''
							}`}
						>
							<Inbox
								className={`h-4 w-4 ${
									tasksListActive ? 'text-violet-500' : 'text-zinc-500'
								}`}
							/>
							收件箱
						</Link>
					</li>
					<li>
						<Link
							href='/tasks?view=board'
							className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100 ${
								tasksBoardActive
									? 'bg-violet-50 font-medium text-violet-700'
									: ''
							}`}
						>
							<Columns2
								className={`h-4 w-4 ${
									tasksBoardActive ? 'text-violet-500' : 'text-zinc-500'
								}`}
							/>
							看板
						</Link>
					</li>
					<li>
						<Link
							href='/dashboard/notifications'
							className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100 ${
								pathname === '/dashboard/notifications'
									? 'bg-violet-50 font-medium text-violet-700'
									: ''
							}`}
						>
							<Bell
								className={`h-4 w-4 ${
									pathname === '/dashboard/notifications'
										? 'text-violet-500'
										: 'text-zinc-500'
								}`}
							/>
							<span className='flex-1'>通知</span>
							{unreadNotificationCount > 0 ? (
								<span className='min-w-[1.25rem] rounded-full bg-violet-600 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white'>
									{unreadNotificationCount > 99
										? '99+'
										: unreadNotificationCount}
								</span>
							) : null}
						</Link>
					</li>
					{NAV_ITEMS.map(item => {
						const Icon = item.icon
						const active = isActive(pathname, item.href, item.exact)
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100 ${
										active ? 'bg-violet-50 font-medium text-violet-700' : ''
									}`}
								>
									<Icon
										className={`h-4 w-4 ${
											active ? 'text-violet-500' : 'text-zinc-500'
										}`}
									/>
									{item.label}
								</Link>
							</li>
						)
					})}
				</ul>

				{projects.length > 0 ? (
					<>
						<div className='mt-5 px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400'>
							我的项目
						</div>
						<ul className='space-y-0.5'>
							{projects.map(project => {
								const href = `/projects/${project.id}`
								const active = pathname === href
								return (
									<li key={project.id}>
										<Link
											href={href}
											className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100 ${
												active ? 'bg-violet-50 font-medium text-violet-700' : ''
											}`}
										>
											<CircleDot
												className={`h-3.5 w-3.5 ${
													active ? 'text-violet-500' : 'text-zinc-400'
												}`}
											/>
											<span className='truncate'>{project.name}</span>
										</Link>
									</li>
								)
							})}
						</ul>
					</>
				) : null}
			</nav>

			<form
				action={signOutAction}
				className='border-t border-zinc-200 px-3 py-3'
			>
				<button
					type='submit'
					className='inline-flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
				>
					<LogOut className='h-4 w-4' />
					退出登录
				</button>
			</form>
		</aside>
	)
}
