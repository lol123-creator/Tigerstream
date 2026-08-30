'use client';

/**
 * Local-first cloud sync for favorites and watch progress, scoped per
 * profile once someone is signed in. Guest browsing is untouched -
 * still a single local bucket, nothing pushed anywhere.
 *
 * AUTH_FLAG_KEY is a lightweight, synchronously-readable marker (set
 * by AuthButton's auth-state listener) so the hot paths below can
 * cheaply check "is anyone signed in?" without importing/initializing
 * a Supabase client on every single favorite toggle or progress tick.
 */

import { scopedStorageKey } from './profiles';

const AUTH_FLAG_KEY = 'tigerstream:auth-uid';
const FAVORITES_BASE_KEY = 'tigerstream:favorites';
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

function favoritesKey(): string {
  return scopedStorageKey(FAVORITES_BASE_KEY, !!getSignedInUserId());
}
function progressKey(): string {
  return scopedStorageKey(PROGRESS_BASE_KEY, !!getSignedInUserId());
}

/**
 * Collapses rows to one-per-conflict-key before an upsert. Postgres
 * rejects an `INSERT ... ON CONFLICT DO UPDATE` batch outright (the
 * whole batch, not just the extra row) if two rows in it target the
 * same unique constraint - which could happen here for a moment
 * during the legacy bare-id -> composite-key migration, when both an
 * old and new local entry briefly point at the same title. Keeping
 * only the most-recently-updated row per key avoids that failure
 * mode entirely rather than hoping it never collides.
 */
function dedupeByConflictKey<T extends { profile_id: string; media_type: string; media_id: number | string }>(
  rows: T[],
  updatedAtField: 'added_at' | 'updated_at',
): T[] {
  const byKey = new Map<string, T>();
  for (const row of rows) {
    const key = `${row.profile_id}:${row.media_type}:${row.media_id}`;
    const existing = byKey.get(key);
    if (!existing || (row as any)[updatedAtField] >= (existing as any)[updatedAtField]) {
      byKey.set(key, row);
    }
  }
  return [...byKey.values()];
}

/** Push the active profile's full local favorites snapshot to Supabase. Best-effort, never throws. */
export async function pushFavoritesSnapshot(): Promise<void> {
  const uid = getSignedInUserId();
  if (!uid) return;
  try {
    const { getActiveProfileId } = await import('./profiles');
    const profileId = getActiveProfileId();
    if (!profileId) return;

    const raw = localStorage.getItem(favoritesKey());
    const data = raw ? JSON.parse(raw) : {};
    const rows = dedupeByConflictKey(
      Object.values(data as Record<string, any>).map((f: any) => ({
        user_id: uid,
        profile_id: profileId,
        media_id: f.id,
        media_type: f.type,
        title: f.title,
        poster_path: f.poster_path,
        vote_average: f.vote_average ?? null,
        release_date: f.release_date ?? null,
        first_air_date: f.first_air_date ?? null,
        added_at: new Date(f.addedAt).toISOString(),
      })),
      'added_at',
    );
    if (rows.length === 0) return;

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.from('favorites').upsert(rows, { onConflict: 'profile_id,media_type,media_id' });
  } catch {
    // Best-effort - local storage remains the source of truth for this session either way
  }
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
    const rows = dedupeByConflictKey(
      Object.values(data as Record<string, any>)
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
        })),
      'updated_at',
    );
    if (rows.length === 0) return;

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.from('watch_progress').upsert(rows, { onConflict: 'profile_id,media_type,media_id' });
  } catch {
    // Best-effort
  }
}

/**
 * Runs once right after a sign-in is detected (including an
 * "already signed in" page load - see AuthButton). Makes sure the
 * account has at least one profile (auto-creating a default "Me" the
 * very first time it's seen), then merges that profile's cloud
 * favorites/progress with whatever's sitting in this browser's local
 * storage - union, most-recent wins on an actual conflict - so a
 * Guest's existing data isn't lost on sign-up, and progress made on
 * other devices shows up here.
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

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const [{ data: cloudFavorites }, { data: cloudProgress }] = await Promise.all([
      supabase.from('favorites').select('*').eq('profile_id', profileId),
      supabase.from('watch_progress').select('*').eq('profile_id', profileId),
    ]);

    // --- Favorites merge ---
    const favKey = favoritesKey();
    const localFavRaw = localStorage.getItem(favKey);
    const localFav: Record<string, any> = localFavRaw ? JSON.parse(localFavRaw) : {};

    for (const row of cloudFavorites ?? []) {
      const key = `${row.media_type}-${row.media_id}`;
      const existing = localFav[key];
      const cloudAddedAt = new Date(row.added_at).getTime();
      if (!existing || cloudAddedAt > existing.addedAt) {
        localFav[key] = {
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
    localStorage.setItem(favKey, JSON.stringify(localFav));

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
    await Promise.all([pushFavoritesSnapshot(), pushProgressSnapshot()]);
  } catch {
    // Best-effort - if this fails, the account still works, it just
    // stays on whatever was already local until the next successful sync
  }
}
