"use client";

import { MessageSquare, Tag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addCommentAction,
  deleteCommentAction,
  listCommentsForTaskAction,
} from "@/app/actions/comments";
import { createLabelAction, listLabelsForUserAction, setTaskLabelsAction } from "@/app/actions/labels";
import {
  deleteTaskAction,
  setTaskAssigneeAction,
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
import { dueDateToYmd } from "@/lib/due-date";
import { PRIORITY_LABEL } from "@/lib/task-priority";
import type { TaskListItem, TaskPriority, TaskStatus } from "@/types/task";

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

type CommentRow = {
  id: string;
  body: string;
  createdAt: string;
  authorEmail: string;
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
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueYmd, setDueYmd] = useState(() => dueDateToYmd(task.dueDate));
  const [error, setError] = useState<string | null>(null);

  const [allLabels, setAllLabels] = useState<
    { id: string; name: string; color: string | null }[]
  >([]);
  const [labelSelection, setLabelSelection] = useState<string[]>(() =>
    task.labels.map((l) => l.id),
  );
  const [quickLabelName, setQuickLabelName] = useState("");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueYmd(dueDateToYmd(task.dueDate));
      setError(null);
      setLabelSelection(task.labels.map((l) => l.id));
    }
  }, [
    open,
    task.id,
    task.title,
    task.description,
    task.status,
    task.priority,
    task.dueDate,
    task.labels,
  ]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const [lr, cr] = await Promise.all([
        listLabelsForUserAction(),
        listCommentsForTaskAction(task.id),
      ]);
      if (cancelled) return;
      if (lr.ok) setAllLabels(lr.labels);
      if (cr.ok) setComments(cr.comments);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, task.id]);

  const dirty =
    title.trim() !== task.title ||
    (description.trim() || null) !== (task.description ?? null) ||
    status !== task.status ||
    priority !== task.priority ||
    dueYmd !== dueDateToYmd(task.dueDate);

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

  const onAssigneeChange = (value: string) => {
    startTransition(async () => {
      const res = await setTaskAssigneeAction(
        task.id,
        value === "me" ? "self" : "unassigned",
      );
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error ?? "更新负责人失败");
        return;
      }
      router.refresh();
      toast.success(value === "me" ? "已指派给我" : "已设为未分配");
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
      fd.set("priority", priority);
      fd.set("dueDate", dueYmd);
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

  const toggleLabel = (labelId: string) => {
    const next = labelSelection.includes(labelId)
      ? labelSelection.filter((id) => id !== labelId)
      : [...labelSelection, labelId];
    setLabelSelection(next);
    startTransition(async () => {
      const res = await setTaskLabelsAction(task.id, next);
      if (!res.ok) {
        toast.error(res.error ?? "更新标签失败");
        setLabelSelection(task.labels.map((l) => l.id));
        return;
      }
      router.refresh();
    });
  };

  const quickCreateLabel = () => {
    const n = quickLabelName.trim();
    if (!n.length) return;
    startTransition(async () => {
      const res = await createLabelAction(n, null);
      if (!res.ok) {
        toast.error(res.error ?? "创建标签失败");
        return;
      }
      setQuickLabelName("");
      const next = [...labelSelection, res.label.id];
      setLabelSelection(next);
      const setRes = await setTaskLabelsAction(task.id, next);
      if (!setRes.ok) {
        toast.error(setRes.error ?? "关联失败");
        return;
      }
      setAllLabels((prev) =>
        [...prev, res.label].sort((a, b) => a.name.localeCompare(b.name, "zh")),
      );
      router.refresh();
    });
  };

  const submitComment = () => {
    const body = newComment.trim();
    if (!body) return;
    startTransition(async () => {
      const res = await addCommentAction(task.id, body);
      if (!res.ok) {
        toast.error(res.error ?? "发送失败");
        return;
      }
      setNewComment("");
      const list = await listCommentsForTaskAction(task.id);
      if (list.ok) setComments(list.comments);
      router.refresh();
    });
  };

  const removeComment = (commentId: string) => {
    startTransition(async () => {
      const res = await deleteCommentAction(commentId);
      if (!res.ok) {
        toast.error(res.error ?? "删除失败");
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      router.refresh();
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex max-h-[100dvh] flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-zinc-900">
            任务详情
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-500">
            编辑内容、标签与讨论；标签在「工作台 → 标签」集中管理。
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
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
              rows={5}
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
            <div>
              <label className="text-xs font-medium text-zinc-500">优先级</label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label
              className="text-xs font-medium text-zinc-500"
              htmlFor="detail-due"
            >
              截止日期
            </label>
            <Input
              id="detail-due"
              type="date"
              className="mt-1"
              value={dueYmd}
              onChange={(e) => setDueYmd(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              留空表示不设截止日；保存时写入。
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500">负责人</label>
            <Select
              value={task.assignee ? "me" : "none"}
              onValueChange={onAssigneeChange}
              disabled={pending}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未分配</SelectItem>
                <SelectItem value="me">我</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-zinc-400">
              当前账号为单用户工作台；多人协作时可扩展指派成员。
            </p>
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

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
              <Tag className="h-3.5 w-3.5" />
              标签
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {allLabels.length === 0 ? (
                <p className="text-xs text-zinc-500">暂无可用标签，可在下方快速创建。</p>
              ) : (
                allLabels.map((l) => (
                  <label
                    key={l.id}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300"
                      checked={labelSelection.includes(l.id)}
                      onChange={() => toggleLabel(l.id)}
                    />
                    <span
                      style={l.color ? { color: l.color } : undefined}
                      className="font-medium text-zinc-800"
                    >
                      {l.name}
                    </span>
                  </label>
                ))
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                value={quickLabelName}
                onChange={(e) => setQuickLabelName(e.target.value)}
                placeholder="新标签名称"
                className="max-w-[12rem] text-sm"
                maxLength={48}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={quickCreateLabel}
                disabled={pending || !quickLabelName.trim()}
              >
                创建并关联
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
              <MessageSquare className="h-3.5 w-3.5" />
              讨论
            </div>
            <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
              {comments.length === 0 ? (
                <li className="text-xs text-zinc-500">暂无评论。</li>
              ) : (
                comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-2 py-1.5 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="whitespace-pre-wrap text-zinc-800">{c.body}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 shrink-0 px-1.5 text-zinc-400 hover:text-red-600"
                        onClick={() => removeComment(c.id)}
                        aria-label="删除评论"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-400">
                      {c.authorEmail} ·{" "}
                      {new Date(c.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <Textarea
              rows={3}
              className="mt-2 text-sm"
              placeholder="写一条评论…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              type="button"
              className="mt-2"
              onClick={submitComment}
              disabled={pending || !newComment.trim()}
            >
              发送
            </Button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 text-xs text-zinc-500">
            任务 ID：<span className="font-mono text-zinc-700">{task.id}</span>
          </div>
        </SheetBody>

        <SheetFooter className="border-t border-zinc-100 pt-4">
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
