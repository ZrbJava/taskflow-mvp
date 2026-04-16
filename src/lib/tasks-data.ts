import { prisma } from "@/lib/db";

export type TaskWithProject = Awaited<
  ReturnType<typeof getTasksForUser>
>[number];

export async function getTasksForUser(userId: string) {
  return prisma.task.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { project: { select: { id: true, name: true } } },
  });
}
