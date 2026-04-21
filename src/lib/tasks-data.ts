import { prisma } from "@/lib/db";
import { updatedAtFilterFromQuery } from "@/lib/date-query";
import type { Prisma } from "@prisma/client";
import type { TaskPaletteHit, TaskPriority, TaskStatus } from "@/types/task";

export type TaskWithProject = Awaited<
  ReturnType<typeof getTasksForUser>
>[number];

export type TaskSort =
  | "updated_desc"
  | "updated_asc"
  | "created_desc"
  | "created_asc"
  | "due_asc"
  | "due_desc";

export interface TaskQuery {
  keyword?: string;
  status?: TaskStatus | "all";
  projectId?: string | "all";
  sort?: TaskSort;
  priority?: TaskPriority | "all";
  /** YYYY-MM-DD，按任务 `updatedAt`（UTC 日界） */
  dateFrom?: string;
  dateTo?: string;
}

function buildOrderBy(
  sort: TaskSort = "updated_desc",
):
  | Prisma.TaskOrderByWithRelationInput
  | Prisma.TaskOrderByWithRelationInput[] {
  switch (sort) {
    case "updated_asc":
      return { updatedAt: "asc" };
    case "created_desc":
      return { createdAt: "desc" };
    case "created_asc":
      return { createdAt: "asc" };
    case "due_asc":
      return [
        { dueDate: { sort: "asc", nulls: "last" } },
        { updatedAt: "desc" },
      ];
    case "due_desc":
      return [
        { dueDate: { sort: "desc", nulls: "last" } },
        { updatedAt: "desc" },
      ];
    case "updated_desc":
    default:
      return { updatedAt: "desc" };
  }
}

export async function getTasksForUser(userId: string, query: TaskQuery = {}) {
  const { keyword, status, projectId, sort, dateFrom, dateTo, priority } =
    query;

  const where: Prisma.TaskWhereInput = { userId };

  if (status && status !== "all") {
    where.status = status;
  }

  if (projectId && projectId !== "all") {
    where.projectId = projectId;
  }

  if (priority && priority !== "all") {
    where.priority = priority;
  }

  const dateFilter = updatedAtFilterFromQuery(dateFrom, dateTo);
  if (dateFilter) {
    where.updatedAt = dateFilter;
  }

  const trimmed = keyword?.trim();
  if (trimmed) {
    where.OR = [
      { title: { contains: trimmed, mode: "insensitive" } },
      { description: { contains: trimmed, mode: "insensitive" } },
    ];
  }

  return prisma.task.findMany({
    where,
    orderBy: buildOrderBy(sort),
    include: {
      project: { select: { id: true, name: true } },
      labels: { select: { id: true, name: true, color: true } },
    },
  });
}

/** 命令面板等场景的轻量搜索，按最近更新排序，限制条数。 */
export async function searchTasksForPalette(
  userId: string,
  keyword: string,
  limit = 8,
): Promise<TaskPaletteHit[]> {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const rows = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: trimmed, mode: "insensitive" } },
        { description: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      project: { select: { id: true, name: true } },
    },
  });

  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() ?? null,
    project: t.project,
  }));
}
