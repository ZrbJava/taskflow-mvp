import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
	const passwordHash = await bcrypt.hash('demo1234', 10)
	const user = await prisma.user.upsert({
		where: { email: 'demo@example.com' },
		update: { passwordHash },
		create: {
			email: 'demo@example.com',
			name: '演示用户',
			passwordHash,
		},
	})

	let project = await prisma.project.findFirst({
		where: { userId: user.id, name: '示例项目' },
	})
	if (!project) {
		project = await prisma.project.create({
			data: { name: '示例项目', userId: user.id },
		})
	}

	const existing = await prisma.task.count({ where: { userId: user.id } })
	if (existing === 0) {
		await prisma.task.createMany({
			data: [
				{
					title: '欢迎：登录后管理任务',
					description: '演示账号 demo@example.com / demo1234',
					status: 'todo',
					userId: user.id,
					projectId: project.id,
				},
				{
					title: '练习 Server Actions',
					description: '尝试创建、编辑和删除任务',
					status: 'doing',
					userId: user.id,
					projectId: project.id,
				},
			],
		})
	}
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
