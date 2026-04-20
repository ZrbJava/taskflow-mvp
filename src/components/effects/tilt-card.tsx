"use client";

import { useRef, type HTMLAttributes, type PointerEvent } from "react";

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
}

export function TiltCard({
  className = "",
  children,
  max = 8,
  ...props
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * (max * 2);
    const ry = (x - 0.5) * (max * 2);
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`relative perspective-distant ${className}`}
      {...props}
    >
      <div
        className="relative transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform:
            "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-60 mix-blend-screen"
          style={{
            background:
              "radial-gradient(220px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.14), transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}
