export function RetroGrid({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-[70vh] perspective-midrange">
        <div className="retro-grid absolute inset-0 origin-[center_bottom] transform-[rotateX(55deg)]" />
      </div>
    </div>
  );
}
