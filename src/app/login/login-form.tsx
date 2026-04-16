"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function LoginForm() {
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

  return (
    <Card>
      <h1 className="text-xl font-semibold">登录 TaskFlow</h1>
      <p className="mt-2 text-sm text-zinc-600">
        演示账号：<span className="font-mono">demo@example.com</span> /{" "}
        <span className="font-mono">demo1234</span>
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm text-zinc-600" htmlFor="email">
            邮箱
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm text-zinc-600" htmlFor="password">
            密码
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "登录中…" : "登录"}
        </Button>
      </form>
    </Card>
  );
}
