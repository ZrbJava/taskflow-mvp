import { prisma } from "@/lib/db";
import { updatedAtFilterFromQuery } from "@/lib/date-query";
import type { Prisma } from "@prisma/client";
import type { TaskPaletteHit, TaskStatus } from "@/types/task";

export type TaskWithProject = Awaited<
  ReturnType<typeof getTasksForUser>
>[number];

export type TaskSort = "updated_desc" | "updated_asc" | "created_desc" | "created_asc";

export interface TaskQuery {
  keyword?: string;
  status?: TaskStatus | "all";
  projectId?: string | "all";
  sort?: TaskSort;
  /** YYYY-MM-DD，按任务 `updatedAt`（UTC 日界） */
  dateFrom?: string;
  dateTo?: string;
}

function buildOrderBy(sort: TaskSort = "updated_desc"): Prisma.TaskOrderByWithRelationInput {
  switch (sort) {
    case "updated_asc":
      return { updatedAt: "asc" };
    case "created_desc":
      return { createdAt: "desc" };
    case "created_asc":
      return { createdAt: "asc" };
    case "updated_desc":
    default:
      return { updatedAt: "desc" };
  }
}

export async function getTasksForUser(userId: string, query: TaskQuery = {}) {
  const { keyword, status, projectId, sort, dateFrom, dateTo } = query;

  const where: Prisma.TaskWhereInput = { userId };

  if (status && status !== "all") {
    where.status = status;
  }

  if (projectId && projectId !== "all") {
    where.projectId = projectId;
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
    include: { project: { select: { id: true, name: true } } },
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

  return prisma.task.findMany({
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
      project: { select: { id: true, name: true } },
    },
  });
}
