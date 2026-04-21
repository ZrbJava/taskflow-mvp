/**
 * ACL 第一版
 *
 * 设计目标：
 * - 统一权限判断入口：`can(userId, action, resource)`
 * - 便于扩展：未来接项目成员 / 角色（owner/admin/member）只需改 policies
 * - 保持纯函数：便于单元测试，不触碰数据库
 *
 * 调用方负责把需要检查的数据（比如 task.userId）先查出来再传进来。
 */

export type Action = "read" | "create" | "update" | "delete";

export type Resource =
  | {
      type: "task";
      /** 任务归属用户 ID（查库后带入） */
      ownerId: string;
    }
  | {
      type: "project";
      /** 项目归属用户 ID（查库后带入） */
      ownerId: string;
    }
  | {
      /** 列表/创建等无具体归属的操作，"任意自己的资源" */
      type: "task" | "project";
      own: true;
    };

export function can(
  userId: string | null | undefined,
  action: Action,
  resource: Resource,
): boolean {
  if (!userId) return false;

  // 创建类动作：只要登录就允许（真正的数据归属在创建时写进去）
  if (action === "create") {
    return true;
  }

  // 列表 / 读自己的资源：登录即可
  if ("own" in resource && resource.own) {
    return true;
  }

  // 具体资源：必须是资源拥有者
  if ("ownerId" in resource) {
    return resource.ownerId === userId;
  }

  return false;
}

/** 断言版本，权限不足时返回统一错误结构，便于 Server Actions 直接返回 */
export function assertCan(
  userId: string | null | undefined,
  action: Action,
  resource: Resource,
): { ok: true } | { ok: false; error: string } {
  if (!userId) {
    return { ok: false, error: "未登录" };
  }
  if (!can(userId, action, resource)) {
    return { ok: false, error: "无权限访问该资源" };
  }
  return { ok: true };
}
