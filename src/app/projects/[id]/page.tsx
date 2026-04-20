import { auth } from "@/auth";
import { CreateTaskSheet } from "@/components/create-task-sheet";
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
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
            Project
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            仅项目所有者可访问；任务列表同样按用户隔离。
          </p>
        </div>
        <CreateTaskSheet
          projects={[{ id: project.id, name: project.name }]}
          defaultProjectId={project.id}
        />
      </section>

      <TasksView
        tasks={tasks}
        projects={[{ id: project.id, name: project.name }]}
        currentQuery={{
          keyword: "",
          status: "all",
          projectId: project.id,
          sort: "updated_desc",
        }}
      />
    </main>
  );
}
