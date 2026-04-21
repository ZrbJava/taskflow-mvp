'use client'

import { Command } from 'cmdk'
import {
	ArrowRight,
	CircleDot,
	Columns2,
	FolderKanban,
	Home,
	Info,
	Keyboard,
	LayoutGrid,
	LineChart,
	ListChecks,
	Loader2,
	Plus,
	Search,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog'
import { PRIORITY_LABEL } from '@/lib/task-priority'
import type { TaskPaletteHit } from '@/types/task'
import { OPEN_SHORTCUTS_EVENT } from '@/components/shell/keyboard-shortcuts-dialog'

interface SidebarProject {
	id: string
	name: string
}

interface CommandMenuProps {
	projects: SidebarProject[]
}

const STATUS_LABEL: Record<TaskPaletteHit['status'], string> = {
	todo: '待处理',
	doing: '进行中',
	done: '已完成',
}

export function CommandMenu({ projects }: CommandMenuProps) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [keyword, setKeyword] = useState('')
	const [debounced, setDebounced] = useState('')
	const [hits, setHits] = useState<TaskPaletteHit[]>([])
	const [loadingHits, setLoadingHits] = useState(false)

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault()
				setOpen(v => !v)
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [])

	const handleOpenChange = (next: boolean) => {
		setOpen(next)
		if (!next) {
			setKeyword('')
			setDebounced('')
			setHits([])
			setLoadingHits(false)
		}
	}

	useEffect(() => {
		const t = window.setTimeout(() => setDebounced(keyword.trim()), 280)
		return () => window.clearTimeout(t)
	}, [keyword])

	useEffect(() => {
		if (!open) return
		if (debounced.length < 1) {
			setHits([])
			setLoadingHits(false)
			return
		}

		const ac = new AbortController()
		setLoadingHits(true)
		fetch(`/api/command/search?q=${encodeURIComponent(debounced)}`, {
			signal: ac.signal,
		})
			.then(async res => {
				if (!res.ok) {
					setHits([])
					return
				}
				const data = (await res.json()) as { tasks?: TaskPaletteHit[] }
				setHits(Array.isArray(data.tasks) ? data.tasks : [])
			})
			.catch(err => {
				if ((err as Error).name === 'AbortError') return
				setHits([])
			})
			.finally(() => {
				if (!ac.signal.aborted) setLoadingHits(false)
			})

		return () => ac.abort()
	}, [open, debounced])

	const run = (fn: () => void) => {
		setOpen(false)
		setTimeout(fn, 0)
	}

	const searchTasks = () => {
		const q = keyword.trim()
		run(() => {
			router.push(q ? `/tasks?keyword=${encodeURIComponent(q)}` : '/tasks')
		})
	}

	const goTask = (id: string) => {
		run(() => {
			router.push(`/tasks?taskId=${encodeURIComponent(id)}`)
		})
	}

	const typing = keyword.trim().length > 0
	const shouldFilter = !typing

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className='w-[92vw] max-w-xl overflow-hidden p-0'
				showCloseButton={false}
			>
				<DialogTitle className='sr-only'>命令面板</DialogTitle>
				<DialogDescription className='sr-only'>
					搜索任务、跳转页面或执行快捷操作。
				</DialogDescription>
				<Command
					shouldFilter={shouldFilter}
					label='全局命令面板'
					className='[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400'
				>
					<div className='flex items-center gap-2 border-b border-zinc-200 px-3 py-2.5'>
						<Search className='h-4 w-4 text-zinc-400' />
						<Command.Input
							value={keyword}
							onValueChange={setKeyword}
							placeholder='输入关键词搜索或跳转…'
							className='w-full border-0 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400'
						/>
						<kbd className='rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500'>
							Esc
						</kbd>
					</div>

					<Command.List className='max-h-96 overflow-y-auto p-1.5'>
						{typing ? (
							<>
								{loadingHits ? (
									<div className='flex items-center gap-2 px-3 py-4 text-sm text-zinc-500'>
										<Loader2 className='h-4 w-4 animate-spin text-violet-500' />
										搜索任务…
									</div>
								) : null}
								{!loadingHits && hits.length > 0 ? (
									<Command.Group heading='匹配的任务'>
										{hits.map(t => (
											<CmdItem
												key={t.id}
												value={`task-${t.id}-${t.title}`}
												onSelect={() => goTask(t.id)}
												icon={<Search className='h-4 w-4 text-violet-500' />}
												right={
													<span className='flex max-w-[11rem] shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-0.5 text-[11px] text-zinc-400'>
														{t.priority !== 'none' ? (
															<span className='text-violet-600'>
																{PRIORITY_LABEL[t.priority]}
															</span>
														) : null}
														<span>{STATUS_LABEL[t.status]}</span>
														{t.dueDate ? (
															<span className='font-mono text-zinc-500'>
																{new Date(t.dueDate).toLocaleDateString(
																	'zh-CN',
																	{
																		month: 'numeric',
																		day: 'numeric',
																	}
																)}
															</span>
														) : null}
														{t.project ? (
															<span className='max-w-[7rem] truncate'>
																{t.project.name}
															</span>
														) : (
															<span>无项目</span>
														)}
														<ArrowRight className='h-3.5 w-3.5' />
													</span>
												}
											>
												<span className='truncate'>{t.title}</span>
											</CmdItem>
										))}
									</Command.Group>
								) : null}
								<Command.Group heading='搜索'>
									<CmdItem
										value={`search-${keyword.trim()}`}
										onSelect={searchTasks}
										icon={<Search className='h-4 w-4 text-violet-500' />}
										right={<ArrowRight className='h-3.5 w-3.5 text-zinc-400' />}
									>
										在任务列表中打开「
										<span className='font-medium text-zinc-900'>
											{keyword.trim()}
										</span>
										」
									</CmdItem>
								</Command.Group>
								<Command.Empty className='px-3 py-6 text-center text-sm text-zinc-500'>
									{loadingHits
										? '正在搜索…'
										: '没有匹配的任务。可用下方入口在完整列表中搜索。'}
								</Command.Empty>
							</>
						) : (
							<>
								<Command.Empty className='px-3 py-6 text-center text-sm text-zinc-500'>
									没找到匹配项。试试输入任务标题关键词。
								</Command.Empty>
							</>
						)}

						{!typing ? (
							<>
								<Command.Group heading='操作'>
									<CmdItem
										onSelect={() => run(() => router.push('/tasks?compose=1'))}
										icon={<Plus className='h-4 w-4 text-violet-500' />}
									>
										新建任务
										<Shortcut>C</Shortcut>
									</CmdItem>
									<CmdItem
										onSelect={() =>
											run(() => router.push('/dashboard/projects?compose=1'))
										}
										icon={<Plus className='h-4 w-4 text-violet-500' />}
									>
										新建项目
									</CmdItem>
								</Command.Group>

								<Command.Group heading='跳转'>
									<CmdItem
										onSelect={() => run(() => router.push('/'))}
										icon={<Home className='h-4 w-4 text-zinc-500' />}
									>
										首页
									</CmdItem>
									<CmdItem
										onSelect={() => run(() => router.push('/dashboard'))}
										icon={<LayoutGrid className='h-4 w-4 text-zinc-500' />}
									>
										工作台
									</CmdItem>
									<CmdItem
										onSelect={() => run(() => router.push('/tasks'))}
										icon={<ListChecks className='h-4 w-4 text-zinc-500' />}
									>
										我的任务
									</CmdItem>
									<CmdItem
										onSelect={() => run(() => router.push('/tasks?view=board'))}
										icon={<Columns2 className='h-4 w-4 text-zinc-500' />}
									>
										收件箱看板
									</CmdItem>
									<CmdItem
										onSelect={() =>
											run(() => router.push('/dashboard/projects'))
										}
										icon={<FolderKanban className='h-4 w-4 text-zinc-500' />}
									>
										项目列表
									</CmdItem>
									<CmdItem
										onSelect={() =>
											run(() => router.push('/dashboard/insights'))
										}
										icon={<LineChart className='h-4 w-4 text-zinc-500' />}
									>
										数据洞察
									</CmdItem>
									<CmdItem
										onSelect={() => run(() => router.push('/about'))}
										icon={<Info className='h-4 w-4 text-zinc-500' />}
									>
										关于
									</CmdItem>
								</Command.Group>

								{projects.length > 0 ? (
									<Command.Group heading='项目'>
										{projects.map(p => (
											<CmdItem
												key={p.id}
												onSelect={() =>
													run(() => router.push(`/projects/${p.id}`))
												}
												icon={
													<CircleDot className='h-3.5 w-3.5 text-zinc-400' />
												}
											>
												{p.name}
											</CmdItem>
										))}
									</Command.Group>
								) : null}
							</>
						) : null}
					</Command.List>

					<div className='flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-3 py-2 text-[11px] text-zinc-400'>
						<div className='flex flex-wrap items-center gap-3'>
							<span className='inline-flex items-center gap-1'>
								<Shortcut>↑</Shortcut>
								<Shortcut>↓</Shortcut>
								选择
							</span>
							<span className='inline-flex items-center gap-1'>
								<Shortcut>↵</Shortcut>
								执行
							</span>
							<button
								type='button'
								onClick={() =>
									run(() =>
										window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT))
									)
								}
								className='inline-flex items-center gap-1 rounded text-violet-600 transition hover:text-violet-800'
							>
								<Keyboard className='h-3.5 w-3.5' />
								全部快捷键
							</button>
						</div>
						<span className='font-mono'>cmdk · TaskFlow</span>
					</div>
				</Command>
			</DialogContent>
		</Dialog>
	)
}

function CmdItem({
	onSelect,
	icon,
	children,
	right,
	value,
}: {
	onSelect: () => void
	icon?: React.ReactNode
	children: React.ReactNode
	right?: React.ReactNode
	value?: string
}) {
	return (
		<Command.Item
			value={value}
			onSelect={onSelect}
			className='flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 aria-selected:bg-violet-50 aria-selected:text-zinc-900'
		>
			{icon}
			<span className='flex-1 truncate'>{children}</span>
			{right}
		</Command.Item>
	)
}

function Shortcut({ children }: { children: React.ReactNode }) {
	return (
		<kbd className='ml-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500'>
			{children}
		</kbd>
	)
}
