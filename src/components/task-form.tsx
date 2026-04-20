"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "@/lib/validations/task";

export interface ProjectOption {
  id: string;
  name: string;
}

interface TaskFormProps {
  projects: ProjectOption[];
  defaultProjectId?: string | null;
  hideCard?: boolean;
  onCreated?: () => void;
}

export function TaskForm({
  projects,
  defaultProjectId,
  hideCard = false,
  onCreated,
}: TaskFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [projectId, setProjectId] = useState("");

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("title", values.title);
      fd.set("description", values.description ?? "");
      if (values.status) fd.set("status", values.status);
      if (defaultProjectId) {
        fd.set("projectId", defaultProjectId);
      } else if (projectId) {
        fd.set("projectId", projectId);
      }

      const res = await createTaskAction(fd);
      if (!res.ok) {
        form.setError("root", { message: res.error });
        toast.error(res.error ?? "创建任务失败");
        return;
      }
      form.reset();
      setProjectId("");
      router.refresh();
      toast.success("任务已创建");
      onCreated?.();
    });
  });

  const content = (
    <>
      {!hideCard ? (
        <h2 className="text-lg font-semibold">新建任务</h2>
      ) : null}
      <form className={hideCard ? "space-y-3" : "mt-4 space-y-3"} onSubmit={onSubmit}>
        <div>
          <label className="text-sm text-zinc-600" htmlFor="title">
            标题
          </label>
          <Input id="title" className="mt-1" {...form.register("title")} />
          {form.formState.errors.title ? (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="text-sm text-zinc-600" htmlFor="description">
            描述（可选）
          </label>
          <Textarea
            id="description"
            rows={4}
            className="mt-1"
            {...form.register("description")}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="text-sm text-zinc-600" htmlFor="status">
              初始状态
            </label>
            <select
              id="status"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              {...form.register("status")}
            >
              <option value="todo">待处理</option>
              <option value="doing">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
          {projects.length > 0 && !defaultProjectId ? (
            <div>
              <label className="text-sm text-zinc-600" htmlFor="projectId">
                所属项目（可选）
              </label>
              <select
                id="projectId"
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">未分组</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        {form.formState.errors.root ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "提交中…" : "创建任务"}
        </Button>
      </form>
    </>
  );

  if (hideCard) {
    return content;
  }

  return <Card>{content}</Card>;
}
