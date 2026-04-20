"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TaskForm, type ProjectOption } from "@/components/task-form";

interface CreateTaskSheetProps {
  projects: ProjectOption[];
  defaultProjectId?: string | null;
}

export function CreateTaskSheet({
  projects,
  defaultProjectId,
}: CreateTaskSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" className="gap-2 rounded-lg">
          <Plus className="h-4 w-4" />
          新建任务
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-zinc-900">
            新建任务
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-500">
            填好后保存即可，列表会自动刷新。
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <TaskForm
            projects={projects}
            defaultProjectId={defaultProjectId ?? null}
            hideCard
            onCreated={() => setOpen(false)}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
