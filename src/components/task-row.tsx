"use client";

import { toast } from "sonner";
import {
  deleteTaskAction,
  updateTaskStatusAction,
} from "@/app/actions/tasks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { TaskLabelChips } from "@/components/task-label-chips";
import { PRIORITY_BADGE_CLASS, PRIORITY_LABEL } from "@/lib/task-priority";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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

function formatDueShort(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

function isDueOverdue(iso: string, status: TaskStatus): boolean {
  if (status === "done") return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const d0 = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const t0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return d0 < t0;
}

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

export function TaskRow({
  task,
  initialDetailOpen = false,
  onDetailClose,
}: {
  task: TaskListItem;
  initialDetailOpen?: boolean;
  onDetailClose?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [detailOpen, setDetailOpen] = useState(initialDetailOpen);

  useEffect(() => {
    setDetailOpen(initialDetailOpen);
  }, [initialDetailOpen]);

  const onStatusChange = (value: string) => {
    const status = value as TaskStatus;
    startTransition(async () => {
      const res = await updateTaskStatusAction(task.id, status);
      if (!res.ok) {
        toast.error(res.error ?? "更新状态失败");
        return;
      }
      router.refresh();
      toast.success(`状态已更新为 ${statusLabel[status]}`);
    });
  };

  const onDelete = () => {
    if (!confirm("确定删除该任务？")) return;
    startTransition(async () => {
      const res = await deleteTaskAction(task.id);
      if (!res.ok) {
        toast.error(res.error ?? "删除失败");
        return;
      }
      router.refresh();
      toast.success("任务已删除");
    });
  };

  return (
    <>
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

        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-left"
        >
          {task.priority !== "none" ? (
            <span
              className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_BADGE_CLASS[task.priority]}`}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          ) : null}
          <span className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-zinc-900 transition group-hover:text-violet-700">
              {task.title}
            </div>
            {task.description ? (
              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {task.description}
              </p>
            ) : null}
            <TaskLabelChips labels={task.labels} className="mt-1.5" />
          </span>
        </button>

        <span className="hidden w-16 shrink-0 text-right text-xs sm:inline-block">
          {formatDueShort(task.dueDate) ? (
            <span
              className={
                task.dueDate && isDueOverdue(task.dueDate, task.status)
                  ? "font-medium text-red-600"
                  : "text-zinc-500"
              }
            >
              {formatDueShort(task.dueDate)}
            </span>
          ) : (
            <span className="text-zinc-300">—</span>
          )}
        </span>

        {task.project ? (
          <span className="hidden shrink-0 text-xs text-zinc-500 sm:inline sm:w-32 sm:text-right">
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
                    setDetailOpen(true);
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

      <TaskDetailSheet
        task={task}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) onDetailClose?.();
        }}
      />
    </>
  );
}
