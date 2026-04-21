'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'

const SHORTCUT_GROUPS: {
	title: string
	items: { keys: string; desc: string }[]
}[] = [
	{
		title: '全局',
		items: [
			{ keys: '⌘ K / Ctrl+K', desc: '打开命令面板（搜索任务、跳转页面）' },
			{ keys: '?', desc: '打开本快捷键说明（输入框内无效）' },
		],
	},
	{
		title: '任务页 / 项目任务页',
		items: [
			{ keys: 'C', desc: '新建任务（打开撰写面板）' },
			{ keys: 'B', desc: '列表与看板视图切换' },
			{ keys: 'F', desc: '聚焦关键词搜索' },
		],
	},
]

export const OPEN_SHORTCUTS_EVENT = 'taskflow:open-shortcuts'

export function KeyboardShortcutsDialog() {
	const [open, setOpen] = useState(false)

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== '?' || e.metaKey || e.ctrlKey || e.altKey) return
			const el = e.target as HTMLElement | null
			if (!el) return
			if (
				el.tagName === 'INPUT' ||
				el.tagName === 'TEXTAREA' ||
				el.tagName === 'SELECT' ||
				el.isContentEditable
			) {
				return
			}
			e.preventDefault()
			setOpen(true)
		}

		const onOpen = () => setOpen(true)

		window.addEventListener('keydown', onKey)
		window.addEventListener(OPEN_SHORTCUTS_EVENT, onOpen)
		return () => {
			window.removeEventListener('keydown', onKey)
			window.removeEventListener(OPEN_SHORTCUTS_EVENT, onOpen)
		}
	}, [])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className='max-h-[min(90vh,32rem)] overflow-y-auto'>
				<DialogTitle className='text-lg font-semibold text-zinc-900'>
					键盘快捷键
				</DialogTitle>
				<DialogDescription className='text-sm text-zinc-500'>
					参考 Linear、Notion 等产品的习惯：减少鼠标依赖，快速跳转与创建。
				</DialogDescription>
				<div className='mt-4 space-y-5'>
					{SHORTCUT_GROUPS.map(group => (
						<div key={group.title}>
							<p className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>
								{group.title}
							</p>
							<ul className='space-y-2'>
								{group.items.map(row => (
									<li
										key={row.desc}
										className='flex items-start justify-between gap-4 text-sm'
									>
										<span className='text-zinc-600'>{row.desc}</span>
										<kbd className='shrink-0 rounded border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[11px] text-zinc-700'>
											{row.keys}
										</kbd>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<p className='mt-4 text-xs text-zinc-400'>
					在命令面板中也可使用 ↑↓ 选择、Enter 执行；Esc 关闭对话框。
				</p>
			</DialogContent>
		</Dialog>
	)
}
