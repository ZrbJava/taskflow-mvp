"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { signOut } from "@/auth";
import { prisma } from "@/lib/db";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("请输入合法邮箱"),
  password: z.string().min(6, "密码至少 6 位").max(72, "密码过长"),
  name: z.string().trim().max(40).optional(),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") ?? undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false as const,
      error:
        fieldErrors.email?.[0] ??
        fieldErrors.password?.[0] ??
        fieldErrors.name?.[0] ??
        "校验失败",
    };
  }

  const { email, password, name } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { ok: false as const, error: "该邮箱已注册" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name && name.length > 0 ? name : null,
    },
  });

  return { ok: true as const };
}
