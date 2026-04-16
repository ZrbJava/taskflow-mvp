import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 py-8">
      <aside className="h-fit w-56 rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Dashboard 导航
        </p>
        <nav className="mt-3 flex flex-col gap-2 text-sm">
          <Link href="/dashboard" className="rounded-md px-2 py-1 hover:bg-zinc-100">
            总览
          </Link>
          <Link
            href="/dashboard/projects"
            className="rounded-md px-2 py-1 hover:bg-zinc-100"
          >
            我的项目
          </Link>
        </nav>
      </aside>
      <section className="min-h-[360px] flex-1 rounded-xl border border-zinc-200 bg-white p-6">
        {children}
      </section>
    </main>
  );
}
