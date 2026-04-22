'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { TaskLabelRef } from '@/types/task'

export function TaskLabelChips({
	labels,
	className = '',
	/** 为 true 时点击标签跳转到当前列表页并带上 `labelId` 筛选 */
	linkable = true,
}: {
	labels: TaskLabelRef[]
	className?: string
	linkable?: boolean
}) {
	const pathname = usePathname()
	if (labels.length === 0) return null

	const projectBase = pathname.match(/^(\/projects\/[^/]+)/)?.[1]
	const base = projectBase ?? '/tasks'

	return (
		<div className={`flex flex-wrap gap-1 ${className}`}>
			{labels.map(l => {
				const style = l.color
					? {
							borderColor: l.color,
							color: l.color,
						}
					: undefined
				const classNameChip =
					'max-w-[7rem] truncate rounded border border-zinc-200 bg-white px-1.5 py-px text-[10px] font-medium text-zinc-600'

				if (linkable) {
					return (
						<Link
							key={l.id}
							href={`${base}?labelId=${encodeURIComponent(l.id)}`}
							title={`按「${l.name}」筛选`}
							className={`${classNameChip} transition hover:bg-zinc-50`}
							style={style}
						>
							{l.name}
						</Link>
					)
				}

				return (
					<span
						key={l.id}
						title={l.name}
						className={classNameChip}
						style={style}
					>
						{l.name}
					</span>
				)
			})}
		</div>
	)
}
