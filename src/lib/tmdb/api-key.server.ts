import 'server-only';

/**
 * TMDB key used only on the server (never sent to the browser).
 * Visitors never configure this — only you set TMDB_API_KEY when deploying.
 *
 * Order: TMDB_API_KEY env (.env.local / Vercel) → site owner fallback below.
 */
const SITE_OWNER_TMDB_KEY = '4597e5385c892d8c89f7c3e0e478a891';

export function resolveTmdbApiKey(): string {
  const fromEnv = process.env.TMDB_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  return SITE_OWNER_TMDB_KEY;
}
