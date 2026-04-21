import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Suspense } from 'react'
import { AppSidebar } from './app-sidebar'
import { CommandMenu } from './command-menu'
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog'

interface AppShellProps {
	children: React.ReactNode
}

export async function AppShell({ children }: AppShellProps) {
	const session = await auth()

	if (!session?.user?.id) {
		return <div className='flex min-h-screen flex-col'>{children}</div>
	}

	const projects = await prisma.project.findMany({
		where: { userId: session.user.id },
		orderBy: { updatedAt: 'desc' },
		select: { id: true, name: true },
	})

	return (
		<div className='flex min-h-screen'>
			<Suspense
				fallback={
					<aside
						className='sticky top-0 hidden h-screen w-60 shrink-0 border-r border-zinc-200 bg-white md:block'
						aria-hidden
					/>
				}
			>
				<AppSidebar userEmail={session.user.email} projects={projects} />
			</Suspense>
			<main className='min-w-0 flex-1 bg-zinc-50'>{children}</main>
			<CommandMenu projects={projects} />
			<KeyboardShortcutsDialog />
		</div>
	)
}
