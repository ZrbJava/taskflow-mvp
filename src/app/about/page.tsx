import Link from 'next/link'
import { ArrowLeft, BookOpen, Code2, MapPinned } from 'lucide-react'

export default function AboutPage() {
	return (
		<main className='relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12'>
			<div
				aria-hidden
				className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-linear-to-b from-violet-500/10 to-transparent blur-2xl'
			/>

			<Link
				href='/'
				className='inline-flex w-fit items-center gap-1.5 text-sm text-zinc-500 transition hover:text-violet-600'
			>
				<ArrowLeft className='h-4 w-4' />
				返回首页
			</Link>

			<section className='rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm'>
				<p className='font-mono text-xs uppercase tracking-wider text-zinc-400'>
					About
				</p>
				<h1 className='mt-1 text-3xl font-semibold tracking-tight text-zinc-900'>
					关于这个学习项目
				</h1>
				<p className='mt-4 text-zinc-600'>
					这是一个为 Vue 前端开发者设计的 Next.js 全栈学习项目。目标是在 14 天内
					完成一个可上线到 Vercel 的小型 MVP，并逐步掌握路由、数据、认证和部署。
				</p>

				<ul className='mt-6 grid gap-3 sm:grid-cols-2'>
					<li className='flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4'>
						<span className='mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/10 to-indigo-500/10 text-violet-600'>
							<MapPinned className='h-4 w-4' />
						</span>
						<div>
							<p className='text-sm font-medium text-zinc-900'>演进式单仓库</p>
							<p className='mt-1 text-sm text-zinc-500'>
								Day 04 起所有代码集中在这里，按天叠加能力。
							</p>
						</div>
					</li>
					<li className='flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4'>
						<span className='mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/10 to-indigo-500/10 text-violet-600'>
							<BookOpen className='h-4 w-4' />
						</span>
						<div>
							<p className='text-sm font-medium text-zinc-900'>渐进式学习</p>
							<p className='mt-1 text-sm text-zinc-500'>
								从 SSR 到 Server Actions，再到部署与优化。
							</p>
						</div>
					</li>
				</ul>

				<div className='mt-8 flex flex-wrap items-center gap-3'>
					<a
						href='https://nextjs.org/docs'
						target='_blank'
						rel='noreferrer'
						className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:border-violet-300 hover:text-violet-700'
					>
						<BookOpen className='h-4 w-4' />
						Next.js 文档
					</a>
					<a
						href='https://github.com/vercel/next.js'
						target='_blank'
						rel='noreferrer'
						className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:border-violet-300 hover:text-violet-700'
					>
						<Code2 className='h-4 w-4' />
						GitHub
					</a>
				</div>
			</section>
		</main>
	)
}
