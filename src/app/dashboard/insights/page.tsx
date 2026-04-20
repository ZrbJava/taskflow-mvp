import {
  CircleCheck,
  CircleDashed,
  CircleDot,
  FolderKanban,
  ListChecks,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/insights/stat-card";
import { StatusBreakdown } from "@/components/insights/status-breakdown";
import { TrendChart } from "@/components/insights/trend-chart";
import { ProjectsBreakdown } from "@/components/insights/projects-breakdown";

export const metadata = {
  title: "Insights · TaskFlow MVP",
  description: "任务数据洞察：总量、状态分布、近 7 天趋势、项目密度",
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayLabel(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const sevenAgo = new Date(startOfToday().getTime() - 6 * 24 * 60 * 60 * 1000);

  const [
    totalTasks,
    todoTasks,
    doingTasks,
    doneTasks,
    projects,
    recentTasks,
  ] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: "todo" } }),
    prisma.task.count({ where: { userId, status: "doing" } }),
    prisma.task.count({ where: { userId, status: "done" } }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        tasks: { select: { status: true } },
      },
    }),
    prisma.task.findMany({
      where: { userId, createdAt: { gte: sevenAgo } },
      select: { createdAt: true },
    }),
  ]);

  const trend = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sevenAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const next = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    const value = recentTasks.filter(
      (t) => t.createdAt >= day && t.createdAt < next,
    ).length;
    return { label: formatDayLabel(day), value };
  });

  const projectRows = projects.map((p) => {
    const total = p.tasks.length;
    const todo = p.tasks.filter((t) => t.status === "todo").length;
    const doing = p.tasks.filter((t) => t.status === "doing").length;
    const done = p.tasks.filter((t) => t.status === "done").length;
    return {
      id: p.id,
      name: p.name,
      total,
      todo,
      doing,
      done,
    };
  });

  const doneRate =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div>
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
          Insights
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          数据洞察
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          仅你本人可见：任务规模、推进节奏、项目密度一目了然。
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="总任务"
          value={totalTasks}
          icon={ListChecks}
          hint={`完成率 ${doneRate}%`}
          accent="violet"
        />
        <StatCard
          label="待处理"
          value={todoTasks}
          icon={CircleDot}
          accent="zinc"
        />
        <StatCard
          label="进行中"
          value={doingTasks}
          icon={CircleDashed}
          accent="amber"
        />
        <StatCard
          label="已完成"
          value={doneTasks}
          icon={CircleCheck}
          accent="emerald"
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <TrendChart
          title="近 7 天新增任务"
          description="按日统计今日起回溯 7 天创建量"
          data={trend}
        />
        <StatusBreakdown
          counts={{
            todo: todoTasks,
            doing: doingTasks,
            done: doneTasks,
          }}
        />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-900">项目概览</p>
          <p className="text-xs text-zinc-500">共 {projects.length} 个</p>
        </div>
        <ProjectsBreakdown items={projectRows} />
      </div>
    </div>
  );
}
