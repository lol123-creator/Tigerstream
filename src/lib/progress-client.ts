'use client';

import {
  getCompletionRatio,
  loadProgressStore,
  removeItem as removeProgressItem,
} from '@/lib/watch-progress';
import type { PeachifyProgressStore } from '@/peachify';
import { getMediaProgress } from '@/peachify';
import { watchMovieHref, watchTvHref } from '@/lib/routes';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';
import type { ContinueWatchingItem } from '@/types/media';

export function buildContinueWatching(
  store?: PeachifyProgressStore,
): ContinueWatchingItem[] {
  const progress = store ?? loadProgressStore();
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

export interface WatchHistoryItem extends ContinueWatchingItem {
  detailHref: string;
  lastWatchedAt: number;
  completed: boolean;
}

/**
 * Full watch history - unlike buildContinueWatching, this includes
 * everything with any recorded progress at all (including finished
 * titles), sorted most-recently-watched first. Used by the dedicated
 * /history page.
 */
export function buildWatchHistory(store?: PeachifyProgressStore): WatchHistoryItem[] {
  const progress = store ?? loadProgressStore();
  const items: WatchHistoryItem[] = [];

  for (const key of Object.keys(progress)) {
    const entry = progress[key];
    if (!entry?.progress) continue;
    if (!entry.title && !entry.poster_path) continue;

    const ratio = getCompletionRatio(entry);
    const lastWatchedAt = entry.last_updated ?? 0;

    if (entry.type === 'movie') {
      items.push({
        id: entry.id,
        type: 'movie',
        title: entry.title || `Movie ${entry.id}`,
        poster_path: entry.poster_path || '',
        progressPercent: Math.round(ratio * 100),
        href: watchMovieHref(entry.id),
        detailHref: movieDetailHref(entry.id),
        lastWatchedAt,
        completed: ratio >= 0.9,
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

      items.push({
        id: entry.id,
        type: 'tv',
        title: entry.title || `Show ${entry.id}`,
        poster_path: entry.poster_path || '',
        progressPercent: Math.round(epRatio * 100),
        href: watchTvHref(entry.id, season, episode),
        detailHref: tvDetailHref(entry.id),
        subtitle: `S${season} · E${episode}`,
        lastWatchedAt,
        completed: epRatio >= 0.9,
      });
    }
  }

  return items.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
}

/** Removes a title from Continue Watching / history. `type` is required
 *  now - a bare id can't tell a movie and a same-id TV show apart. */
export function removeContinueWatchingItem(type: 'movie' | 'tv', id: string | number): void {
  removeProgressItem(type, id);
}

export { getMediaProgress, loadProgressStore as loadPeachifyProgress };
