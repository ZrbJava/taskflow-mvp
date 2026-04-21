'use client'

import {
	DndContext,
	PointerSensor,
	closestCorners,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateTaskStatusAction } from '@/app/actions/tasks'
import { TaskBoardCard } from '@/components/task-board-card'
import { Badge } from '@/components/ui/badge'
import type { TaskListItem, TaskStatus } from '@/types/task'

const STATUSES: TaskStatus[] = ['todo', 'doing', 'done']

const STATUS_TITLE: Record<TaskStatus, string> = {
	todo: '待处理',
	doing: '进行中',
	done: '已完成',
}

function resolveDropColumn(
	overId: UniqueIdentifier,
	tasks: TaskListItem[]
): TaskStatus | null {
	const s = String(overId)
	if (s === 'todo' || s === 'doing' || s === 'done') return s
	const hit = tasks.find(t => t.id === s)
	return hit?.status ?? null
}

function BoardDraggableCard({
	task,
	openTaskId,
	onStripTaskId,
}: {
	task: TaskListItem
	openTaskId?: string
	onStripTaskId?: () => void
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		isDragging,
	} = useDraggable({ id: task.id })

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.55 : undefined,
		zIndex: isDragging ? 20 : undefined,
	}

	return (
		<div ref={setNodeRef} style={style}>
			<TaskBoardCard
				task={task}
				initialDetailOpen={openTaskId === task.id}
				onDetailClose={openTaskId === task.id ? onStripTaskId : undefined}
				boardDragSetHandle={setActivatorNodeRef}
				boardDragAttributes={attributes}
				boardDragListeners={listeners}
			/>
		</div>
	)
}

function BoardColumn({
	status,
	count,
	children,
}: {
	status: TaskStatus
	count: number
	children: React.ReactNode
}) {
	const { setNodeRef, isOver } = useDroppable({ id: status })

	return (
		<section
			className={`flex min-h-[min(60vh,28rem)] flex-col rounded-xl border bg-zinc-50/40 p-3 transition-colors ${
				isOver
					? 'border-violet-400 ring-2 ring-violet-400/30'
					: 'border-zinc-200'
			}`}
		>
			<div className='mb-3 flex items-center justify-between gap-2'>
				<span className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
					{STATUS_TITLE[status]}
				</span>
				<Badge variant='secondary'>{count}</Badge>
			</div>
			<div
				ref={setNodeRef}
				className='flex min-h-[12rem] flex-col gap-2 rounded-lg border border-transparent'
			>
				{children}
			</div>
		</section>
	)
}

export function TasksBoard({
	tasks,
	openTaskId,
	onStripTaskId,
}: {
	tasks: TaskListItem[]
	openTaskId?: string
	onStripTaskId?: () => void
}) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		})
	)

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

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (!over || pending) return

		const taskId = String(active.id)
		const nextStatus = resolveDropColumn(over.id, tasks)
		if (!nextStatus) return

		const task = tasks.find(t => t.id === taskId)
		if (!task || task.status === nextStatus) return

		startTransition(async () => {
			const res = await updateTaskStatusAction(taskId, nextStatus)
			if (!res.ok) {
				toast.error(res.error ?? '更新状态失败')
				return
			}
			router.refresh()
			toast.success(`已移至「${STATUS_TITLE[nextStatus]}」`)
		})
	}

	return (
		<DndContext
			// 固定 id：避免 useUniqueId 的全局计数在 SSR 与客户端不一致导致 aria-describedby 水合不匹配
			id='tasks-board-dnd'
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragEnd={handleDragEnd}
		>
			<p className='mb-2 text-xs text-zinc-500'>
				拖动卡片左侧手柄到其它列即可更新状态（与列表共用同一套权限校验）。
			</p>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start'>
				{STATUSES.map(s => (
					<BoardColumn key={s} status={s} count={grouped[s].length}>
						{grouped[s].length === 0 ? (
							<p className='rounded-lg border border-dashed border-zinc-200 bg-white/60 py-8 text-center text-xs text-zinc-400'>
								拖入任务到此处
							</p>
						) : (
							grouped[s].map(task => (
								<BoardDraggableCard
									key={task.id}
									task={task}
									openTaskId={openTaskId}
									onStripTaskId={onStripTaskId}
								/>
							))
						)}
					</BoardColumn>
				))}
			</div>
		</DndContext>
	)
}
