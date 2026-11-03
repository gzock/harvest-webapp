/** The legacy API serializes naive timestamps in UTC. Date-only values stay dates. */
export function parseApiDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value + 'T00:00:00+09:00');
  const normalized = value.replace(' ', 'T');
  return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized) ? normalized : normalized + 'Z');
}
export function formatJapanDate(value: string, withTime = false): string {
  if (!value) return '';
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
    ...(withTime ? { hour: '2-digit' as const, minute: '2-digit' as const, hour12: false } : {}),
  }).format(date);
}
