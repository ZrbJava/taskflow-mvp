import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  accent?: "violet" | "amber" | "emerald" | "zinc";
}

const accentClass: Record<NonNullable<StatCardProps["accent"]>, string> = {
  violet: "from-violet-500/15 to-indigo-500/10 text-violet-600",
  amber: "from-amber-400/20 to-orange-500/10 text-amber-600",
  emerald: "from-emerald-400/20 to-teal-500/10 text-emerald-600",
  zinc: "from-zinc-200/80 to-zinc-100 text-zinc-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "violet",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br ${accentClass[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 font-mono text-[11px] text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
