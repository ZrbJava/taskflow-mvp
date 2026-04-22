'use client'

/**
 * 将评论正文按 `@…` 分段，提及部分高亮（与 `extractMentionQueries` 展示层一致即可）。
 */
export function CommentBody({ text }: { text: string }) {
	const parts = text.split(/(@[^\s]+)/g)
	return (
		<>
			{parts.map((part, i) =>
				part.startsWith('@') ? (
					<span key={i} className='font-medium text-violet-600'>
						{part}
					</span>
				) : (
					<span key={i} className='whitespace-pre-wrap'>
						{part}
					</span>
				),
			)}
		</>
	)
}
