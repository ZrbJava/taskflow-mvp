import { auth } from '@/auth'
import { CreateTaskSheet } from '@/components/create-task-sheet'
import { TasksView } from '@/components/tasks-view'
import { can } from '@/lib/acl'
import {
	parseTasksTaskQuery,
	parseViewMode,
	pickFirst,
} from '@/lib/parse-tasks-url'
import { prisma } from '@/lib/db'
import { getTasksForUser } from '@/lib/tasks-data'
import type { TaskListItem } from '@/types/task'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface ProjectDetailPageProps {
	params: Promise<{ id: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProjectDetailPage({
	params,
	searchParams,
}: ProjectDetailPageProps) {
	const session = await auth()
	if (!session?.user?.id) {
		redirect('/login')
	}

	const { id } = await params
	const sp = await searchParams

	const project = await prisma.project.findUnique({
		where: { id },
	})

	if (!project) {
		notFound()
	}

	if (
		!can(session.user.id, 'read', {
			type: 'project',
			ownerId: project.userId,
		})
	) {
		notFound()
	}

	const query = parseTasksTaskQuery(sp)
	const view = parseViewMode(sp)
	const rawTaskId = pickFirst(sp.taskId)?.trim()
	const openTaskId = rawTaskId && rawTaskId.length > 0 ? rawTaskId : undefined

	const rows = await getTasksForUser(session.user.id, {
		...query,
		projectId: id,
	})

	const tasks: TaskListItem[] = rows.map(t => ({
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
			<section className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div>
					<p className='font-mono text-xs uppercase tracking-wider text-zinc-400'>
						Project
					</p>
					<h1 className='mt-1 text-2xl font-semibold tracking-tight text-zinc-900'>
						{project.name}
					</h1>
					<p className='mt-2 text-sm text-zinc-500'>
						与「我的任务」相同的筛选与列表/看板视图；条件写入 URL，仅本项目数据。
					</p>
					<p className='mt-2 text-xs text-zinc-400'>
						<Link
							href='/tasks'
							className='font-medium text-violet-600 hover:text-violet-700'
						>
							← 全部任务
						</Link>
					</p>
				</div>
				<CreateTaskSheet
					projects={[{ id: project.id, name: project.name }]}
					defaultProjectId={project.id}
				/>
			</section>

			<TasksView
				tasks={tasks}
				projects={[{ id: project.id, name: project.name }]}
				openTaskId={openTaskId}
				currentQuery={{
					keyword: query.keyword ?? '',
					status: (query.status as string) ?? 'all',
					projectId: id,
					sort: query.sort ?? 'updated_desc',
					dateFrom: query.dateFrom ?? '',
					dateTo: query.dateTo ?? '',
					priority: (query.priority as string) ?? 'all',
					view,
				}}
			/>
		</main>
	)
}
