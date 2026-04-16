"use client";

import { Button } from "@/components/ui/button";
import type { TaskStatus } from "@/types/task";

export type TaskFilterValue = "all" | TaskStatus;

interface TaskStatusFilterProps {
  value: TaskFilterValue;
  onChange: (value: TaskFilterValue) => void;
}

const options: { value: TaskFilterValue; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "todo", label: "待处理" },
  { value: "doing", label: "进行中" },
  { value: "done", label: "已完成" },
];

export function TaskStatusFilter({ value, onChange }: TaskStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          variant={value === opt.value ? "primary" : "secondary"}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
