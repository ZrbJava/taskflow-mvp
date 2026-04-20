import { auth } from "@/auth";
import { TaskForm } from "@/components/task-form";
import { TasksView } from "@/components/tasks-view";
import { prisma } from "@/lib/db";
import { getTasksForUser, type TaskQuery, type TaskSort } from "@/lib/tasks-data";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { redirect } from "next/navigation";

const ALLOWED_STATUS: TaskStatus[] = ["todo", "doing", "done"];
const ALLOWED_SORT: TaskSort[] = [
  "updated_desc",
  "updated_asc",
  "created_desc",
  "created_asc",
];

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseTaskQuery(
  sp: Record<string, string | string[] | undefined>,
): TaskQuery {
  const keyword = pickFirst(sp.keyword)?.trim() || undefined;

  const rawStatus = pickFirst(sp.status);
  const status =
    rawStatus === "all" || (rawStatus && ALLOWED_STATUS.includes(rawStatus as TaskStatus))
      ? (rawStatus as TaskQuery["status"])
      : undefined;

  const rawProject = pickFirst(sp.projectId);
  const projectId = rawProject ? rawProject : undefined;

  const rawSort = pickFirst(sp.sort);
  const sort =
    rawSort && ALLOWED_SORT.includes(rawSort as TaskSort)
      ? (rawSort as TaskSort)
      : undefined;

  return { keyword, status, projectId, sort };
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;
  const query = parseTaskQuery(sp);

  const [raw, projects] = await Promise.all([
    getTasksForUser(session.user.id, query),
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
          列表由服务端读取并按 URL 参数筛选；创建/编辑/删除通过 Server Actions 写入数据库并触发
          `revalidatePath` 刷新相关页面。
        </p>
      </section>

      <TaskForm projects={projects} />
      <TasksView
        tasks={tasks}
        projects={projects}
        currentQuery={{
          keyword: query.keyword ?? "",
          status: (query.status as string) ?? "all",
          projectId: (query.projectId as string) ?? "all",
          sort: query.sort ?? "updated_desc",
        }}
      />
    </main>
  );
}
