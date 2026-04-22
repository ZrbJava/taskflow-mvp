'use client'

import { ListChecks, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
	addChecklistItemAction,
	deleteChecklistItemAction,
	listChecklistForTaskAction,
	toggleChecklistItemAction,
} from '@/app/actions/checklist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Row = { id: string; title: string; done: boolean }

export function TaskChecklistBlock({ taskId }: { taskId: string }) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [items, setItems] = useState<Row[]>([])
	const [newTitle, setNewTitle] = useState('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		;(async () => {
			const r = await listChecklistForTaskAction(taskId)
			if (cancelled) return
			if (r.ok) setItems(r.items)
			else setItems([])
			setLoading(false)
		})()
		return () => {
			cancelled = true
		}
	}, [taskId])

	const onAdd = () => {
		const t = newTitle.trim()
		if (!t) return
		startTransition(async () => {
			const res = await addChecklistItemAction(taskId, t)
			if (!res.ok) {
				toast.error(res.error ?? '添加失败')
				return
			}
			setNewTitle('')
			setItems(prev => [...prev, res.item])
			router.refresh()
			toast.success('已添加')
		})
	}

	const onToggle = (id: string) => {
		startTransition(async () => {
			const res = await toggleChecklistItemAction(id)
			if (!res.ok) {
				toast.error(res.error ?? '更新失败')
				return
			}
			setItems(prev =>
				prev.map(x => (x.id === id ? { ...x, done: res.done } : x))
			)
			router.refresh()
		})
	}

	const onDelete = (id: string) => {
		startTransition(async () => {
			const res = await deleteChecklistItemAction(id)
			if (!res.ok) {
				toast.error(res.error ?? '删除失败')
				return
			}
			setItems(prev => prev.filter(x => x.id !== id))
			router.refresh()
		})
	}

	const doneCount = items.filter(i => i.done).length
	const total = items.length

	return (
		<div className='rounded-xl border border-zinc-200 bg-white p-3'>
			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-2 text-xs font-medium text-zinc-600'>
					<ListChecks className='h-3.5 w-3.5' />
					检查清单
				</div>
				{total > 0 ? (
					<span className='text-[11px] tabular-nums text-zinc-400'>
						{doneCount}/{total}
					</span>
				) : null}
			</div>

			{loading ? (
				<p className='mt-2 text-xs text-zinc-400'>加载中…</p>
			) : items.length === 0 ? (
				<p className='mt-2 text-xs text-zinc-500'>暂无条目，可在下方添加。</p>
			) : (
				<ul className='mt-2 space-y-1.5'>
					{items.map(row => (
						<li
							key={row.id}
							className='flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50/80 px-2 py-1.5'
						>
							<input
								type='checkbox'
								checked={row.done}
								disabled={pending}
								onChange={() => onToggle(row.id)}
								className='mt-0.5 rounded border-zinc-300'
								aria-label={row.done ? '标记为未完成' : '标记为已完成'}
							/>
							<span
								className={`min-w-0 flex-1 text-sm leading-snug ${
									row.done
										? 'text-zinc-400 line-through'
										: 'text-zinc-800'
								}`}
							>
								{row.title}
							</span>
							<button
								type='button'
								disabled={pending}
								onClick={() => onDelete(row.id)}
								className='shrink-0 rounded p-1 text-zinc-400 transition hover:bg-zinc-200/80 hover:text-red-600'
								aria-label='删除条目'
							>
								<Trash2 className='h-3.5 w-3.5' />
							</button>
						</li>
					))}
				</ul>
			)}

			<div className='mt-3 flex flex-wrap gap-2'>
				<Input
					value={newTitle}
					onChange={e => setNewTitle(e.target.value)}
					placeholder='新条目，回车或点击添加'
					maxLength={200}
					className='min-w-[12rem] flex-1 text-sm'
					disabled={pending}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault()
							onAdd()
						}
					}}
				/>
				<Button
					type='button'
					variant='secondary'
					className='h-9 shrink-0 px-3 py-1.5 text-xs'
					disabled={pending || !newTitle.trim()}
					onClick={onAdd}
				>
					添加
				</Button>
			</div>
		</div>
	)
}
