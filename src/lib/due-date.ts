/** 将表单 `YYYY-MM-DD` 转为存入数据库的 UTC 时间（当日正午，避免日界歧义）。 */
export function dueDateFromYmd(raw: string | undefined): Date | null {
  const t = raw?.trim();
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
}

export function dueDateToYmd(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
