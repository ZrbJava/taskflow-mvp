"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "项目名称不能为空")
    .max(60, "项目名称过长"),
});

export async function createProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "未登录" };
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.flatten().fieldErrors.name?.[0] ?? "校验失败",
    };
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      userId: session.user.id,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath("/tasks");

  return { ok: true as const, id: project.id };
}
