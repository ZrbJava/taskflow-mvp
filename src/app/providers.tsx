'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			{children}
			<Toaster
				position='top-right'
				richColors
				closeButton
				theme='light'
				toastOptions={{
					style: {
						borderRadius: '12px',
					},
				}}
			/>
		</SessionProvider>
	)
}
