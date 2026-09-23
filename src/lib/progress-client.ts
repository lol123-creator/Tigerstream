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

/**
 * Shows every title with saved progress - the same inclusion rule
 * buildWatchHistory uses - sorted most-recently-watched first. This
 * used to also hide anything under 2% or over 98% complete and sort
 * by completion percent instead, which meant a title could show on
 * the /history page but be invisible here - the two lists now agree
 * exactly, and the only way something leaves this row is the X button
 * (removeContinueWatchingItem), not an automatic percent-based filter.
 */
export function buildContinueWatching(
  store?: PeachifyProgressStore,
): ContinueWatchingItem[] {
  const progress = store ?? loadProgressStore();
  const items: (ContinueWatchingItem & { lastWatchedAt: number })[] = [];

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
        lastWatchedAt,
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
        subtitle: `S${season} · E${episode}`,
        lastWatchedAt,
      });
    }
  }

  return items
    .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
    .slice(0, 12)
    .map(({ lastWatchedAt, ...item }) => item);
}

export interface WatchHistoryItem extends ContinueWatchingItem {
  detailHref: string;
  lastWatchedAt: number;
  completed: boolean;
}

/**
 * Full watch history - same inclusion rule as buildContinueWatching
 * (anything with recorded progress), but with no 12-item cap and no
 * "completed" exclusion, sorted most-recently-watched first. Used by
 * the dedicated /history page.
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
 *  - a bare id can't tell a movie and a same-id TV show apart. */
export function removeContinueWatchingItem(type: 'movie' | 'tv', id: string | number): void {
  removeProgressItem(type, id);
}

export { getMediaProgress, loadProgressStore as loadPeachifyProgress };
