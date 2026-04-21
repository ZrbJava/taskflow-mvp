/**
 * 中文相对时间（用于「更新于」等）。
 */
export function formatRelativeUpdatedCn(iso: string): string {
	const date = new Date(iso)
	if (Number.isNaN(date.getTime())) return ''

	const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })
	const deltaMs = date.getTime() - Date.now()

	const divisions: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
		{ unit: 'year', ms: 31536000000 },
		{ unit: 'month', ms: 2628000000 },
		{ unit: 'week', ms: 604800000 },
		{ unit: 'day', ms: 86400000 },
		{ unit: 'hour', ms: 3600000 },
		{ unit: 'minute', ms: 60000 },
		{ unit: 'second', ms: 1000 },
	]

	for (const { unit, ms } of divisions) {
		const v = deltaMs / ms
		if (Math.abs(v) >= 1 || unit === 'second') {
			return rtf.format(Math.round(v), unit)
		}
	}
	return rtf.format(0, 'second')
}

/** SSR/首屏与水合一致：短日期时间。 */
export function formatUpdatedStableShort(iso: string): string {
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return ''
	return d.toLocaleString('zh-CN', {
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}
