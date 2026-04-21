import { normalizeDateRange, parseYmdParam } from '@/lib/date-query'
import type { TaskQuery, TaskSort } from '@/lib/tasks-data'
import type { TaskPriority, TaskStatus } from '@/types/task'

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

export function pickFirst(
	value: string | string[] | undefined
): string | undefined {
	if (Array.isArray(value)) return value[0]
	return value
}

/** 与 `/tasks`、`/projects/[id]` 共用的任务筛选 query 解析。 */
export function parseTasksTaskQuery(
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

export function parseViewMode(
	sp: Record<string, string | string[] | undefined>
): 'list' | 'board' {
	return pickFirst(sp.view) === 'board' ? 'board' : 'list'
}
