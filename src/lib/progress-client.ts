'use client';

import {
  getCompletionRatio,
  getMediaProgress,
  loadPeachifyProgress,
  removeContinueWatchingItem,
} from '@/peachify';
import type { PeachifyProgressStore } from '@/peachify';
import { watchMovieHref, watchTvHref } from '@/lib/routes';
import type { ContinueWatchingItem } from '@/types/media';

export function buildContinueWatching(
  store?: PeachifyProgressStore,
): ContinueWatchingItem[] {
  const progress = store ?? loadPeachifyProgress();
  const items: ContinueWatchingItem[] = [];

  for (const key of Object.keys(progress)) {
    const entry = progress[key];
    if (!entry?.progress) continue;
    if (!entry.title && !entry.poster_path) continue;

    const ratio = getCompletionRatio(entry);
    if (ratio <= 0.02 || ratio >= 0.98) continue;

    if (entry.type === 'movie') {
      items.push({
        id: entry.id,
        type: 'movie',
        title: entry.title || `Movie ${entry.id}`,
        poster_path: entry.poster_path || '',
        progressPercent: Math.round(ratio * 100),
        href: watchMovieHref(entry.id),
      });
      continue;
    }

    if (entry.type === 'tv') {
      const season = Number(entry.last_season_watched ?? 1);
      const episode = Number(entry.last_episode_watched ?? 1);
      const epKey = `s${season}e${episode}`;
      const epProgress = entry.show_progress?.[epKey]?.progress ?? entry.progress;
      const epRatio =
        epProgress.duration > 0
          ? Math.min(1, epProgress.watched / epProgress.duration)
          : ratio;

      if (epRatio <= 0.02 || epRatio >= 0.98) continue;

      items.push({
        id: entry.id,
        type: 'tv',
        title: entry.title || `Show ${entry.id}`,
        poster_path: entry.poster_path || '',
        progressPercent: Math.round(epRatio * 100),
        href: watchTvHref(entry.id, season, episode),
        subtitle: `S${season} · E${episode}`,
      });
    }
  }

  return items.sort((a, b) => b.progressPercent - a.progressPercent).slice(0, 12);
}

export { getMediaProgress, loadPeachifyProgress, removeContinueWatchingItem };
