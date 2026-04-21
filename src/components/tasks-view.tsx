'use client'

import {
	CalendarRange,
	LayoutGrid,
	List,
	Search,
	SlidersHorizontal,
	X,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { utcTodayYmd, utcYmdDaysAgo } from '@/lib/date-query'
import { PRIORITY_LABEL } from '@/lib/task-priority'
import type { TaskListItem } from '@/types/task'
import {
	TaskStatusFilter,
	type TaskFilterValue,
} from '@/components/task-status-filter'
import { TaskRow } from '@/components/task-row'
import { TasksBoard } from '@/components/tasks-board'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface ProjectOption {
	id: string
	name: string
}

interface CurrentQuery {
	keyword: string
	status: string
	projectId: string
	sort: string
	dateFrom: string
	dateTo: string
	priority: string
	/** 仅 `/tasks`：`list` | `board` */
	view: 'list' | 'board'
}

interface TasksViewProps {
	tasks: TaskListItem[]
	projects: ProjectOption[]
	currentQuery: CurrentQuery
	/** 来自 `/tasks?taskId=`，用于命令面板等深链打开详情抽屉 */
	openTaskId?: string
}

const SORT_OPTIONS: { value: string; label: string }[] = [
	{ value: 'updated_desc', label: '最近更新' },
	{ value: 'updated_asc', label: '最早更新' },
	{ value: 'created_desc', label: '最新创建' },
	{ value: 'created_asc', label: '最早创建' },
	{ value: 'due_asc', label: '截止 ↑（最早在前）' },
	{ value: 'due_desc', label: '截止 ↓（最晚在前）' },
]

const STATUS_CHIP: Record<string, string> = {
	todo: '待处理',
	doing: '进行中',
	done: '已完成',
}

function buildQueryString(params: Record<string, string>): string {
	const search = new URLSearchParams()
	Object.entries(params).forEach(([key, value]) => {
		if (!value) return
		if (key === 'status' && value === 'all') return
		if (key === 'projectId' && value === 'all') return
		if (key === 'sort' && value === 'updated_desc') return
		if ((key === 'dateFrom' || key === 'dateTo') && !value) return
		if (key === 'priority' && value === 'all') return
		if (key === 'view' && value === 'list') return
		search.set(key, value)
	})
	const qs = search.toString()
	return qs ? `?${qs}` : ''
}

export function TasksView({
	tasks,
	projects,
	currentQuery,
	openTaskId,
}: TasksViewProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [pending, startTransition] = useTransition()

	const stripTaskIdFromUrl = () => {
		if (!searchParams.get('taskId')) return
		const next = new URLSearchParams(searchParams.toString())
		next.delete('taskId')
		const qs = next.toString()
		router.replace(qs ? `${pathname}?${qs}` : pathname)
	}

	const keywordRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (pathname !== '/tasks') return
			const el = e.target as HTMLElement | null
			if (!el) return
			const inField =
				el.tagName === 'INPUT' ||
				el.tagName === 'TEXTAREA' ||
				el.tagName === 'SELECT' ||
				el.isContentEditable

			if (e.metaKey || e.ctrlKey || e.altKey) return

			if (!inField && (e.key === 'f' || e.key === 'F')) {
				e.preventDefault()
				keywordRef.current?.focus()
				return
			}

			if (inField) return

			if (e.key === 'c' || e.key === 'C') {
				e.preventDefault()
				const next = new URLSearchParams(searchParams.toString())
				next.set('compose', '1')
				const q = next.toString()
				startTransition(() => {
					router.push(q ? `/tasks?${q}` : '/tasks?compose=1')
				})
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [pathname, router, searchParams])

	const [keyword, setKeyword] = useState(currentQuery.keyword)
	const [status, setStatus] = useState<TaskFilterValue>(
		(currentQuery.status as TaskFilterValue) || 'all'
	)
	const [projectId, setProjectId] = useState(currentQuery.projectId || 'all')
	const [sort, setSort] = useState(currentQuery.sort || 'updated_desc')
	const [dateFrom, setDateFrom] = useState(currentQuery.dateFrom || '')
	const [dateTo, setDateTo] = useState(currentQuery.dateTo || '')
	const [priority, setPriority] = useState(currentQuery.priority || 'all')
	const [view, setView] = useState<'list' | 'board'>(
		currentQuery.view ?? 'list'
	)

	useEffect(() => {
		setKeyword(currentQuery.keyword)
		setStatus((currentQuery.status as TaskFilterValue) || 'all')
		setProjectId(currentQuery.projectId || 'all')
		setSort(currentQuery.sort || 'updated_desc')
		setDateFrom(currentQuery.dateFrom || '')
		setDateTo(currentQuery.dateTo || '')
		setPriority(currentQuery.priority || 'all')
		setView(currentQuery.view ?? 'list')
	}, [
		currentQuery.keyword,
		currentQuery.status,
		currentQuery.projectId,
		currentQuery.sort,
		currentQuery.dateFrom,
		currentQuery.dateTo,
		currentQuery.priority,
		currentQuery.view,
	])

	const applyQuery = (next: Partial<CurrentQuery>) => {
		const merged: Record<string, string> = {
			keyword,
			status,
			projectId,
			sort,
			dateFrom,
			dateTo,
			priority,
			view,
			...next,
		}
		const qs = buildQueryString(merged)
		startTransition(() => {
			router.push(`/tasks${qs}`)
		})
	}

	const onKeywordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		applyQuery({ keyword: keyword.trim() })
	}

	const resetAll = () => {
		setKeyword('')
		setStatus('all')
		setProjectId('all')
		setSort('updated_desc')
		setDateFrom('')
		setDateTo('')
		setPriority('all')
		setView('list')
		startTransition(() => {
			router.push('/tasks')
		})
	}

	const applyPresetDays = (days: number) => {
		const to = utcTodayYmd()
		const from = utcYmdDaysAgo(days - 1)
		setDateFrom(from)
		setDateTo(to)
		applyQuery({ dateFrom: from, dateTo: to })
	}

	const clearDateRange = () => {
		setDateFrom('')
		setDateTo('')
		applyQuery({ dateFrom: '', dateTo: '' })
	}

	const hasActiveFilters =
		status !== 'all' ||
		projectId !== 'all' ||
		(currentQuery.keyword && currentQuery.keyword.length > 0) ||
		sort !== 'updated_desc' ||
		Boolean(currentQuery.dateFrom) ||
		Boolean(currentQuery.dateTo) ||
		currentQuery.priority !== 'all' ||
		(pathname === '/tasks' && currentQuery.view === 'board')

	const sortLabel =
		SORT_OPTIONS.find(o => o.value === currentQuery.sort)?.label ?? '最近更新'

	const projectLabel =
		currentQuery.projectId !== 'all'
			? projects.find(p => p.id === currentQuery.projectId)?.name
			: undefined

	return (
		<div className='space-y-4'>
			<div className='rounded-xl border border-zinc-200 bg-white p-4 shadow-sm'>
				<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
					<div>
						<div className='flex items-center gap-2'>
							<p className='text-sm font-medium text-zinc-700'>任务工具栏</p>
							<Badge variant='secondary'>服务端筛选</Badge>
						</div>
						<p className='mt-1 text-sm text-zinc-500'>
							对标 Linear：高密度列表 + 可分享
							URL；「更新日期」按任务最近更新时间过滤。
						</p>
					</div>
					<div className='flex flex-wrap items-center gap-2'>
						{pathname === '/tasks' ? (
							<div className='flex rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5'>
								<button
									type='button'
									onClick={() => {
										setView('list')
										applyQuery({ view: 'list' })
									}}
									className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
										view === 'list'
											? 'bg-white text-zinc-900 shadow-sm'
											: 'text-zinc-500 hover:text-zinc-800'
									}`}
								>
									<List className='h-3.5 w-3.5' />
									列表
								</button>
								<button
									type='button'
									onClick={() => {
										setView('board')
										applyQuery({ view: 'board' })
									}}
									className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
										view === 'board'
											? 'bg-white text-zinc-900 shadow-sm'
											: 'text-zinc-500 hover:text-zinc-800'
									}`}
								>
									<LayoutGrid className='h-3.5 w-3.5' />
									看板
								</button>
							</div>
						) : null}
						<Badge variant='secondary'>{tasks.length} 条结果</Badge>
						{hasActiveFilters ? (
							<Button
								type='button'
								variant='ghost'
								className='gap-2 rounded-lg px-3'
								onClick={resetAll}
								disabled={pending}
							>
								<X className='h-4 w-4' />
								清空
							</Button>
						) : null}
					</div>
				</div>

				<form
					onSubmit={onKeywordSubmit}
					className='mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]'
				>
					<label className='relative block'>
						<Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
						<Input
							ref={keywordRef}
							id='tasks-keyword-filter'
							value={keyword}
							onChange={e => setKeyword(e.target.value)}
							placeholder='搜索标题或描述，回车应用'
							className='pl-9'
						/>
					</label>

					<Select
						value={projectId}
						onValueChange={value => {
							setProjectId(value)
							applyQuery({ projectId: value })
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder='选择项目' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>全部项目</SelectItem>
							{projects.map(project => (
								<SelectItem key={project.id} value={project.id}>
									{project.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={sort}
						onValueChange={value => {
							setSort(value)
							applyQuery({ sort: value })
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder='排序' />
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTIONS.map(opt => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Popover>
						<PopoverTrigger asChild>
							<Button
								type='button'
								variant='secondary'
								className='justify-center gap-2 rounded-lg px-4'
							>
								<SlidersHorizontal className='h-4 w-4' />
								筛选
							</Button>
						</PopoverTrigger>
						<PopoverContent align='end' className='w-[min(100vw-2rem,22rem)]'>
							<p className='text-sm font-medium text-zinc-800'>优先级</p>
							<Select
								value={priority}
								onValueChange={value => {
									setPriority(value)
									applyQuery({ priority: value })
								}}
							>
								<SelectTrigger className='mt-2'>
									<SelectValue placeholder='全部' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>全部</SelectItem>
									<SelectItem value='none'>无</SelectItem>
									<SelectItem value='low'>低</SelectItem>
									<SelectItem value='medium'>中</SelectItem>
									<SelectItem value='high'>高</SelectItem>
									<SelectItem value='urgent'>紧急</SelectItem>
								</SelectContent>
							</Select>

							<p className='mt-5 text-sm font-medium text-zinc-800'>状态</p>
							<div className='mt-3'>
								<TaskStatusFilter
									value={status}
									onChange={value => {
										setStatus(value)
										applyQuery({ status: value })
									}}
								/>
							</div>

							<div className='mt-5 border-t border-zinc-100 pt-4'>
								<p className='flex items-center gap-2 text-sm font-medium text-zinc-800'>
									<CalendarRange className='h-4 w-4 text-zinc-500' />
									更新日期
								</p>
								<p className='mt-1 text-xs text-zinc-500'>
									按{' '}
									<span className='font-medium text-zinc-600'>updatedAt</span>{' '}
									落在区间内筛选（UTC 日界）。
								</p>
								<div className='mt-3 flex flex-wrap gap-2'>
									<Button
										type='button'
										variant='secondary'
										className='h-8 rounded-md px-2.5 text-xs'
										onClick={() => applyPresetDays(7)}
									>
										近 7 天
									</Button>
									<Button
										type='button'
										variant='secondary'
										className='h-8 rounded-md px-2.5 text-xs'
										onClick={() => applyPresetDays(30)}
									>
										近 30 天
									</Button>
									<Button
										type='button'
										variant='ghost'
										className='h-8 rounded-md px-2.5 text-xs text-zinc-600'
										onClick={clearDateRange}
									>
										清除日期
									</Button>
								</div>
								<div className='mt-3 grid gap-2 sm:grid-cols-2'>
									<label className='block text-xs font-medium text-zinc-600'>
										从
										<input
											type='date'
											value={dateFrom}
											onChange={e => {
												const v = e.target.value
												setDateFrom(v)
												applyQuery({ dateFrom: v })
											}}
											className='mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30'
										/>
									</label>
									<label className='block text-xs font-medium text-zinc-600'>
										到
										<input
											type='date'
											value={dateTo}
											onChange={e => {
												const v = e.target.value
												setDateTo(v)
												applyQuery({ dateTo: v })
											}}
											className='mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30'
										/>
									</label>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</form>
				{pathname === '/tasks' ? (
					<p className='mt-3 text-xs text-zinc-400'>
						快捷键：
						<kbd className='mx-0.5 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600'>
							C
						</kbd>
						新建 ·
						<kbd className='mx-0.5 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600'>
							F
						</kbd>
						聚焦搜索（非输入框时）。
					</p>
				) : null}
			</div>

			{hasActiveFilters ? (
				<div className='flex flex-wrap items-center gap-2'>
					<span className='text-xs font-medium uppercase tracking-wide text-zinc-400'>
						筛选
					</span>
					{currentQuery.keyword ? (
						<FilterChip
							label={`关键词：${currentQuery.keyword}`}
							onRemove={() => {
								setKeyword('')
								applyQuery({ keyword: '' })
							}}
						/>
					) : null}
					{currentQuery.status !== 'all' ? (
						<FilterChip
							label={`状态：${STATUS_CHIP[currentQuery.status] ?? currentQuery.status}`}
							onRemove={() => {
								setStatus('all')
								applyQuery({ status: 'all' })
							}}
						/>
					) : null}
					{currentQuery.projectId !== 'all' && projectLabel ? (
						<FilterChip
							label={`项目：${projectLabel}`}
							onRemove={() => {
								setProjectId('all')
								applyQuery({ projectId: 'all' })
							}}
						/>
					) : null}
					{currentQuery.sort !== 'updated_desc' ? (
						<FilterChip
							label={`排序：${sortLabel}`}
							onRemove={() => {
								setSort('updated_desc')
								applyQuery({ sort: 'updated_desc' })
							}}
						/>
					) : null}
					{currentQuery.priority !== 'all' ? (
						<FilterChip
							label={`优先级：${PRIORITY_LABEL[currentQuery.priority as keyof typeof PRIORITY_LABEL] ?? currentQuery.priority}`}
							onRemove={() => {
								setPriority('all')
								applyQuery({ priority: 'all' })
							}}
						/>
					) : null}
					{currentQuery.dateFrom || currentQuery.dateTo ? (
						<FilterChip
							label={
								currentQuery.dateFrom && currentQuery.dateTo
									? `更新：${currentQuery.dateFrom} — ${currentQuery.dateTo}`
									: currentQuery.dateFrom
										? `更新 ≥ ${currentQuery.dateFrom}`
										: `更新 ≤ ${currentQuery.dateTo}`
							}
							onRemove={() => {
								clearDateRange()
							}}
						/>
					) : null}
					{pathname === '/tasks' && currentQuery.view === 'board' ? (
						<FilterChip
							label='视图：看板'
							onRemove={() => {
								setView('list')
								applyQuery({ view: 'list' })
							}}
						/>
					) : null}
				</div>
			) : null}

			{tasks.length === 0 ? (
				<p className='rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500'>
					当前筛选下没有任务。
				</p>
			) : pathname === '/tasks' && view === 'board' ? (
				<TasksBoard
					tasks={tasks}
					openTaskId={openTaskId}
					onStripTaskId={stripTaskIdFromUrl}
				/>
			) : (
				<div className='overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm'>
					<div className='flex items-center gap-3 border-b border-zinc-200 bg-zinc-50/50 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500'>
						<span className='w-[104px] shrink-0'>状态</span>
						<span className='min-w-0 flex-1'>任务</span>
						<span className='hidden w-16 shrink-0 text-right sm:inline-block'>
							截止
						</span>
						<span className='hidden shrink-0 text-right sm:inline-block sm:w-32'>
							项目
						</span>
						<span className='w-8 shrink-0' aria-hidden />
					</div>
					<ul className='divide-y divide-zinc-100'>
						{tasks.map(task => (
							<li key={task.id}>
								<TaskRow
									task={task}
									initialDetailOpen={openTaskId === task.id}
									onDetailClose={
										openTaskId === task.id ? stripTaskIdFromUrl : undefined
									}
								/>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

function FilterChip({
	label,
	onRemove,
}: {
	label: string
	onRemove: () => void
}) {
	return (
		<span className='inline-flex max-w-full items-center gap-1 rounded-full border border-violet-200/80 bg-violet-50/80 px-2.5 py-1 text-xs text-zinc-800'>
			<span className='min-w-0 truncate'>{label}</span>
			<button
				type='button'
				onClick={onRemove}
				className='shrink-0 rounded p-0.5 text-zinc-500 transition hover:bg-violet-100 hover:text-zinc-900'
				aria-label='移除此筛选条件'
			>
				<X className='h-3.5 w-3.5' />
			</button>
		</span>
	)
}
