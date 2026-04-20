export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-4 w-11/12 animate-pulse rounded bg-zinc-100" />
        <div className="mt-3 h-4 w-7/12 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}
