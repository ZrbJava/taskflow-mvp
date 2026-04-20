"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { TaskListItem } from "@/types/task";
import {
  TaskStatusFilter,
  type TaskFilterValue,
} from "@/components/task-status-filter";
import { TaskRow } from "@/components/task-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TasksView({ tasks }: { tasks: TaskListItem[] }) {
  const [filter, setFilter] = useState<TaskFilterValue>("all");
  const [keyword, setKeyword] = useState("");
  const [projectId, setProjectId] = useState("all");

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((task) => {
      if (task.project?.id) {
        map.set(task.project.id, task.project.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const visible = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus = filter === "all" || task.status === filter;
      const matchesProject = projectId === "all" || task.projectId === projectId;
      const matchesKeyword =
        normalized.length === 0 ||
        task.title.toLowerCase().includes(normalized) ||
        task.description?.toLowerCase().includes(normalized);

      return matchesStatus && matchesProject && matchesKeyword;
    });
  }, [tasks, filter, keyword, projectId]);

  const hasActiveFilters = filter !== "all" || projectId !== "all" || keyword.trim() !== "";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-zinc-700">任务工具栏</p>
              <Badge variant="secondary">第一版</Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              先支持客户端关键词、状态、项目筛选，后续再接服务端高级搜索。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{visible.length} 条结果</Badge>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                className="gap-2 rounded-lg px-3"
                onClick={() => {
                  setKeyword("");
                  setFilter("all");
                  setProjectId("all");
                }}
              >
                <X className="h-4 w-4" />
                清空
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索标题或描述"
              className="pl-9"
            />
          </label>

          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="选择项目" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部项目</SelectItem>
              {projectOptions.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                className="justify-center gap-2 rounded-lg px-4"
              >
                <SlidersHorizontal className="h-4 w-4" />
                状态筛选
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <p className="text-sm font-medium text-zinc-800">按状态筛选</p>
              <p className="mt-1 text-xs text-zinc-500">后续这里会继续扩展日期和排序。</p>
              <div className="mt-3">
                <TaskStatusFilter value={filter} onChange={setFilter} />
              </div>
            </PopoverContent>
          </Popover>
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
