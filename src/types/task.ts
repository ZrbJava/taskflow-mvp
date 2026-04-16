export type TaskStatus = "todo" | "doing" | "done";

export interface TaskListItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: string | null;
  project: { id: string; name: string } | null;
}
