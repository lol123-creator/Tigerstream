/**
 * Thin compatibility layer over the canonical implementation in
 * `@/lib/watch-progress`. New code should import `@/lib/watch-progress`
 * directly - it's the one real source of truth now (profile-scoped
 * storage, composite movie/tv keys so a movie and a show sharing a
 * TMDB id can't collide, and a single merge+push path shared by all
 * three players). This file exists purely so anything still importing
 * from `@/peachify` keeps working unchanged.
 */
import type { PeachifyProgressStore, MediaId } from './types';
import * as WP from '@/lib/watch-progress';

export function loadPeachifyProgress(): PeachifyProgressStore {
  return WP.loadProgressStore();
}

export function savePeachifyProgress(store: PeachifyProgressStore): void {
  WP.recordFromMediaData(store);
}

export function mergePeachifyProgress(
  incoming: PeachifyProgressStore,
): PeachifyProgressStore {
  return WP.recordFromMediaData(incoming);
}

export { getCompletionRatio } from '@/lib/watch-progress';

/** @deprecated a bare-id lookup can't tell a movie and a TV show with
 *  the same id apart. Prefer `WP.getEntry(type, id)` from `@/lib/watch-progress`. */
export function getMediaProgress(
  store: PeachifyProgressStore,
  mediaId: MediaId,
): PeachifyProgressStore[string] | undefined {
  return store[String(mediaId)];
}

/** Removes a title from Continue Watching. Pass `type` when you have it
 *  (every current call site does) - without it, both the movie and tv
 *  composite keys for this id are removed, to stay safe. */
export function removeContinueWatchingItem(
  mediaId: MediaId,
  type?: 'movie' | 'tv',
): void {
  if (type) {
    WP.removeItem(type, mediaId);
    return;
  }
  WP.removeItem('movie', mediaId);
  WP.removeItem('tv', mediaId);
}
