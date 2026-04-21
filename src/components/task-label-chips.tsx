import type { TaskLabelRef } from '@/types/task'

export function TaskLabelChips({
	labels,
	className = '',
}: {
	labels: TaskLabelRef[]
	className?: string
}) {
	if (labels.length === 0) return null
	return (
		<div className={`flex flex-wrap gap-1 ${className}`}>
			{labels.map(l => (
				<span
					key={l.id}
					title={l.name}
					className='max-w-[7rem] truncate rounded border border-zinc-200 bg-white px-1.5 py-px text-[10px] font-medium text-zinc-600'
					style={
						l.color
							? {
									borderColor: l.color,
									color: l.color,
								}
							: undefined
					}
				>
					{l.name}
				</span>
			))}
		</div>
	)
}
