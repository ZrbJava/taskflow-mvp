export default function DashboardPage() {
  return (
    <div>
      <p className="text-sm text-zinc-500">/dashboard</p>
      <h1 className="mt-2 text-2xl font-semibold">仪表盘总览</h1>
      <p className="mt-3 text-zinc-600">
        这是 Dashboard 首页。它使用了 `dashboard/layout.tsx` 作为共享布局，
        左侧导航会在所有 dashboard 子页面中复用。
      </p>
    </div>
  );
}
