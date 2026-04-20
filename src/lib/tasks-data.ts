import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { TaskStatus } from "@/types/task";

export type TaskWithProject = Awaited<
  ReturnType<typeof getTasksForUser>
>[number];

export type TaskSort = "updated_desc" | "updated_asc" | "created_desc" | "created_asc";

export interface TaskQuery {
  keyword?: string;
  status?: TaskStatus | "all";
  projectId?: string | "all";
  sort?: TaskSort;
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
  const { keyword, status, projectId, sort } = query;

  const where: Prisma.TaskWhereInput = { userId };

  if (status && status !== "all") {
    where.status = status;
  }

  if (projectId && projectId !== "all") {
    where.projectId = projectId;
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
