import { cookies } from 'next/headers';

/**
 * Server-side kid-content filtering. Reads a plain (non-httpOnly)
 * cookie set client-side by ProfileGate the moment a kid profile is
 * chosen - has to be readable here because filtering must happen
 * before anything is sent to the browser, not after.
 *
 * Coverage:
 * - /discover-backed endpoints (genre browse, anime, "by genre" pages)
 *   get native TMDB exclusion params (kidDiscoverParams) - the most
 *   reliable filter, enforced by TMDB itself.
 * - Every other list endpoint (popular, top rated, trending, search,
 *   now playing, recommendations) doesn't support that kind of param,
 *   so results are filtered after the fact by genre_ids (filterKidSafe).
 * - Detail pages (getMovieById/getTvShowById) are blocked outright
 *   (return null, same contract as "not found") if their resolved
 *   genre names are unsafe - this also removes the natural path to
 *   reach an unsafe title's watch page, since there's no Play button
 *   on a page that doesn't render.
 *
 * Not covered by this: someone directly typing an unsafe title's
 * /watch/... URL without going through a detail page first. Blocking
 * that too would mean touching the watch route files directly, which
 * wasn't done in this pass - worth closing later if that matters for
 * your setup.
 */

export const KID_MODE_COOKIE = 'tigerstream-kid-mode';

/** TMDB genre ids excluded for kid profiles. Horror (27) exists as the
 *  same id in both the movie and tv genre lists; War (10752) is
 *  movie-only in TMDB's taxonomy. Deliberately conservative and easy
 *  to extend - edit this set to exclude more. */
export const KID_UNSAFE_GENRE_IDS = new Set([27, 10752]);

/** Same exclusions by resolved name - used on detail pages, which
 *  resolve genres to display names rather than raw TMDB ids. */
export const KID_UNSAFE_GENRE_NAMES = new Set(['Horror', 'War']);

export async function isKidModeActive(): Promise<boolean> {
  try {
    const store = await cookies();
    return store.get(KID_MODE_COOKIE)?.value === '1';
  } catch {
    return false;
  }
}

function isGenreIdSafe(genreIds: number[] | undefined): boolean {
  if (!genreIds || genreIds.length === 0) return true; // no data - don't over-block
  return !genreIds.some((id) => KID_UNSAFE_GENRE_IDS.has(id));
}

export function isGenreNameSafe(genres: string[] | undefined): boolean {
  if (!genres || genres.length === 0) return true;
  return !genres.some((g) => KID_UNSAFE_GENRE_NAMES.has(g));
}

/** Filters a list down to kid-safe items when a kid profile is
 *  active; a no-op for every other profile. */
export async function filterKidSafe<T extends { genre_ids?: number[] }>(
  items: T[],
): Promise<T[]> {
  if (!(await isKidModeActive())) return items;
  return items.filter((i) => isGenreIdSafe(i.genre_ids));
}

/** True if a detail-page title should be blocked (returns null /
 *  "not found") for the active profile. */
export async function isDetailBlockedForKid(genres: string[] | undefined): Promise<boolean> {
  if (!(await isKidModeActive())) return false;
  return !isGenreNameSafe(genres);
}

/**
 * Extra TMDB /discover query params to exclude unsafe genres
 * server-side, plus a PG-13 certification ceiling for movies (TMDB
 * doesn't expose the same certification filter on /discover/tv).
 * Spread into the params object; returns {} (no-op) outside kid mode.
 */
export async function kidDiscoverParams(
  kind: 'movie' | 'tv',
): Promise<Record<string, string>> {
  if (!(await isKidModeActive())) return {};
  const withoutGenres = kind === 'movie' ? '27,10752' : '27';
  const params: Record<string, string> = { without_genres: withoutGenres };
  if (kind === 'movie') {
    params.certification_country = 'US';
    params['certification.lte'] = 'PG-13';
  }
  return params;
}
