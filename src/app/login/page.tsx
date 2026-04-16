import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "登录 · TaskFlow MVP",
  description: "使用邮箱与密码登录学习任务管理示例",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-12">
      <Suspense fallback={<p className="text-sm text-zinc-500">加载中…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
