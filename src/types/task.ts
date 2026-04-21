export type TaskStatus = 'todo' | 'doing' | 'done'

export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'

export interface TaskListItem {
	id: string
	title: string
	description: string | null
	status: TaskStatus
	priority: TaskPriority
	/** ISO 字符串，便于 RSC → Client 传递 */
	dueDate: string | null
	/** ISO，用于「更新于」等展示 */
	updatedAt: string
	projectId: string | null
	project: { id: string; name: string } | null
}

/** 命令面板等场景的轻量任务摘要（无 description）。 */
export type TaskPaletteHit = {
	id: string
	title: string
	status: TaskStatus
	priority: TaskPriority
	dueDate: string | null
	project: { id: string; name: string } | null
}
