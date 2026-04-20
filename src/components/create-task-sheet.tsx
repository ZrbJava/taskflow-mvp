"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("compose") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && searchParams.get("compose") === "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("compose");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
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
            onCreated={() => handleOpenChange(false)}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
