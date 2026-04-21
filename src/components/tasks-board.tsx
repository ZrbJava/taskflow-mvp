'use client'

import { useMemo } from 'react'
import { TaskBoardCard } from '@/components/task-board-card'
import { Badge } from '@/components/ui/badge'
import type { TaskListItem, TaskStatus } from '@/types/task'

const STATUSES: TaskStatus[] = ['todo', 'doing', 'done']

const STATUS_TITLE: Record<TaskStatus, string> = {
	todo: '待处理',
	doing: '进行中',
	done: '已完成',
}

export function TasksBoard({
	tasks,
	openTaskId,
	onStripTaskId,
}: {
	tasks: TaskListItem[]
	openTaskId?: string
	/** 关闭详情时从 URL 去掉 `taskId`（与列表行一致） */
	onStripTaskId?: () => void
}) {
	const grouped = useMemo(() => {
		const m: Record<TaskStatus, TaskListItem[]> = {
			todo: [],
			doing: [],
			done: [],
		}
		for (const t of tasks) {
			m[t.status].push(t)
		}
		return m
	}, [tasks])

	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start'>
			{STATUSES.map(s => (
				<section
					key={s}
					className='flex min-h-[min(60vh,28rem)] flex-col rounded-xl border border-zinc-200 bg-zinc-50/40 p-3'
				>
					<div className='mb-3 flex items-center justify-between gap-2'>
						<span className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
							{STATUS_TITLE[s]}
						</span>
						<Badge variant='secondary'>{grouped[s].length}</Badge>
					</div>
					<div className='flex flex-col gap-2'>
						{grouped[s].length === 0 ? (
							<p className='rounded-lg border border-dashed border-zinc-200 bg-white/60 py-6 text-center text-xs text-zinc-400'>
								无任务
							</p>
						) : (
							grouped[s].map(task => (
								<TaskBoardCard
									key={task.id}
									task={task}
									initialDetailOpen={openTaskId === task.id}
									onDetailClose={
										openTaskId === task.id ? onStripTaskId : undefined
									}
								/>
							))
						)}
					</div>
				</section>
			))}
		</div>
	)
}
