"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function CreateProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name);
      const res = await createProjectAction(fd);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error ?? "创建项目失败");
        return;
      }
      setName("");
      setOpen(false);
      router.refresh();
      toast.success("项目已创建");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2 rounded-lg">
          <Plus className="h-4 w-4" />
          新建项目
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-zinc-900">
            新建项目
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            给项目起个名字，后续可以把任务挂到该项目下。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-zinc-600" htmlFor="project-name">
              项目名称
            </label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：个人成长 2026"
              className="mt-1"
              autoFocus
              required
              maxLength={60}
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={pending}>
                取消
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending || name.trim().length === 0}>
              {pending ? "创建中…" : "创建项目"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
