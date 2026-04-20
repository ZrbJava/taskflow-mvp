"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { RegisterDialog } from "@/components/register-dialog";

interface LoginFormProps {
  dark?: boolean;
}

export function LoginForm({ dark = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/tasks";

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("邮箱或密码错误");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    });
  };

  const labelClass = dark ? "text-xs text-zinc-400" : "text-sm text-zinc-600";
  const inputClass = dark
    ? "mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 transition focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/30"
    : "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
  const headingClass = dark
    ? "text-lg font-semibold tracking-tight text-white"
    : "text-xl font-semibold tracking-tight text-zinc-900";
  const descClass = dark
    ? "mt-2 text-sm text-zinc-400"
    : "mt-2 text-sm text-zinc-600";
  const demoColor = dark ? "text-violet-300" : "text-violet-700";
  const registerBtnClass = dark
    ? "text-sm text-zinc-400 transition hover:text-violet-300"
    : "text-sm text-zinc-500 transition hover:text-violet-600";

  return (
    <div className="p-6 sm:p-8">
      <h1 className={headingClass}>登录 TaskFlow</h1>
      <p className={descClass}>
        演示账号：
        <span className={`font-mono ${demoColor}`}>demo@example.com</span>{" "}
        / <span className={`font-mono ${demoColor}`}>demo1234</span>
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className={labelClass} htmlFor="email">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">
            密码
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <div className="flex items-center justify-between gap-3">
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "登录中…" : "登录"}
          </Button>
          <RegisterDialog>
            <DialogTrigger asChild>
              <button type="button" className={registerBtnClass}>
                还没有账号？注册
              </button>
            </DialogTrigger>
          </RegisterDialog>
        </div>
      </form>
    </div>
  );
}
