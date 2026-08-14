/** True if the given ISO date string is within the last `days` days (and not in the future). */
export function isRecentRelease(dateStr: string | undefined, days = 14): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const now = Date.now();
  const diffMs = now - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return diffMs >= 0 && diffMs <= days * dayMs;
}
