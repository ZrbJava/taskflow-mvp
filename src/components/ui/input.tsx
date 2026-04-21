import { forwardRef, type InputHTMLAttributes } from 'react'

export const Input = forwardRef<
	HTMLInputElement,
	InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = '', ...props }, ref) {
	return (
		<input
			ref={ref}
			className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${className}`}
			{...props}
		/>
	)
})
