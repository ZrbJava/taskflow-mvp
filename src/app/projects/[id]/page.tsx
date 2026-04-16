import { auth } from "@/auth";
import { TaskForm } from "@/components/task-form";
import { TasksView } from "@/components/tasks-view";
import { prisma } from "@/lib/db";
import type { TaskListItem } from "@/types/task";
import { notFound, redirect } from "next/navigation";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!project) {
    notFound();
  }

  const rows = await prisma.task.findMany({
    where: { projectId: id, userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { project: { select: { id: true, name: true } } },
  });

  const tasks: TaskListItem[] = rows.map((t) => ({
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
        <p className="text-sm text-zinc-500">/projects/[id]</p>
        <h1 className="mt-3 text-3xl font-semibold">{project.name}</h1>
        <p className="mt-4 text-zinc-600">
          仅项目所有者可访问；任务列表同样按用户隔离。
        </p>
      </section>

      <TaskForm projects={[]} defaultProjectId={project.id} />
      <TasksView tasks={tasks} />
    </main>
  );
}
