'use client';

/**
 * Local-first cloud sync for favorites, watch-later, and watch
 * progress, scoped per profile once someone is signed in. Guest
 * browsing is untouched - still local-only buckets, nothing pushed
 * anywhere.
 *
 * AUTH_FLAG_KEY is a lightweight, synchronously-readable marker (set
 * by AuthButton's auth-state listener) so the hot paths below can
 * cheaply check "is anyone signed in?" without importing/initializing
 * a Supabase client on every single list toggle or progress tick.
 */

import { scopedStorageKey } from './profiles';
import type { ListType } from './favorites-client';

const AUTH_FLAG_KEY = 'tigerstream:auth-uid';
const LIST_BASE_KEYS: Record<ListType, string> = {
  favorites: 'tigerstream:favorites',
  watchlater: 'tigerstream:watchlater',
};
const PROGRESS_BASE_KEY = 'peachifyProgress';

export function getSignedInUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(AUTH_FLAG_KEY);
  } catch {
    return null;
  }
}

export function setSignedInUserId(uid: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (uid) localStorage.setItem(AUTH_FLAG_KEY, uid);
    else localStorage.removeItem(AUTH_FLAG_KEY);
  } catch {
    // storage unavailable - sign-in state just won't persist across reloads
  }
}

function listKey(listType: ListType): string {
  return scopedStorageKey(LIST_BASE_KEYS[listType], !!getSignedInUserId());
}
function progressKey(): string {
  return scopedStorageKey(PROGRESS_BASE_KEY, !!getSignedInUserId());
}

/** Push the active profile's local snapshot of ONE list (favorites or
 *  watchlater) to Supabase - both live in the same `favorites` table,
 *  distinguished by `list_type`. */
export async function pushListSnapshot(listType: ListType): Promise<void> {
  const uid = getSignedInUserId();
  if (!uid) return;
  try {
    const { getActiveProfileId } = await import('./profiles');
    const profileId = getActiveProfileId();
    if (!profileId) return;

    const raw = localStorage.getItem(listKey(listType));
    const data = raw ? JSON.parse(raw) : {};
    const rows = Object.values(data as Record<string, any>).map((f: any) => ({
      user_id: uid,
      profile_id: profileId,
      list_type: listType,
      media_id: f.id,
      media_type: f.type,
      title: f.title,
      poster_path: f.poster_path,
      vote_average: f.vote_average ?? null,
      release_date: f.release_date ?? null,
      first_air_date: f.first_air_date ?? null,
      added_at: new Date(f.addedAt).toISOString(),
    }));
    if (rows.length === 0) return;

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase
      .from('favorites')
      .upsert(rows, { onConflict: 'profile_id,media_type,media_id,list_type' });
  } catch {
    // Best-effort - local storage remains the source of truth for this session either way
  }
}

/** @deprecated kept for existing call sites - equivalent to pushListSnapshot('favorites'). */
export function pushFavoritesSnapshot(): Promise<void> {
  return pushListSnapshot('favorites');
}

export function pushWatchLaterSnapshot(): Promise<void> {
  return pushListSnapshot('watchlater');
}

/** Push the active profile's full local watch-progress snapshot to Supabase. Best-effort, never throws. */
export async function pushProgressSnapshot(): Promise<void> {
  const uid = getSignedInUserId();
  if (!uid) return;
  try {
    const { getActiveProfileId } = await import('./profiles');
    const profileId = getActiveProfileId();
    if (!profileId) return;

    const raw = localStorage.getItem(progressKey());
    const data = raw ? JSON.parse(raw) : {};
    const rows = Object.values(data as Record<string, any>)
      .filter((e: any) => e?.progress)
      .map((e: any) => ({
        user_id: uid,
        profile_id: profileId,
        media_id: e.id,
        media_type: e.type,
        title: e.title ?? '',
        poster_path: e.poster_path ?? null,
        watched_seconds: e.progress?.watched ?? 0,
        duration_seconds: e.progress?.duration ?? 0,
        season: e.last_season_watched ? Number(e.last_season_watched) : null,
        episode: e.last_episode_watched ? Number(e.last_episode_watched) : null,
        updated_at: new Date(e.last_updated ?? Date.now()).toISOString(),
      }));
    if (rows.length === 0) return;

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.from('watch_progress').upsert(rows, { onConflict: 'profile_id,media_type,media_id' });
  } catch {
    // Best-effort
  }
}

