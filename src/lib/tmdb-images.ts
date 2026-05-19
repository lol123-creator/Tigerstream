const TMDB_IMAGE = 'https://image.tmdb.org/t/p';

export type ImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original';

export function tmdbImage(
  path: string | undefined | null,
  size: ImageSize = 'w500',
): string {
  if (!path) {
    return `https://placehold.co/${size === 'original' ? 1280 : 500}x${size === 'w185' ? 278 : 750}/1a1a20/666?text=No+Image`;
  }
  return `${TMDB_IMAGE}/${size}${path}`;
}
