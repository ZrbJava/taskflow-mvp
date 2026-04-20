import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-linear-to-b from-violet-500 to-violet-600 text-white shadow-sm hover:from-violet-500 hover:to-violet-700 focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:opacity-50",
  secondary:
    "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-violet-500/30 disabled:opacity-50",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-violet-500/30 disabled:opacity-50",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50",
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium outline-none transition ${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
