import type { Movie, TvShow } from '@/types/media';

export function isComingSoon(media: Movie | TvShow): boolean {
  let releaseDate: string;

  if (media.type === 'movie') {
    releaseDate = media.release_date;
  } else {
    releaseDate = media.first_air_date;
  }

  if (!releaseDate) return false;

  // Parse as UTC to avoid timezone mismatches with TMDB dates (YYYY-MM-DD format)
  const [y, m, d] = releaseDate.split('-').map(Number);
  if (!y || !m || !d) return false;
  const release = Date.UTC(y, m - 1, d);

  // Get today's date in UTC (not local timezone).
  // Date.UTC's month param is 0-indexed, and getUTCMonth() already
  // returns a 0-indexed month — do not add 1 here, or "today" ends up
  // calculated a month ahead of the real date.
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  return release > today;
}

export function getStatusBadge(media: Movie | TvShow): string | null {
  if (isComingSoon(media)) {
    return 'Coming Soon';
  }

  const status = media.status || '';

  if (status.includes('In Production') || status.includes('Planned')) {
    return 'In Development';
  }

  if (status.includes('Post Production')) {
    return 'Coming Soon';
  }

  return null;
}
