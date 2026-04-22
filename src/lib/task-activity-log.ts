import { prisma } from '@/lib/db'

/** 写入任务活动流（审计时间线）。失败静默，不阻断主流程。 */
export async function logTaskActivity(input: {
	taskId: string
	userId: string
	kind: string
	summary: string
}): Promise<void> {
	try {
		await prisma.taskActivity.create({
			data: {
				taskId: input.taskId,
				userId: input.userId,
				kind: input.kind,
				summary: input.summary.slice(0, 500),
			},
		})
	} catch {
		// 避免日志影响主业务
	}
}