/**
 * Merges a SPECIFIC profile's cloud data into this browser's local
 * storage - union with whatever's already there, most-recent wins on
 * an actual conflict - then pushes the merged result back up so both
 * sides agree. Does NOT touch which profile is "active"; the caller
 * (mergeCloudDataOnSignIn, or ProfileGate when someone picks a
 * profile) decides that separately.
 */
export async function mergeCloudDataForProfile(uid: string, profileId: string): Promise<void> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // One query covers both lists - they're the same table, split
    // client-side by row.list_type below.
    const [{ data: cloudLists }, { data: cloudProgress }] = await Promise.all([
      supabase.from('favorites').select('*').eq('profile_id', profileId),
      supabase.from('watch_progress').select('*').eq('profile_id', profileId),
    ]);

    // --- Favorites + Watch Later merge ---
    const listTypes: ListType[] = ['favorites', 'watchlater'];
    for (const listType of listTypes) {
      const storeKey = listKey(listType);
      const localRaw = localStorage.getItem(storeKey);
      const local: Record<string, any> = localRaw ? JSON.parse(localRaw) : {};

      for (const row of (cloudLists ?? []).filter((r: any) => (r.list_type ?? 'favorites') === listType)) {
        const key = `${row.media_type}-${row.media_id}`;
        const existing = local[key];
        const cloudAddedAt = new Date(row.added_at).getTime();
        if (!existing || cloudAddedAt > existing.addedAt) {
          local[key] = {
            id: row.media_id,
            type: row.media_type,
            title: row.title,
            poster_path: row.poster_path,
            vote_average: row.vote_average ?? undefined,
            release_date: row.release_date ?? undefined,
            first_air_date: row.first_air_date ?? undefined,
            addedAt: cloudAddedAt,
          };
        }
      }
      localStorage.setItem(storeKey, JSON.stringify(local));
    }

    // --- Progress merge ---
    const progKey = progressKey();
    const localProgRaw = localStorage.getItem(progKey);
    const localProg: Record<string, any> = localProgRaw ? JSON.parse(localProgRaw) : {};

    for (const row of cloudProgress ?? []) {
      // Composite key - "movie-550" / "tv-550" - so a movie and a TV
      // show sharing a TMDB id never collide.
      const key = `${row.media_type}-${row.media_id}`;
      const existing = localProg[key];
      const cloudUpdatedAt = new Date(row.updated_at).getTime();
      if (!existing || cloudUpdatedAt > (existing.last_updated ?? 0)) {
        localProg[key] = {
          id: row.media_id,
          type: row.media_type,
          title: row.title,
          poster_path: row.poster_path,
          progress: { watched: row.watched_seconds, duration: row.duration_seconds },
          last_season_watched: row.season ?? undefined,
          last_episode_watched: row.episode ?? undefined,
          last_updated: cloudUpdatedAt,
        };
      }
    }
    localStorage.setItem(progKey, JSON.stringify(localProg));

    // Push the merged result back up so both sides agree
    await Promise.all([
      pushListSnapshot('favorites'),
      pushListSnapshot('watchlater'),
      pushProgressSnapshot(),
    ]);
  } catch {
    // Best-effort - if this fails, the profile still works, it just
    // stays on whatever was already local until the next successful sync
  }
}

/**
 * Runs once right after a sign-in is detected (including an
 * "already signed in" page load - see AuthButton). Makes sure the
 * account has at least one profile (auto-creating a default "Me" the
 * very first time it's seen), then merges that profile's cloud data in.
 */
export async function mergeCloudDataOnSignIn(uid: string): Promise<void> {
  try {
    const { fetchProfiles, getActiveProfileId, setActiveProfileId } = await import('./profiles');
    const profiles = await fetchProfiles(uid);
    let profileId = getActiveProfileId();
    if (!profileId || !profiles.some((p) => p.id === profileId)) {
      profileId = profiles[0]?.id ?? null;
      if (profileId) setActiveProfileId(profileId);
    }
    if (!profileId) return;

    await mergeCloudDataForProfile(uid, profileId);
  } catch {
    // Best-effort - if this fails, the account still works, it just
    // stays on whatever was already local until the next successful sync
  }
}
