import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/app/actions/auth";
import { AppProviders } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  title: {
    default: "TaskFlow MVP · Next.js 全栈学习",
    template: "%s · TaskFlow MVP",
  },
  description: "Vue 开发者从 0 到 1 的 Next.js 全栈任务管理示例（单仓库演进）",
  metadataBase: new URL(siteUrl),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <AppProviders>
          <header className="border-b border-zinc-200 bg-white">
            <nav className="mx-auto flex h-14 w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 text-sm">
              <Link href="/" className="font-medium hover:underline">
                首页
              </Link>
              <Link href="/tasks" className="font-medium hover:underline">
                任务
              </Link>
              <Link href="/dashboard" className="font-medium hover:underline">
                仪表盘
              </Link>
              <Link href="/dashboard/projects" className="font-medium hover:underline">
                项目
              </Link>
              <Link href="/about" className="font-medium hover:underline">
                关于
              </Link>
              <span className="ml-auto flex items-center gap-3">
                {session?.user ? (
                  <>
                    <span className="hidden text-zinc-500 sm:inline">
                      {session.user.email}
                    </span>
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100"
                      >
                        退出
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                  >
                    登录
                  </Link>
                )}
              </span>
            </nav>
          </header>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
