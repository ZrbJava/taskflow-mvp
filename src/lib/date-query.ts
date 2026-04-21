import type { Prisma } from "@prisma/client";

/** 校验 URL 中的 `YYYY-MM-DD`，非法则忽略。 */
export function parseYmdParam(raw: string | undefined): string | undefined {
  const t = raw?.trim();
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(t)) return undefined;
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return undefined;
  }
  return t;
}

/** 若起止颠倒则交换，保证查询区间语义正确。 */
export function normalizeDateRange(
  from?: string,
  to?: string,
): { dateFrom?: string; dateTo?: string } {
  if (!from && !to) return {};
  if (from && to && from > to) {
    return { dateFrom: to, dateTo: from };
  }
  return { dateFrom: from, dateTo: to };
}

/**
 * 按「日历日」边界过滤 `updatedAt`（UTC 日界），与 Linear「按活动时间」筛选相近。
 */
export function updatedAtFilterFromQuery(
  dateFrom?: string,
  dateTo?: string,
): Prisma.DateTimeFilter | undefined {
  const { dateFrom: f, dateTo: t } = normalizeDateRange(dateFrom, dateTo);
  if (!f && !t) return undefined;
  const out: Prisma.DateTimeFilter = {};
  if (f) {
    const [y, m, d] = f.split("-").map(Number);
    out.gte = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  }
  if (t) {
    const [y, m, d] = t.split("-").map(Number);
    out.lte = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
  }
  return out;
}

export function formatUtcYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function utcTodayYmd(): string {
  return formatUtcYmd(new Date());
}

/** 从今天往前数 `days` 个「日历日」（UTC），含今日则传 `days - 1`。 */
export function utcYmdDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return formatUtcYmd(d);
}
