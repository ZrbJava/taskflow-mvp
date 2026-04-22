/**
 * 从评论正文中提取 @ 提及片段（不含前导 @）。
 * 支持：`@完整邮箱`、`@显示名`（显示名至少 1 个字符，不含空格）。
 */
export function extractMentionQueries(body: string): string[] {
	const out: string[] = []
	const seen = new Set<string>()

	const add = (raw: string, dedupeKey: string) => {
		const t = raw.trim()
		if (t.length < 1) return
		if (seen.has(dedupeKey)) return
		seen.add(dedupeKey)
		out.push(t)
	}

	const emailRe =
		/@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
	let m: RegExpExecArray | null
	while ((m = emailRe.exec(body)) !== null) {
		add(m[1], `e:${m[1].toLowerCase()}`)
	}

	const nameRe = /@([\u4e00-\u9fffa-zA-Z][\u4e00-\u9fffa-zA-Z0-9_.-]{0,80})/g
	while ((m = nameRe.exec(body)) !== null) {
		if (m[1].includes('@')) continue
		add(m[1], `n:${m[1].toLowerCase()}`)
	}

	return out
}
