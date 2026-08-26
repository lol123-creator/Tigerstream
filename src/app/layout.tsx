'use client';

/**
 * Local-first cloud sync for favorites and watch progress.
 *
 * Design: every existing read/write (FavoriteButton, MediaCard,
 * ContinueWatchingRow, the players' progress handlers, etc.) keeps
 * working exactly as before, synchronously, against localStorage -
 * nothing about those call sites changes, no loading states, no
 * rewrite. This module is an *additional* best-effort layer: when
 * someone is signed in, local writes also get pushed to Supabase in
 * the background (fire-and-forget, never blocks or throws into the
 * caller), and right after sign-in, local + cloud data get merged once
 * so a Guest's existing data isn't lost when they create an account.
 *
 * AUTH_FLAG_KEY is a lightweight, synchronously-readable marker (set
 * by AuthButton's auth-state listener) so the hot paths below can
 * cheaply check "is anyone signed in?" without importing/initializing
 * a Supabase client on every single favorite toggle or progress tick.
 */

const AUTH_FLAG_KEY = 'tigerstream:auth-uid';
const FAVORITES_KEY = 'tigerstream:favorites';
const PROGRESS_KEY = 'peachifyProgress';

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

/** Push the current full local favorites snapshot to Supabase. Best-effort, never throws. */
export async function pushFavoritesSnapshot(): Promise<void> {
  const uid = getSignedInUserId();
  if (!uid) return;
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const rows = Object.values(data as Record<string, any>).map((f: any) => ({
      user_id: uid,
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
    await supabase.from('favorites').upsert(rows, { onConflict: 'user_id,media_type,media_id' });
  } catch {
    // Best-effort - local storage remains the source of truth for this session either way
  }
}

/** Push the current full local watch-progress snapshot to Supabase. Best-effort, never throws. */
export async function pushProgressSnapshot(): Promise<void> {
  const uid = getSignedInUserId();
  if (!uid) return;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const rows = Object.values(data as Record<string, any>)
      .filter((e: any) => e?.progress)
      .map((e: any) => ({
        user_id: uid,
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
    await supabase.from('watch_progress').upsert(rows, { onConflict: 'user_id,media_type,media_id' });
  } catch {
    // Best-effort
  }
}

/**
 * Called once right after a sign-in is detected. Pulls whatever's
 * already in Supabase for this account, merges it with whatever's
 * currently sitting in this browser's localStorage (union - nothing
 * gets deleted, most-recent timestamp wins on an actual conflict),
 * writes the merged result back to localStorage, then pushes the
 * merged snapshot back up. This is what carries a Guest's existing
 * favorites/progress into their new account instead of losing them.
 */
export async function mergeCloudDataOnSignIn(uid: string): Promise<void> {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const [{ data: cloudFavorites }, { data: cloudProgress }] = await Promise.all([
      supabase.from('favorites').select('*').eq('user_id', uid),
      supabase.from('watch_progress').select('*').eq('user_id', uid),
    ]);

    // --- Favorites merge ---
    const localFavRaw = localStorage.getItem(FAVORITES_KEY);
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
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(localFav));

    // --- Progress merge ---
    const localProgRaw = localStorage.getItem(PROGRESS_KEY);
    const localProg: Record<string, any> = localProgRaw ? JSON.parse(localProgRaw) : {};

    for (const row of cloudProgress ?? []) {
      const key = `${row.media_type === 'movie' ? 'm' : 't'}${row.media_id}`;
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
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(localProg));

    // Push the merged result back up so both sides agree
    await Promise.all([pushFavoritesSnapshot(), pushProgressSnapshot()]);
  } catch {
    // Best-effort - if this fails, the account still works, it just
    // stays on whatever was already local until the next successful sync
  }
}
