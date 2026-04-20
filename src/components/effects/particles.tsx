"use client";

import { useEffect, useState } from "react";

interface ParticlesProps {
  count?: number;
}

interface Particle {
  top: number;
  left: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}

export function Particles({ count = 60 }: ParticlesProps) {
  const [items, setItems] = useState<Particle[]>([]);

  useEffect(() => {
    setItems(
      Array.from({ length: count }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        dx: (Math.random() - 0.5) * 30,
        dy: -(Math.random() * 30 + 10),
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 6,
        size: Math.random() > 0.8 ? 3 : 2,
        opacity: 0.3 + Math.random() * 0.5,
      })),
    );
  }, [count]);

  if (items.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {items.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            ["--pdx" as string]: `${p.dx}px`,
            ["--pdy" as string]: `${p.dy}px`,
            ["--p-duration" as string]: `${p.duration}s`,
            ["--p-delay" as string]: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
