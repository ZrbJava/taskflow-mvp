import Link from 'next/link'

export default function Home() {
	return (
		<main className='mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-12'>
			<section className='rounded-xl border border-zinc-200 bg-white p-8'>
				<p className='text-sm text-zinc-500'>TaskFlow · 单仓库演进</p>
				<h1 className='mt-3 text-3xl font-semibold'>Next.js 全栈学习主页</h1>
				<p className='mt-4 text-zinc-600'>
					Day 04 起所有课程代码集中在当前项目：认证、Prisma、Server
					Actions、缓存
					失效、表单校验与基础测试。请先配置环境变量并执行数据库迁移与种子数据。
				</p>
				<div className='mt-6 flex flex-wrap gap-3'>
					<Link
						href='/login'
						className='rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700'
					>
						去登录
					</Link>
					<Link
						href='/tasks'
						className='rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100'
					>
						任务列表（需登录）
					</Link>
					<Link
						href='https://nextjs.org/docs'
						target='_blank'
						rel='noreferrer'
						className='rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100'
					>
						Next.js 文档
					</Link>
				</div>
			</section>
		</main>
	)
}
