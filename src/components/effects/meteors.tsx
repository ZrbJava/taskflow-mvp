"use client";

import { useEffect, useState } from "react";

interface Meteor {
  left: number;
  delay: number;
  duration: number;
}

export function Meteors({ count = 14 }: { count?: number }) {
  const [items, setItems] = useState<Meteor[]>([]);

  useEffect(() => {
    setItems(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 4 + Math.random() * 6,
      })),
    );
  }, [count]);

  if (items.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {items.map((m, i) => (
        <span
          key={i}
          className="meteor"
          style={{
            left: `${m.left}%`,
            ["--meteor-delay" as string]: `${m.delay}s`,
            ["--meteor-duration" as string]: `${m.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
