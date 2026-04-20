export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="min-h-[360px] rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
