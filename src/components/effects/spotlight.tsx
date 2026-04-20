"use client";

import { useEffect, useRef } from "react";

interface SpotlightProps {
  className?: string;
  size?: number;
  color?: string;
}

export function Spotlight({
  className = "",
  size = 520,
  color = "rgba(139, 92, 246, 0.22)",
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 ${className}`}
      style={{
        background: `radial-gradient(${size}px circle at var(--x, 50%) var(--y, 30%), ${color}, transparent 60%)`,
      }}
    />
  );
}
