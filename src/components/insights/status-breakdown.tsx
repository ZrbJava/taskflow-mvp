import type { TaskStatus } from "@/types/task";

interface StatusBreakdownProps {
  counts: Record<TaskStatus, number>;
}

const STATUS_META: Record<
  TaskStatus,
  { label: string; bar: string; dot: string }
> = {
  todo: {
    label: "待处理",
    bar: "bg-zinc-300",
    dot: "bg-zinc-400",
  },
  doing: {
    label: "进行中",
    bar: "bg-amber-400",
    dot: "bg-amber-500",
  },
  done: {
    label: "已完成",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
};

export function StatusBreakdown({ counts }: StatusBreakdownProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">状态分布</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            当前用户所有任务按状态占比
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          {total} 总数
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {(Object.keys(STATUS_META) as TaskStatus[]).map((s) => {
          const meta = STATUS_META[s];
          const value = counts[s] ?? 0;
          const pct = total === 0 ? 0 : Math.round((value / total) * 100);
          return (
            <div key={s}>
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 text-zinc-700">
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
                <span className="font-mono text-zinc-500">
                  {value} · {pct}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full ${meta.bar} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
