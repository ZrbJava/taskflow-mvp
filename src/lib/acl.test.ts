import { describe, expect, it } from "vitest";
import { assertCan, can } from "./acl";

const OWNER = "user_owner";
const OTHER = "user_other";

describe("acl.can", () => {
  it("denies anonymous users for every action", () => {
    expect(can(null, "read", { type: "task", ownerId: OWNER })).toBe(false);
    expect(can(undefined, "update", { type: "task", ownerId: OWNER })).toBe(
      false,
    );
    expect(can("", "create", { type: "task", own: true })).toBe(false);
  });

  it("allows any authenticated user to create", () => {
    expect(can(OTHER, "create", { type: "task", own: true })).toBe(true);
    expect(can(OTHER, "create", { type: "project", own: true })).toBe(true);
  });

  it("allows owner-only access on concrete task", () => {
    expect(can(OWNER, "read", { type: "task", ownerId: OWNER })).toBe(true);
    expect(can(OWNER, "update", { type: "task", ownerId: OWNER })).toBe(true);
    expect(can(OWNER, "delete", { type: "task", ownerId: OWNER })).toBe(true);
  });

  it("denies non-owner on concrete task", () => {
    expect(can(OTHER, "read", { type: "task", ownerId: OWNER })).toBe(false);
    expect(can(OTHER, "update", { type: "task", ownerId: OWNER })).toBe(false);
    expect(can(OTHER, "delete", { type: "task", ownerId: OWNER })).toBe(false);
  });

  it("handles project owner/non-owner symmetrically", () => {
    expect(can(OWNER, "update", { type: "project", ownerId: OWNER })).toBe(
      true,
    );
    expect(can(OTHER, "update", { type: "project", ownerId: OWNER })).toBe(
      false,
    );
  });
});

describe("acl.assertCan", () => {
  it("returns ok when allowed", () => {
    expect(assertCan(OWNER, "read", { type: "task", ownerId: OWNER })).toEqual({
      ok: true,
    });
  });

  it("returns 未登录 when user is empty", () => {
    expect(assertCan(null, "read", { type: "task", ownerId: OWNER })).toEqual({
      ok: false,
      error: "未登录",
    });
  });

  it("returns 无权限访问该资源 for non-owners", () => {
    expect(assertCan(OTHER, "update", { type: "task", ownerId: OWNER })).toEqual(
      { ok: false, error: "无权限访问该资源" },
    );
  });
});
