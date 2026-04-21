'use client'

import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TaskDetailSheet } from '@/components/task-detail-sheet'
import { TaskLabelChips } from '@/components/task-label-chips'
import { PRIORITY_BADGE_CLASS, PRIORITY_LABEL } from '@/lib/task-priority'
import {
	formatRelativeUpdatedCn,
	formatUpdatedStableShort,
} from '@/lib/relative-time'
import type { TaskListItem, TaskStatus } from '@/types/task'

function BoardCardUpdated({ iso }: { iso: string }) {
	const [label, setLabel] = useState(() => formatUpdatedStableShort(iso))
	useEffect(() => {
		setLabel(formatRelativeUpdatedCn(iso))
		const id = window.setInterval(
			() => setLabel(formatRelativeUpdatedCn(iso)),
			60_000
		)
		return () => window.clearInterval(id)
	}, [iso])
	return (
		<p
			className='mt-1.5 text-[11px] text-zinc-400'
			title={new Date(iso).toLocaleString('zh-CN')}
		>
			更新 {label}
		</p>
	)
}

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
	boardDragSetHandle,
	boardDragAttributes,
	boardDragListeners,
	/** 仅用于 DragOverlay：无详情 Sheet、无交互，避免双份水合与误点 */
	variant = 'default',
}: {
	task: TaskListItem
	initialDetailOpen?: boolean
	onDetailClose?: () => void
	/** 看板拖拽：与下面两项同时传入时渲染左侧手柄（dnd-kit `setActivatorNodeRef`） */
	boardDragSetHandle?: (element: HTMLElement | null) => void
	boardDragAttributes?: DraggableAttributes
	boardDragListeners?: DraggableSyntheticListeners
	variant?: 'default' | 'overlay'
}) {
	const [detailOpen, setDetailOpen] = useState(initialDetailOpen)

	useEffect(() => {
		setDetailOpen(initialDetailOpen)
	}, [initialDetailOpen])

	const dueLabel = formatDueShort(task.dueDate)

	const showBoardDrag =
		boardDragSetHandle != null &&
		boardDragAttributes != null &&
		boardDragListeners != null

	const isOverlay = variant === 'overlay'

	const body = (
		<div
			className={`flex w-full items-stretch gap-0.5 rounded-lg border border-zinc-200 border-t-[3px] bg-white text-left shadow-sm transition ${COLUMN_TOP[task.status]} ${
				isOverlay
					? 'max-w-md pointer-events-none cursor-grabbing select-none shadow-xl ring-2 ring-violet-400/40'
					: 'hover:border-zinc-300 hover:shadow'
			}`}
		>
			{showBoardDrag ? (
				<button
					type='button'
					ref={boardDragSetHandle}
					className='touch-none cursor-grab rounded-l-md px-1 py-3 text-zinc-400 hover:bg-zinc-50 active:cursor-grabbing'
					aria-label='拖动以改变状态列'
					{...boardDragAttributes}
					{...boardDragListeners}
				>
					<GripVertical className='h-4 w-4 shrink-0' />
				</button>
			) : null}
			<button
				type='button'
				onClick={() => setDetailOpen(true)}
				className='min-w-0 flex-1 p-3 text-left'
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
				<TaskLabelChips labels={task.labels} className='mt-1.5' />
				{dueLabel ? (
					<p className='mt-2 text-xs text-zinc-500'>截止 {dueLabel}</p>
				) : null}
				{task.project ? (
					<p className='mt-1 truncate text-[11px] text-zinc-400'>
						{task.project.name}
					</p>
				) : null}
				<BoardCardUpdated iso={task.updatedAt} />
			</button>
		</div>
	)

	if (isOverlay) {
		return body
	}

	return (
		<>
			{body}
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
