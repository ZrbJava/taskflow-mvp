export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 py-8">
      <aside className="h-fit w-56 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 space-y-2">
          <div className="h-8 w-full animate-pulse rounded bg-zinc-100" />
          <div className="h-8 w-full animate-pulse rounded bg-zinc-100" />
        </div>
      </aside>
      <section className="min-h-[360px] flex-1 rounded-xl border border-zinc-200 bg-white p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-4 w-11/12 animate-pulse rounded bg-zinc-100" />
      </section>
    </main>
  );
}
