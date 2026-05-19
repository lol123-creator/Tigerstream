/** Fetch multiple TMDB pages in chunks to reduce rate-limit issues. */
export async function fetchPaged<T>(
  totalPages: number,
  fetchPage: (page: number) => Promise<T[]>,
  chunkSize = 5,
): Promise<T[]> {
  const all: T[] = [];
  for (let start = 1; start <= totalPages; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, totalPages);
    const pageNums = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const batches = await Promise.all(pageNums.map((p) => fetchPage(p)));
    all.push(...batches.flat());
  }
  return all;
}

/** TMDB paginated lists can repeat ids across pages — dedupe for React keys. */
export function dedupeById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}
