import Link from "next/link";
import { CircleDot } from "lucide-react";

interface ProjectRow {
  id: string;
  name: string;
  total: number;
  todo: number;
  doing: number;
  done: number;
}

interface ProjectsBreakdownProps {
  items: ProjectRow[];
}

export function ProjectsBreakdown({ items }: ProjectsBreakdownProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
        还没有项目，创建一个项目后可以在这里看到分布统计。
      </div>
    );
  }

  const max = Math.max(1, ...items.map((p) => p.total));

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
        <p className="text-sm font-medium text-zinc-900">项目分布</p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          任务密度
        </p>
      </div>
      <ul className="divide-y divide-zinc-100">
        {items.map((p) => {
          const pct = Math.round((p.total / max) * 100);
          return (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="group flex items-center gap-3 px-5 py-3 transition hover:bg-violet-50/30"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/10 to-indigo-500/10 text-violet-600">
                  <CircleDot className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-zinc-900 group-hover:text-violet-700">
                      {p.name}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {p.total} 任务
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-violet-500 to-indigo-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-zinc-400">
                    待处理 {p.todo} · 进行中 {p.doing} · 已完成 {p.done}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
