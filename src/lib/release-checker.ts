import type { Movie, TvShow } from '@/types/media';

export function isComingSoon(media: Movie | TvShow): boolean {
  let releaseDate: string;

  if (media.type === 'movie') {
    releaseDate = media.release_date;
  } else {
    releaseDate = media.first_air_date;
  }

  if (!releaseDate) return false;

  const release = new Date(releaseDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
