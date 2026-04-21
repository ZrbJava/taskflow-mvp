export type TaskStatus = "todo" | "doing" | "done";

export interface TaskListItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: string | null;
  project: { id: string; name: string } | null;
}

/** 命令面板等场景的轻量任务摘要（无 description）。 */
export type TaskPaletteHit = {
  id: string;
  title: string;
  status: TaskStatus;
  project: { id: string; name: string } | null;
};
