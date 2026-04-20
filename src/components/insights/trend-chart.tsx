interface TrendPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  title?: string;
  description?: string;
  data: TrendPoint[];
}

export function TrendChart({ title, description, data }: TrendChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          {title ? (
            <p className="text-sm font-medium text-zinc-900">{title}</p>
          ) : null}
          {description ? (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          ) : null}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          峰值 {max}
        </p>
      </div>

      <div className="mt-5 flex h-32 items-end gap-2">
        {data.map((d, i) => {
          const ratio = max === 0 ? 0 : d.value / max;
          return (
            <div
              key={i}
              className="group flex flex-1 flex-col items-center justify-end"
            >
              <div
                className="relative w-full rounded-md bg-linear-to-t from-violet-500/80 to-indigo-500/80 transition-all"
                style={{ height: `${Math.max(6, ratio * 100)}%` }}
              >
                <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                  {d.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 text-[10px] text-zinc-500">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center font-mono">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
