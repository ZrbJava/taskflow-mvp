"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { assertCan } from "@/lib/acl";

const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "项目名称不能为空")
    .max(60, "项目名称过长"),
});

export async function createProjectAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  const gate = assertCan(userId, "create", { type: "project", own: true });
  if (!gate.ok) return { ok: false as const, error: gate.error };

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
      userId: userId!,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/insights");
  revalidatePath("/tasks");

  return { ok: true as const, id: project.id };
}
