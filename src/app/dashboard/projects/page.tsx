import { auth } from "@/auth";
import { prisma } from "@/lib/db";
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
      <p className="text-sm text-zinc-500">/dashboard/projects</p>
      <h1 className="mt-2 text-2xl font-semibold">我的项目</h1>
      <p className="mt-3 text-zinc-600">
        项目数据来自数据库并按当前登录用户过滤（Day 08–11 权限模型）。
      </p>

      {projects.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
          暂无项目。运行 <code className="rounded bg-white px-1">pnpm db:seed</code>{" "}
          可生成演示数据。
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
