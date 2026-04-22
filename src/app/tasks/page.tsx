import { auth } from '@/auth'
import { CreateTaskSheet } from '@/components/create-task-sheet'
import { TasksView } from '@/components/tasks-view'
import {
	parseTasksTaskQuery,
	parseViewMode,
	pickFirst,
} from '@/lib/parse-tasks-url'
import { prisma } from '@/lib/db'
import { getTasksForUser, mapChecklistProgress } from '@/lib/tasks-data'
import type { TaskListItem } from '@/types/task'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function TasksPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const session = await auth()
	if (!session?.user?.id) {
		redirect('/login')
	}

	const sp = await searchParams
	const query = parseTasksTaskQuery(sp)
	const rawTaskId = pickFirst(sp.taskId)?.trim()
	const openTaskId = rawTaskId && rawTaskId.length > 0 ? rawTaskId : undefined

	const view = parseViewMode(sp)

	const [raw, projects, labels] = await Promise.all([
		getTasksForUser(session.user.id, query),
		prisma.project.findMany({
			where: { userId: session.user.id },
			orderBy: { updatedAt: 'desc' },
			select: { id: true, name: true },
		}),
		prisma.label.findMany({
			where: { userId: session.user.id },
			orderBy: { name: 'asc' },
			select: { id: true, name: true, color: true },
		}),
	])
	const tasks: TaskListItem[] = raw.map(t => ({
		id: t.id,
		title: t.title,
		description: t.description,
		status: t.status,
		priority: t.priority,
		dueDate: t.dueDate?.toISOString() ?? null,
		updatedAt: t.updatedAt.toISOString(),
		projectId: t.projectId,
		project: t.project,
		labels: t.labels.map(l => ({
			id: l.id,
			name: l.name,
			color: l.color,
		})),
		assignee: t.assignee
			? {
					id: t.assignee.id,
					name: t.assignee.name,
					email: t.assignee.email,
				}
			: null,
		checklist: mapChecklistProgress(t.checklistItems),
	}))

	return (
		<main className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6'>
			<section className='flex items-start justify-between gap-4'>
				<div>
					<p className='font-mono text-xs uppercase tracking-wider text-zinc-400'>
						Tasks
					</p>
					<h1 className='mt-1 text-2xl font-semibold tracking-tight text-zinc-900'>
						我的任务
					</h1>
					<p className='mt-2 text-sm text-zinc-500'>
						关键词、状态、优先级、项目、标签、负责人、排序与日期；条件写入
						URL，刷新不丢。
					</p>
				</div>
				<CreateTaskSheet projects={projects} />
			</section>

			<Suspense
				fallback={
					<div className='rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500'>
						加载任务列表…
					</div>
				}
			>
				<TasksView
					tasks={tasks}
					projects={projects}
					labels={labels}
					openTaskId={openTaskId}
					currentQuery={{
						keyword: query.keyword ?? '',
						status: (query.status as string) ?? 'all',
						projectId: (query.projectId as string) ?? 'all',
						labelId: query.labelId ?? '',
						assignee: query.assignee ?? 'all',
						due: query.due ?? 'all',
						sort: query.sort ?? 'updated_desc',
						dateFrom: query.dateFrom ?? '',
						dateTo: query.dateTo ?? '',
						priority: (query.priority as string) ?? 'all',
						view,
					}}
				/>
			</Suspense>
		</main>
	)
}
