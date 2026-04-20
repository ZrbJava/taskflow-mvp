import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">/dashboard/projects</p>
          <h1 className="mt-2 text-2xl font-semibold">我的项目</h1>
          <p className="mt-3 text-zinc-600">
            项目数据来自数据库并按当前登录用户过滤。
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
          <p className="font-medium text-zinc-700">还没有项目</p>
          <p className="mt-1 text-zinc-500">
            点击右上角 “新建项目” 创建第一个项目，后续任务可以归类到其中。
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-violet-300 hover:shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/10 to-indigo-500/10 text-violet-600">
                  <FolderKanban className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {p.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    更新于 {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
