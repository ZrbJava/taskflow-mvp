'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteLabelAction } from '@/app/actions/labels'
import { Button } from '@/components/ui/button'

export function DeleteLabelButton({ labelId }: { labelId: string }) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	const onDelete = () => {
		if (!confirm('删除该标签？任务会保留，仅移除标签关联。')) return
		startTransition(async () => {
			const res = await deleteLabelAction(labelId)
			if (!res.ok) {
				toast.error(res.error ?? '删除失败')
				return
			}
			toast.success('已删除标签')
			router.refresh()
		})
	}

	return (
		<Button
			type='button'
			variant='ghost'
			className='h-8 shrink-0 px-2 text-zinc-500 hover:text-red-600'
			disabled={pending}
			onClick={onDelete}
			aria-label='删除标签'
		>
			<Trash2 className='h-4 w-4' />
		</Button>
	)
}
