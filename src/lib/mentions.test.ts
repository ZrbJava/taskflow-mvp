import { describe, expect, it } from 'vitest'
import { extractMentionQueries } from '@/lib/mentions'

describe('extractMentionQueries', () => {
	it('extracts email and name tokens', () => {
		const q = extractMentionQueries(
			'Hi @foo@bar.com and @张三 please check',
		)
		expect(q).toContain('foo@bar.com')
		expect(q).toContain('张三')
	})

	it('dedupes repeated mentions', () => {
		const q = extractMentionQueries('@a@b.co @a@b.co')
		expect(q.filter(x => x === 'a@b.co').length).toBe(1)
	})
})
