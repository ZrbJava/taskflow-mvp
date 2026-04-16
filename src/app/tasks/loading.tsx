export default function TasksLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-12">
      <section className="rounded-xl border border-zinc-200 bg-white p-8">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-8 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-zinc-100" />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-zinc-100" />
        <div className="mt-3 h-24 w-full animate-pulse rounded bg-zinc-100" />
      </section>
    </main>
  );
}
