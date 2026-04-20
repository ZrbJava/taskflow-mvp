'use client'

import { Command } from 'cmdk'
import {
	ArrowRight,
	CircleDot,
	FolderKanban,
	Info,
	LayoutGrid,
	ListChecks,
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

interface SidebarProject {
	id: string
	name: string
}

interface CommandMenuProps {
	projects: SidebarProject[]
}

export function CommandMenu({ projects }: CommandMenuProps) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [keyword, setKeyword] = useState('')

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

	useEffect(() => {
		if (!open) setKeyword('')
	}, [open])

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

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				className='w-[92vw] max-w-xl overflow-hidden p-0'
				showCloseButton={false}
			>
				<DialogTitle className='sr-only'>命令面板</DialogTitle>
				<DialogDescription className='sr-only'>
					搜索任务、跳转页面或执行快捷操作。
				</DialogDescription>
				<Command
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
						<Command.Empty className='px-3 py-6 text-center text-sm text-zinc-500'>
							没找到匹配项。按回车在任务中搜索。
						</Command.Empty>

						{keyword.trim().length > 0 ? (
							<Command.Group heading='搜索'>
								<CmdItem
									onSelect={searchTasks}
									icon={<Search className='h-4 w-4 text-violet-500' />}
									right={<ArrowRight className='h-3.5 w-3.5 text-zinc-400' />}
								>
									在任务中搜索「
									<span className='font-medium text-zinc-900'>
										{keyword.trim()}
									</span>
									」
								</CmdItem>
							</Command.Group>
						) : null}

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
								onSelect={() => run(() => router.push('/dashboard'))}
								icon={<LayoutGrid className='h-4 w-4 text-zinc-500' />}
							>
								概览
							</CmdItem>
							<CmdItem
								onSelect={() => run(() => router.push('/tasks'))}
								icon={<ListChecks className='h-4 w-4 text-zinc-500' />}
							>
								我的任务
							</CmdItem>
							<CmdItem
								onSelect={() => run(() => router.push('/dashboard/projects'))}
								icon={<FolderKanban className='h-4 w-4 text-zinc-500' />}
							>
								项目列表
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
										onSelect={() => run(() => router.push(`/projects/${p.id}`))}
										icon={<CircleDot className='h-3.5 w-3.5 text-zinc-400' />}
									>
										{p.name}
									</CmdItem>
								))}
							</Command.Group>
						) : null}
					</Command.List>

					<div className='flex items-center justify-between border-t border-zinc-200 px-3 py-2 text-[11px] text-zinc-400'>
						<div className='flex items-center gap-3'>
							<span className='inline-flex items-center gap-1'>
								<Shortcut>↑</Shortcut>
								<Shortcut>↓</Shortcut>
								选择
							</span>
							<span className='inline-flex items-center gap-1'>
								<Shortcut>↵</Shortcut>
								执行
							</span>
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
}: {
	onSelect: () => void
	icon?: React.ReactNode
	children: React.ReactNode
	right?: React.ReactNode
}) {
	return (
		<Command.Item
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
