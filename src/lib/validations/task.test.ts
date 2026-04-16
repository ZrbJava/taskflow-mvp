import { describe, expect, it } from "vitest";
import { createTaskSchema } from "./task";

describe("createTaskSchema", () => {
  it("拒绝空标题", () => {
    const res = createTaskSchema.safeParse({ title: "" });
    expect(res.success).toBe(false);
  });

  it("接受合法标题", () => {
    const res = createTaskSchema.safeParse({
      title: "写单元测试",
      description: "",
      status: "todo",
    });
    expect(res.success).toBe(true);
  });
});
