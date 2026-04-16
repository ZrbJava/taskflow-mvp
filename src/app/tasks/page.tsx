import { auth } from "@/auth";
import { TaskForm } from "@/components/task-form";
import { TasksView } from "@/components/tasks-view";
import { prisma } from "@/lib/db";
import { getTasksForUser } from "@/lib/tasks-data";
import type { TaskListItem } from "@/types/task";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [raw, projects] = await Promise.all([
    getTasksForUser(session.user.id),
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);
  const tasks: TaskListItem[] = raw.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    projectId: t.projectId,
    project: t.project,
  }));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-12">
      <section className="rounded-xl border border-zinc-200 bg-white p-8">
        <p className="text-sm text-zinc-500">Day 04–10 · 任务中心</p>
        <h1 className="mt-2 text-3xl font-semibold">我的任务</h1>
        <p className="mt-3 text-zinc-600">
          列表由服务端读取，筛选在客户端完成；创建/编辑/删除通过 Server Actions 写入数据库并触发
          `revalidatePath` 刷新相关页面。
        </p>
      </section>

      <TaskForm projects={projects} />
      <TasksView tasks={tasks} />
    </main>
  );
}
