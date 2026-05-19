import { resolveTmdbApiKey } from './api-key.server';

const TMDB_API = 'https://api.themoviedb.org/3';

export function isTmdbEnabled(): boolean {
  return Boolean(resolveTmdbApiKey());
}

export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
  revalidate = 3600,
): Promise<T> {
  const apiKey = resolveTmdbApiKey();
  const url = new URL(`${TMDB_API}${path}`);
  url.searchParams.set('api_key', apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), { next: { revalidate } });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TMDB ${res.status} ${path}${body ? `: ${body.slice(0, 120)}` : ''}`);
  }

  return res.json() as Promise<T>;
}
