"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  LayoutGrid,
  ListChecks,
  FolderKanban,
  Info,
  LogOut,
  CircleDot,
  Sparkles,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

interface SidebarProject {
  id: string;
  name: string;
}

interface AppSidebarProps {
  userEmail?: string | null;
  projects: SidebarProject[];
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "概览", icon: LayoutGrid, exact: true },
  { href: "/tasks", label: "我的任务", icon: ListChecks, exact: false },
  { href: "/dashboard/projects", label: "项目列表", icon: FolderKanban, exact: false },
  { href: "/about", label: "关于", icon: Info, exact: true },
];

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ userEmail, projects }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">TaskFlow</span>
          <span className="truncate text-xs text-zinc-500">
            {userEmail ?? "未登录"}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
        <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          工作区
        </div>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/tasks"
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-700 hover:bg-zinc-100 ${
                pathname === "/tasks" ? "bg-zinc-100 font-medium text-zinc-900" : ""
              }`}
            >
              <Inbox className="h-4 w-4 text-zinc-500" />
              收件箱
            </Link>
          </li>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-700 hover:bg-zinc-100 ${
                    active ? "bg-zinc-100 font-medium text-zinc-900" : ""
                  }`}
                >
                  <Icon className="h-4 w-4 text-zinc-500" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {projects.length > 0 ? (
          <>
            <div className="mt-5 px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              我的项目
            </div>
            <ul className="space-y-0.5">
              {projects.map((project) => {
                const href = `/projects/${project.id}`;
                const active = pathname === href;
                return (
                  <li key={project.id}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-700 hover:bg-zinc-100 ${
                        active ? "bg-zinc-100 font-medium text-zinc-900" : ""
                      }`}
                    >
                      <CircleDot className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </nav>

      <form
        action={signOutAction}
        className="border-t border-zinc-200 px-3 py-3"
      >
        <button
          type="submit"
          className="inline-flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </form>
    </aside>
  );
}
