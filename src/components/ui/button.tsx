import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50",
  secondary:
    "border border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-50",
  ghost: "text-zinc-700 hover:bg-zinc-100 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-500 disabled:opacity-50",
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
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}
