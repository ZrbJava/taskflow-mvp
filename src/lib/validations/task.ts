import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "doing", "done"]);

export const taskPrioritySchema = z.enum([
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
    .optional(),
});

export const updateTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "标题不能为空").max(120).optional(),
  description: z.string().max(500).optional().or(z.literal("")),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
