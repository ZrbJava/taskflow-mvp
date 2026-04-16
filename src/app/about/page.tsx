export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-12">
      <section className="rounded-xl border border-zinc-200 bg-white p-8">
        <h1 className="text-3xl font-semibold">关于这个学习项目</h1>
        <p className="mt-4 text-zinc-600">
          这是一个为 Vue 前端开发者设计的 Next.js 全栈学习项目。目标是在 14 天内
          完成一个可上线到 Vercel 的小型 MVP，并逐步掌握路由、数据、认证和部署。
        </p>
      </section>
    </main>
  );
}
