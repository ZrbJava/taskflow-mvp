import type { TaskPriority } from "@/types/task";

export const PRIORITY_ORDER: TaskPriority[] = [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  none: "无",
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
};

export const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  none: "border-transparent bg-zinc-100 text-zinc-500",
  low: "border-sky-200/80 bg-sky-50 text-sky-800",
  medium: "border-amber-200/80 bg-amber-50 text-amber-900",
  high: "border-orange-200/80 bg-orange-50 text-orange-900",
  urgent: "border-red-200/80 bg-red-50 text-red-800",
};
