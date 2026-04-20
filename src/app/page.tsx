import Link from "next/link";
import {
  ArrowRight,
  Database,
  ExternalLink,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: ListChecks,
    title: "服务端筛选 + URL 同步",
    desc: "关键词、状态、项目、排序都跟 URL 走，刷新后依旧保留。",
  },
  {
    icon: ShieldCheck,
    title: "Auth.js v5 凭证登录",
    desc: "JWT 会话 + Edge 友好中间件，路径级受保护访问。",
  },
  {
    icon: Database,
    title: "Prisma + Neon Postgres",
    desc: "DIRECT_URL 迁移、Pooled 运行时连接，本地与线上一致。",
  },
  {
    icon: Zap,
    title: "Server Actions + 重验证",
    desc: "创建、编辑、删除后自动刷新相关页面缓存，无需手动拉取。",
  },
];

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-linear-to-b from-violet-500/10 via-indigo-400/5 to-transparent blur-2xl"
      />

      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"
        />

        <div className="relative flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 font-mono text-[11px] text-violet-700">
            <Sparkles className="h-3 w-3" />
            Next.js 16 · Prisma · Auth.js
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-wider text-zinc-400 sm:inline">
            v0.1 · MVP
          </span>
        </div>

        <h1 className="relative mt-5 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          <span className="bg-linear-to-br from-zinc-900 via-zinc-700 to-violet-600 bg-clip-text text-transparent">
            TaskFlow
          </span>
          <span className="ml-2 text-zinc-500">· 全栈任务工作台</span>
        </h1>
        <p className="relative mt-4 max-w-2xl text-base leading-7 text-zinc-600">
          为 Vue 开发者打造的 Next.js 学习项目，现已演进为一个可上线的轻量 SaaS
          风格任务管理原型：服务端渲染、凭证认证、Prisma + Postgres、Server
          Actions、部署到 Vercel。
        </p>

        <div className="relative mt-8 flex flex-wrap gap-3">
          {user ? (
            <>
              <Link href="/tasks">
                <Button className="gap-2">
                  进入任务
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">打开仪表盘</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button className="gap-2">
                  去登录
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary">关于项目</Button>
              </Link>
            </>
          )}
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Next.js 文档
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </a>
        </div>

        {user ? (
          <p className="relative mt-5 font-mono text-xs text-zinc-400">
            已登录：{user.email}
          </p>
        ) : (
          <p className="relative mt-5 font-mono text-xs text-zinc-400">
            演示账号 demo@example.com · demo1234
          </p>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Features
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
              这个项目目前提供的能力
            </h2>
          </div>
          <Link
            href="/about"
            className="hidden text-sm text-zinc-500 transition hover:text-violet-600 sm:inline"
          >
            了解更多 →
          </Link>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <li
                key={f.title}
                className="group rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-violet-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/10 to-indigo-500/10 text-violet-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-medium text-zinc-900">
                    {f.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {f.desc}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-6 text-sm text-zinc-500">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Roadmap
            </p>
            <p className="mt-1 text-zinc-600">
              下一步：任务详情抽屉、命令面板 <kbd className="mx-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-zinc-600">Cmd</kbd>
              <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-zinc-600">K</kbd>
              、多视图切换
            </p>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-violet-300 hover:text-violet-700"
          >
            立刻体验
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
