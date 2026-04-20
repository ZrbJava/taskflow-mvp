import type { HTMLAttributes } from "react";

interface GradientBorderProps extends HTMLAttributes<HTMLDivElement> {
  radius?: string;
}

export function GradientBorder({
  className = "",
  radius = "rounded-2xl",
  children,
  ...props
}: GradientBorderProps) {
  return (
    <div className={`gradient-border ${radius} ${className}`} {...props}>
      {children}
    </div>
  );
}
