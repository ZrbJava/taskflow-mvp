import Link from 'next/link'

export default function NotFound() {
	return (
		<main className='mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-12'>
			<section className='rounded-xl border border-zinc-200 bg-white p-8 text-center'>
				<p className='text-sm text-zinc-500'>404</p>
				<h1 className='mt-3 text-3xl font-semibold'>页面不存在</h1>
				<p className='mt-4 text-zinc-600'>
					你访问的页面可能已被移动，或链接地址有误。
				</p>
				<Link
					href='/'
					className='mt-6 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700'
				>
					返回首页
				</Link>
			</section>
		</main>
	)
}
