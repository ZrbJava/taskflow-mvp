import { Tag } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DeleteLabelButton } from '@/components/labels/delete-label-button'
import { CreateLabelForm } from '@/components/labels/create-label-form'
import { prisma } from '@/lib/db'

export const metadata = {
	title: '标签',
	description: '管理任务标签，用于跨项目归类与筛选',
}

export default async function LabelsPage() {
	const session = await auth()
	if (!session?.user?.id) {
		redirect('/login')
	}

	const labels = await prisma.label.findMany({
		where: { userId: session.user.id },
		orderBy: { name: 'asc' },
		include: {
			_count: { select: { tasks: true } },
		},
	})

	return (
		<div>
			<div>
				<p className='font-mono text-xs uppercase tracking-wider text-zinc-400'>
					Labels
				</p>
				<h1 className='mt-1 text-2xl font-semibold tracking-tight text-zinc-900'>
					标签
				</h1>
				<p className='mt-2 text-sm text-zinc-500'>
					对标 Linear /
					Jira：同一标签可打在多个任务上，在任务详情中勾选；删除标签不会删除任务，仅解除关联。
				</p>
			</div>

			<div className='mt-6 max-w-md'>
				<CreateLabelForm />
			</div>

			{labels.length === 0 ? (
				<p className='mt-8 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500'>
					暂无标签。创建后可在任意任务详情中勾选。
				</p>
			) : (
				<ul className='mt-8 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white'>
					{labels.map(l => (
						<li
							key={l.id}
							className='flex items-center justify-between gap-3 px-4 py-3 first:rounded-t-xl last:rounded-b-xl'
						>
							<div className='flex min-w-0 items-center gap-2'>
								<Tag className='h-4 w-4 shrink-0 text-zinc-400' aria-hidden />
								<span
									className='truncate font-medium text-zinc-900'
									style={l.color ? { color: l.color } : undefined}
								>
									{l.name}
								</span>
								<span className='shrink-0 text-xs tabular-nums text-zinc-400'>
									{l._count.tasks} 个任务
								</span>
							</div>
							<div className='flex shrink-0 items-center gap-1'>
								{l._count.tasks > 0 ? (
									<Link
										href={`/tasks?labelId=${encodeURIComponent(l.id)}`}
										className='rounded-md px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 hover:text-violet-700'
									>
										查看任务
									</Link>
								) : null}
								<DeleteLabelButton labelId={l.id} />
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
