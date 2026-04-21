'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createLabelAction } from '@/app/actions/labels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CreateLabelForm() {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [name, setName] = useState('')
	const [color, setColor] = useState('')

	const submit = (e: React.FormEvent) => {
		e.preventDefault()
		const n = name.trim()
		if (!n) return
		startTransition(async () => {
			const res = await createLabelAction(n, color.trim() || null)
			if (!res.ok) {
				toast.error(res.error ?? '创建失败')
				return
			}
			toast.success('标签已创建')
			setName('')
			setColor('')
			router.refresh()
		})
	}

	return (
		<form onSubmit={submit} className='flex flex-col gap-2 sm:flex-row sm:items-end'>
			<div className='min-w-0 flex-1'>
				<label className='text-xs font-medium text-zinc-500' htmlFor='new-label-name'>
					新建标签
				</label>
				<Input
					id='new-label-name'
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder='名称，如「前端」「Bug」'
					className='mt-1'
					maxLength={48}
				/>
			</div>
			<div className='w-full sm:w-28'>
				<label className='text-xs font-medium text-zinc-500' htmlFor='new-label-color'>
					颜色（可选）
				</label>
				<Input
					id='new-label-color'
					value={color}
					onChange={e => setColor(e.target.value)}
					placeholder="#6366f1"
					className='mt-1 font-mono text-xs'
				/>
			</div>
			<Button type='submit' disabled={pending || !name.trim()} className='gap-1.5'>
				<Plus className='h-4 w-4' />
				添加
			</Button>
		</form>
	)
}
