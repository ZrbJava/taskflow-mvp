"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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

interface ProjectOption {
  id: string;
  name: string;
}

interface CurrentQuery {
  keyword: string;
  status: string;
  projectId: string;
  sort: string;
}

interface TasksViewProps {
  tasks: TaskListItem[];
  projects: ProjectOption[];
  currentQuery: CurrentQuery;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "updated_desc", label: "最近更新" },
  { value: "updated_asc", label: "最早更新" },
  { value: "created_desc", label: "最新创建" },
  { value: "created_asc", label: "最早创建" },
];

function buildQueryString(params: Record<string, string>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    if (key === "status" && value === "all") return;
    if (key === "projectId" && value === "all") return;
    if (key === "sort" && value === "updated_desc") return;
    search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function TasksView({ tasks, projects, currentQuery }: TasksViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [keyword, setKeyword] = useState(currentQuery.keyword);
  const [status, setStatus] = useState<TaskFilterValue>(
    (currentQuery.status as TaskFilterValue) || "all",
  );
  const [projectId, setProjectId] = useState(currentQuery.projectId || "all");
  const [sort, setSort] = useState(currentQuery.sort || "updated_desc");

  useEffect(() => {
    setKeyword(currentQuery.keyword);
    setStatus((currentQuery.status as TaskFilterValue) || "all");
    setProjectId(currentQuery.projectId || "all");
    setSort(currentQuery.sort || "updated_desc");
  }, [currentQuery.keyword, currentQuery.status, currentQuery.projectId, currentQuery.sort]);

  const applyQuery = (next: Partial<CurrentQuery>) => {
    const merged: Record<string, string> = {
      keyword,
      status,
      projectId,
      sort,
      ...next,
    };
    const qs = buildQueryString(merged);
    startTransition(() => {
      router.push(`/tasks${qs}`);
    });
  };

  const onKeywordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    applyQuery({ keyword: keyword.trim() });
  };

  const resetAll = () => {
    setKeyword("");
    setStatus("all");
    setProjectId("all");
    setSort("updated_desc");
    startTransition(() => {
      router.push("/tasks");
    });
  };

  const hasActiveFilters =
    status !== "all" ||
    projectId !== "all" ||
    (currentQuery.keyword && currentQuery.keyword.length > 0) ||
    sort !== "updated_desc";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-zinc-700">任务工具栏</p>
              <Badge variant="secondary">服务端筛选</Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              关键词、状态、项目、排序都走 URL 参数，刷新后依旧保留。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{tasks.length} 条结果</Badge>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                className="gap-2 rounded-lg px-3"
                onClick={resetAll}
                disabled={pending}
              >
                <X className="h-4 w-4" />
                清空
              </Button>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={onKeywordSubmit}
          className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]"
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索标题或描述，回车应用"
              className="pl-9"
            />
          </label>

          <Select
            value={projectId}
            onValueChange={(value) => {
              setProjectId(value);
              applyQuery({ projectId: value });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择项目" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部项目</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value);
              applyQuery({ sort: value });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
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
              <p className="mt-1 text-xs text-zinc-500">后续这里会继续扩展日期和更多条件。</p>
              <div className="mt-3">
                <TaskStatusFilter
                  value={status}
                  onChange={(value) => {
                    setStatus(value);
                    applyQuery({ status: value });
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </form>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          当前筛选下没有任务。
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50/50 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            <span className="w-[104px] shrink-0">状态</span>
            <span className="min-w-0 flex-1">任务</span>
            <span className="hidden shrink-0 text-right sm:inline-block sm:w-32">
              项目
            </span>
            <span className="w-8 shrink-0" aria-hidden />
          </div>
          <ul className="divide-y divide-zinc-100">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
