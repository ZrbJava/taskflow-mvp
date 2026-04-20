"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RegisterDialogProps {
  children: React.ReactNode;
}

export function RegisterDialog({ children }: RegisterDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("password", password);
      if (name) fd.set("name", name);
      const res = await registerAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("注册成功，但自动登录失败，请手动登录");
        setOpen(false);
        return;
      }
      setOpen(false);
      router.push("/tasks");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-zinc-900">
            创建账号
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            输入邮箱和密码即可注册，注册后会自动登录。
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-zinc-600" htmlFor="reg-email">
              邮箱
            </label>
            <Input
              id="reg-email"
              type="email"
              className="mt-1"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600" htmlFor="reg-password">
              密码
            </label>
            <Input
              id="reg-password"
              type="password"
              className="mt-1"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600" htmlFor="reg-name">
              昵称（可选）
            </label>
            <Input
              id="reg-name"
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={pending}>
                取消
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                pending ||
                email.trim().length === 0 ||
                password.trim().length < 6
              }
            >
              {pending ? "注册中…" : "注册并登录"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
