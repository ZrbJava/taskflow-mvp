import { auth } from '@/auth'
import { CreateTaskSheet } from '@/components/create-task-sheet'
import { TasksView } from '@/components/tasks-view'
import { normalizeDateRange, parseYmdParam } from '@/lib/date-query'
import { prisma } from '@/lib/db'
import {
	getTasksForUser,
	type TaskQuery,
	type TaskSort,
} from '@/lib/tasks-data'
import type { TaskListItem, TaskPriority, TaskStatus } from '@/types/task'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

const ALLOWED_STATUS: TaskStatus[] = ['todo', 'doing', 'done']
const ALLOWED_SORT: TaskSort[] = [
	'updated_desc',
	'updated_asc',
	'created_desc',
	'created_asc',
	'due_asc',
	'due_desc',
]

const ALLOWED_PRIORITY: (TaskPriority | 'all')[] = [
	'all',
	'none',
	'low',
	'medium',
	'high',
	'urgent',
]

function pickFirst(value: string | string[] | undefined): string | undefined {
	if (Array.isArray(value)) return value[0]
	return value
}

function parseTaskQuery(
	sp: Record<string, string | string[] | undefined>
): TaskQuery {
	const keyword = pickFirst(sp.keyword)?.trim() || undefined

	const rawStatus = pickFirst(sp.status)
	const status =
		rawStatus === 'all' ||
		(rawStatus && ALLOWED_STATUS.includes(rawStatus as TaskStatus))
			? (rawStatus as TaskQuery['status'])
			: undefined

	const rawProject = pickFirst(sp.projectId)
	const projectId = rawProject ? rawProject : undefined

	const rawSort = pickFirst(sp.sort)
	const sort =
		rawSort && ALLOWED_SORT.includes(rawSort as TaskSort)
			? (rawSort as TaskSort)
			: undefined

	const rawFrom = parseYmdParam(pickFirst(sp.dateFrom))
	const rawTo = parseYmdParam(pickFirst(sp.dateTo))
	const { dateFrom, dateTo } = normalizeDateRange(rawFrom, rawTo)

	const rawPriority = pickFirst(sp.priority)
	const priority =
		rawPriority &&
		ALLOWED_PRIORITY.includes(rawPriority as TaskPriority | 'all')
			? (rawPriority as TaskQuery['priority'])
			: undefined

	return { keyword, status, projectId, sort, dateFrom, dateTo, priority }
}

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
	const query = parseTaskQuery(sp)
	const rawTaskId = pickFirst(sp.taskId)?.trim()
	const openTaskId = rawTaskId && rawTaskId.length > 0 ? rawTaskId : undefined

	const rawView = pickFirst(sp.view)
	const view = rawView === 'board' ? ('board' as const) : ('list' as const)

	const [raw, projects] = await Promise.all([
		getTasksForUser(session.user.id, query),
		prisma.project.findMany({
			where: { userId: session.user.id },
			orderBy: { updatedAt: 'desc' },
			select: { id: true, name: true },
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
						关键词、状态、优先级、项目、排序与日期；条件写入 URL，刷新不丢。
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
					openTaskId={openTaskId}
					currentQuery={{
						keyword: query.keyword ?? '',
						status: (query.status as string) ?? 'all',
						projectId: (query.projectId as string) ?? 'all',
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
