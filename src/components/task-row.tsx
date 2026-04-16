"use client";

import {
  deleteTaskAction,
  updateTaskAction,
  updateTaskStatusAction,
} from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";

const statusLabel: Record<TaskStatus, string> = {
  todo: "待处理",
  doing: "进行中",
  done: "已完成",
};

export function TaskRow({ task }: { task: TaskListItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  const onStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatusAction(task.id, status);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!confirm("确定删除该任务？")) return;
    startTransition(async () => {
      await deleteTaskAction(task.id);
      router.refresh();
    });
  };

  const onSaveEdit = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", task.id);
      fd.set("title", title);
      fd.set("description", description);
      const res = await updateTaskAction(fd);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  };

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          ) : (
            <>
              <h3 className="text-base font-semibold text-zinc-900">
                {task.title}
              </h3>
              {task.description ? (
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {task.description}
                </p>
              ) : null}
              {task.project ? (
                <p className="mt-2 text-xs text-zinc-500">
                  项目：{task.project.name}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <label className="text-xs text-zinc-500" htmlFor={`status-${task.id}`}>
            状态
          </label>
          <select
            id={`status-${task.id}`}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
            value={task.status}
            disabled={pending}
            onChange={onStatusChange}
          >
            {(Object.keys(statusLabel) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {editing ? (
          <>
            <Button type="button" onClick={onSaveEdit} disabled={pending}>
              {pending ? "保存中…" : "保存"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTitle(task.title);
                setDescription(task.description ?? "");
                setEditing(false);
              }}
              disabled={pending}
            >
              取消
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditing(true)}
              disabled={pending}
            >
              编辑
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={pending}
            >
              {pending ? "处理中…" : "删除"}
            </Button>
          </>
        )}
      </div>
      {pending ? (
        <p className="mt-3 text-xs text-amber-700">
          正在同步任务状态，请稍候…
        </p>
      ) : null}
    </article>
  );
}
