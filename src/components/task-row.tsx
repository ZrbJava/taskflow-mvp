"use client";

import {
  deleteTaskAction,
  updateTaskAction,
  updateTaskStatusAction,
} from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Circle,
  CircleCheck,
  CircleDashed,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

const statusLabel: Record<TaskStatus, string> = {
  todo: "待处理",
  doing: "进行中",
  done: "已完成",
};

const statusColor: Record<TaskStatus, string> = {
  todo: "text-zinc-400",
  doing: "text-amber-500",
  done: "text-emerald-600",
};

function StatusIcon({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  const cls = `h-4 w-4 ${statusColor[status]} ${className ?? ""}`;
  if (status === "done") return <CircleCheck className={cls} />;
  if (status === "doing") return <CircleDashed className={cls} />;
  return <Circle className={cls} />;
}

export function TaskRow({ task }: { task: TaskListItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  const onStatusChange = (value: string) => {
    const status = value as TaskStatus;
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

  if (editing) {
    return (
      <div className="bg-zinc-50/50 px-4 py-3">
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题"
          />
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述（可选）"
          />
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center gap-3 px-4 py-2 transition hover:bg-zinc-50">
      <div className="w-[104px] shrink-0">
        <Select
          value={task.status}
          onValueChange={onStatusChange}
          disabled={pending}
        >
          <SelectTrigger
            aria-label="任务状态"
            className="h-7! w-full border-0 bg-transparent px-1.5 py-1 text-xs text-zinc-700 shadow-none hover:bg-zinc-100 focus:ring-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(statusLabel) as TaskStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                <span className="inline-flex items-center gap-2">
                  <StatusIcon status={s} />
                  {statusLabel[s]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-zinc-900">
          {task.title}
        </div>
        {task.description ? (
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {task.description}
          </p>
        ) : null}
      </div>

      {task.project ? (
        <span className="hidden shrink-0 text-xs text-zinc-500 sm:inline">
          {task.project.name}
        </span>
      ) : null}

      <div className="relative w-8 shrink-0 text-right">
        <button
          type="button"
          onClick={() => setShowMenu((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-900 group-hover:opacity-100"
          aria-label="更多操作"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {showMenu ? (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 text-left shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setEditing(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                <Pencil className="h-3.5 w-3.5" />
                编辑
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
