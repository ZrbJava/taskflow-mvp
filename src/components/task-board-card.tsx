'use client'

import { useEffect, useState } from 'react'
import { TaskDetailSheet } from '@/components/task-detail-sheet'
import { PRIORITY_BADGE_CLASS, PRIORITY_LABEL } from '@/lib/task-priority'
import type { TaskListItem, TaskStatus } from '@/types/task'

const COLUMN_TOP: Record<TaskStatus, string> = {
	todo: 'border-t-zinc-400',
	doing: 'border-t-amber-400',
	done: 'border-t-emerald-500',
}

function formatDueShort(iso: string | null): string | null {
	if (!iso) return null
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return null
	return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

export function TaskBoardCard({
	task,
	initialDetailOpen = false,
	onDetailClose,
}: {
	task: TaskListItem
	initialDetailOpen?: boolean
	onDetailClose?: () => void
}) {
	const [detailOpen, setDetailOpen] = useState(initialDetailOpen)

	useEffect(() => {
		setDetailOpen(initialDetailOpen)
	}, [initialDetailOpen])

	const dueLabel = formatDueShort(task.dueDate)

	return (
		<>
			<button
				type='button'
				onClick={() => setDetailOpen(true)}
				className={`w-full rounded-lg border border-zinc-200 border-t-[3px] bg-white p-3 text-left shadow-sm transition ${COLUMN_TOP[task.status]} hover:border-zinc-300 hover:shadow`}
			>
				<div className='flex items-start justify-between gap-2'>
					<span className='line-clamp-3 text-sm font-medium leading-snug text-zinc-900'>
						{task.title}
					</span>
					{task.priority !== 'none' ? (
						<span
							className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_BADGE_CLASS[task.priority]}`}
						>
							{PRIORITY_LABEL[task.priority]}
						</span>
					) : null}
				</div>
				{dueLabel ? (
					<p className='mt-2 text-xs text-zinc-500'>截止 {dueLabel}</p>
				) : null}
				{task.project ? (
					<p className='mt-1 truncate text-[11px] text-zinc-400'>
						{task.project.name}
					</p>
				) : null}
			</button>

			<TaskDetailSheet
				task={task}
				open={detailOpen}
				onOpenChange={open => {
					setDetailOpen(open)
					if (!open) onDetailClose?.()
				}}
			/>
		</>
	)
}
