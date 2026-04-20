const ORBS = [
  {
    className: "-top-32 -left-20 h-96 w-96",
    color: "rgba(139, 92, 246, 0.6)",
    duration: "18s",
    dx: "60px",
    dy: "-40px",
  },
  {
    className: "top-1/3 -right-24 h-[28rem] w-[28rem]",
    color: "rgba(99, 102, 241, 0.55)",
    duration: "22s",
    dx: "-80px",
    dy: "30px",
  },
  {
    className: "-bottom-40 left-1/4 h-[26rem] w-[26rem]",
    color: "rgba(236, 72, 153, 0.35)",
    duration: "26s",
    dx: "50px",
    dy: "-60px",
  },
];

export function AnimatedOrbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {ORBS.map((o, i) => (
        <div
          key={i}
          className={`orb ${o.className}`}
          style={{
            background: o.color,
            ["--orb-duration" as string]: o.duration,
            ["--odx" as string]: o.dx,
            ["--ody" as string]: o.dy,
          }}
        />
      ))}
    </div>
  );
}
