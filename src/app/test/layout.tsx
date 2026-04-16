/*
 * @Description:
 * @Author: zhaorubo
 * @Email: zrbjava@gmail.com
 * @Date: 2026-04-10 09:57:56
 * @LastEditTime: 2026-04-10 10:09:41
 * @LastEditors: zhaorubo
 */

import Link from 'next/link'
export default function TestLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='mx-auto w-full max-w-4xl px-4'>
			<header>
				<nav className='flex gap-4  items-center   py-4 text-sm font-black '>
					<Link href='/test' className='hover:text-blue-500'>
						tab1
					</Link>
					<Link href='/test/tab2' className='hover:text-blue-500'>
						tab2
					</Link>
				</nav>
			</header>
			{children}
		</div>
	)
}
