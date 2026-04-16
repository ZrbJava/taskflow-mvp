"use client";

import { useMemo, useState } from "react";
import type { TaskListItem } from "@/types/task";
import {
  TaskStatusFilter,
  type TaskFilterValue,
} from "@/components/task-status-filter";
import { TaskRow } from "@/components/task-row";

export function TasksView({ tasks }: { tasks: TaskListItem[] }) {
  const [filter, setFilter] = useState<TaskFilterValue>("all");

  const visible = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-zinc-700">筛选状态</p>
        <div className="mt-2">
          <TaskStatusFilter value={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="grid gap-4">
        {visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            当前筛选下没有任务。
          </p>
        ) : (
          visible.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
