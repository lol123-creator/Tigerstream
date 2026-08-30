'use client';

/**
 * Single source of truth for watch-progress storage. Every player
 * (Peachify, CinemaOS, Videasy) reads and writes through this module
 * instead of touching localStorage or Supabase directly - one place
 * decides the storage key, the entry key format, and when a cloud
 * push happens, so the three players can no longer drift into three
 * slightly different (and sometimes buggy) implementations.
 *
 * Entries are keyed as "movie-<id>" / "tv-<id>" rather than a bare id -
 * a movie and a TV show can share the same TMDB id, and a bare-id key
 * let them silently overwrite each other's progress.
 */

import type {
  PeachifyMediaProgressEntry,
  PeachifyMediaType,
  PeachifyProgressStore,
} from '@/peachify/types';
import { getSignedInUserId } from './cloud-sync';
import { scopedStorageKey } from './profiles';

const BASE_KEY = 'peachifyProgress';

function storageKey(): string {
  return scopedStorageKey(BASE_KEY, !!getSignedInUserId());
}

export function entryKey(type: PeachifyMediaType, id: string | number): string {
  return `${type}-${id}`;
}

function isLegacyKey(key: string): boolean {
  return !/^(movie|tv)-/.test(key);
}

/** Reads the active profile's store, transparently upgrading any
 *  legacy bare-id entries (from before this fix) to the composite key. */
export function loadProgressStore(): PeachifyProgressStore {
  if (typeof window === 'undefined') return {};
  const key = storageKey();
  let raw: PeachifyProgressStore = {};
  try {
    const stored = localStorage.getItem(key);
    raw = stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }

  let migrated = false;
  const out: PeachifyProgressStore = {};
  for (const [k, entry] of Object.entries(raw)) {
    if (!entry) continue;
    if (isLegacyKey(k) && entry.type && entry.id != null) {
      const newKey = entryKey(entry.type, entry.id);
      const existing = out[newKey];
      if (!existing || (entry.last_updated ?? 0) >= (existing.last_updated ?? 0)) {
        out[newKey] = entry;
      }
      migrated = true;
    } else {
      out[k] = entry;
    }
  }

  if (migrated) {
    try {
      localStorage.setItem(key, JSON.stringify(out));
    } catch {
      // best-effort - the in-memory `out` is still correct for this read
    }
  }

  return out;
}

function saveProgressStore(store: PeachifyProgressStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(), JSON.stringify(store));
  } catch {
    // storage full/unavailable - nothing else to do
  }
}

export function getEntry(
  type: PeachifyMediaType,
  id: string | number,
): PeachifyMediaProgressEntry | undefined {
  return loadProgressStore()[entryKey(type, id)];
}

export function getCompletionRatio(entry: {
  progress?: { watched?: number; duration?: number };
}): number {
  const { watched = 0, duration = 0 } = entry.progress ?? {};
  if (!duration || duration <= 0) return 0;
  return Math.min(1, Math.max(0, watched / duration));
}

export function getResumeSeconds(
  type: PeachifyMediaType,
  id: string | number,
  season?: number,
  episode?: number,
  /** Skip resume if within this many seconds of the end. Default: 30 */
  endThresholdSeconds = 30,
): number | undefined {
  const entry = getEntry(type, id);
  if (!entry) return undefined;

  let watched: number | undefined;
  let duration: number | undefined;

  if (type === 'tv' && season != null && episode != null && entry.show_progress) {
    const ep = entry.show_progress[`s${season}e${episode}`];
    watched = ep?.progress?.watched;
    duration = ep?.progress?.duration;
  } else {
    watched = entry.progress?.watched;
    duration = entry.progress?.duration;
  }

  if (watched == null || !Number.isFinite(watched) || watched <= 0) return undefined;
  if (duration != null && Number.isFinite(duration) && duration - watched <= endThresholdSeconds) {
    return undefined;
  }
  return Math.floor(watched);
}

export function removeItem(type: PeachifyMediaType, id: string | number): void {
  const store = loadProgressStore();
  delete store[entryKey(type, id)];
  saveProgressStore(store);
}

/**
 * Normalizes and merges a raw MEDIA_DATA payload from ANY of the three
 * embeds into the canonical store, then fires a best-effort cloud
 * push. Re-keys off each entry's own `id`/`type` fields rather than
 * trusting the payload's own object keys, so it doesn't matter how a
 * given embed happens to key its store internally (Peachify and
 * Videasy use the bare id, CinemaOS prefixes it) - this is the one
 * place that decides the real key, for all three.
 */
export function recordFromMediaData(
  raw: Record<string, PeachifyMediaProgressEntry> | PeachifyProgressStore,
): PeachifyProgressStore {
  const store = loadProgressStore();

  for (const entry of Object.values(raw ?? {})) {
    if (!entry || entry.id == null || !entry.type) continue;
    const key = entryKey(entry.type, entry.id);
    const existing = store[key];
    // Guard against an out-of-order/stale message clobbering newer local progress.
    if (!existing || (entry.last_updated ?? 0) >= (existing.last_updated ?? 0)) {
      store[key] = { ...entry, last_updated: entry.last_updated ?? Date.now() };
    }
  }

  saveProgressStore(store);

  import('./cloud-sync')
    .then((m) => m.pushProgressSnapshot())
    .catch(() => {});

  return store;
}
