import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "success";
};

const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-zinc-900 text-white",
  secondary: "bg-zinc-100 text-zinc-700",
  success: "bg-emerald-100 text-emerald-700",
};

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
