'use client'

import { History } from 'lucide-react'
import { useEffect, useState } from 'react'
import { listTaskActivitiesForTaskAction } from '@/app/actions/task-activity'

type Row = {
	id: string
	kind: string
	summary: string
	createdAt: string
	actorLabel: string
}

export function TaskActivityTimeline({ taskId }: { taskId: string }) {
	const [items, setItems] = useState<Row[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		;(async () => {
			const r = await listTaskActivitiesForTaskAction(taskId)
			if (cancelled) return
			if (r.ok) setItems(r.items)
			else setItems([])
			setLoading(false)
		})()
		return () => {
			cancelled = true
		}
	}, [taskId])

	return (
		<div className='rounded-xl border border-zinc-200 bg-white p-3'>
			<div className='flex items-center gap-2 text-xs font-medium text-zinc-600'>
				<History className='h-3.5 w-3.5' />
				活动流
			</div>
			<p className='mt-1 text-[11px] text-zinc-400'>
				记录状态、属性、标签、清单与评论等变更（轻量审计）。
			</p>
			{loading ? (
				<p className='mt-2 text-xs text-zinc-400'>加载中…</p>
			) : items.length === 0 ? (
				<p className='mt-2 text-xs text-zinc-500'>暂无动态。保存任务或修改属性后将在此出现。</p>
			) : (
				<ul className='mt-3 max-h-56 space-y-2 overflow-y-auto pr-1'>
					{items.map(row => (
						<li
							key={row.id}
							className='border-l-2 border-violet-200 pl-2.5 text-sm'
						>
							<p className='text-zinc-800'>
								<span className='font-medium text-zinc-900'>
									{row.actorLabel}
								</span>
								<span className='text-zinc-800'> {row.summary}</span>
							</p>
							<p className='mt-0.5 text-[10px] text-zinc-400'>
								{new Date(row.createdAt).toLocaleString('zh-CN')}
							</p>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
