"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TaskListItem, TaskStatus } from "@/types/task";

interface TaskDetailSheetProps {
  task: TaskListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabel: Record<TaskStatus, string> = {
  todo: "待处理",
  doing: "进行中",
  done: "已完成",
};

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
}: TaskDetailSheetProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setError(null);
    }
  }, [open, task.id, task.title, task.description, task.status]);

  const dirty =
    title.trim() !== task.title ||
    (description.trim() || null) !== (task.description ?? null) ||
    status !== task.status;

  const onStatusChange = (value: string) => {
    const next = value as TaskStatus;
    setStatus(next);
    startTransition(async () => {
      const res = await updateTaskStatusAction(task.id, next);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error ?? "更新状态失败");
        return;
      }
      router.refresh();
      toast.success(`状态已更新为 ${statusLabel[next]}`);
    });
  };

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", task.id);
      fd.set("title", title);
      fd.set("description", description);
      fd.set("status", status);
      const res = await updateTaskAction(fd);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error ?? "保存失败");
        return;
      }
      router.refresh();
      toast.success("任务已保存");
      onOpenChange(false);
    });
  };

  const onDelete = () => {
    if (!confirm("确定删除该任务？")) return;
    startTransition(async () => {
      const res = await deleteTaskAction(task.id);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error ?? "删除失败");
        return;
      }
      router.refresh();
      toast.success("任务已删除");
      onOpenChange(false);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-zinc-900">
            任务详情
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-500">
            编辑标题、描述或切换状态，保存后列表将自动刷新。
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-500" htmlFor="detail-title">
              标题
            </label>
            <Input
              id="detail-title"
              className="mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label
              className="text-xs font-medium text-zinc-500"
              htmlFor="detail-desc"
            >
              描述
            </label>
            <Textarea
              id="detail-desc"
              rows={6}
              className="mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可填写更多细节"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-500">状态</label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusLabel) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {task.project ? (
              <div>
                <label className="text-xs font-medium text-zinc-500">
                  所属项目
                </label>
                <div className="mt-1 inline-flex h-10 w-full items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">
                  {task.project.name}
                </div>
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 text-xs text-zinc-500">
            任务 ID：<span className="font-mono text-zinc-700">{task.id}</span>
          </div>
        </SheetBody>

        <SheetFooter>
          <div className="flex flex-1 items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onDelete}
              disabled={pending}
              className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                关闭
              </Button>
              <Button
                type="button"
                onClick={onSave}
                disabled={pending || !dirty || title.trim().length === 0}
              >
                {pending ? "保存中…" : "保存"}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
