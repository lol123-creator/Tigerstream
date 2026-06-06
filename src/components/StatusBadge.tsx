import type { Movie, TvShow } from '@/types/media';
import { getStatusBadge, isComingSoon } from '@/lib/release-checker';

interface StatusBadgeProps {
  media: Movie | TvShow;
}

export function StatusBadge({ media }: StatusBadgeProps) {
  const badge = getStatusBadge(media);
  if (!badge) return null;

  const isCS = isComingSoon(media);

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
        isCS
          ? 'bg-blue-500/20 text-blue-300'
          : 'bg-orange-500/20 text-orange-300'
      }`}
    >
      {badge}
    </span>
  );
}
