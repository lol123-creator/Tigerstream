'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MediaType } from '@/types/media';

const STORAGE_KEY = 'tigerstream:favorites';

export interface FavoriteEntry {
  id: number;
  type: MediaType;
  title: string;
  poster_path: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  addedAt: number;
}

// In-memory cache of the favorites map. Without this, every single
// FavoriteButton on the page (there can be hundreds on the homepage)
// independently calls localStorage.getItem + JSON.parse on mount -
// hundreds of redundant synchronous reads of the exact same data,
// firing right after hydration. That was a real, measurable contributor
// to poor INP/FID, especially on mobile. Cached here and kept in sync
// on every write instead.
let cache: Record<string, FavoriteEntry> | null = null;

function loadFavorites(): Record<string, FavoriteEntry> {
  if (typeof window === 'undefined') return {};
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function saveFavorites(data: Record<string, FavoriteEntry>) {
  if (typeof window === 'undefined') return;
  cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable - the in-memory cache still reflects
    // the change for this session even if it can't persist.
  }
  // Fire-and-forget: only actually does anything (and only imports
  // Supabase) if someone is signed in. Guest browsing never touches
  // this at all.
  import('@/lib/cloud-sync').then((m) => m.pushFavoritesSnapshot()).catch(() => {});
}

function key(type: MediaType, id: number) {
  return `${type}-${id}`;
}

export function isFavorited(type: MediaType, id: number): boolean {
  const data = loadFavorites();
  return !!data[key(type, id)];
}

export function getFavorites(): FavoriteEntry[] {
  const data = loadFavorites();
  return Object.values(data).sort((a, b) => b.addedAt - a.addedAt);
}

/** React hook for managing favorites. */
export function useFavorites(type: MediaType, id: number) {
  const k = key(type, id);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const data = loadFavorites();
    setFav(!!data[k]);
  }, [k]);

  const toggle = useCallback(() => {
    const data = loadFavorites();
    if (data[k]) {
      delete data[k];
      setFav(false);
    } else {
      data[k] = { id, type, title: '', poster_path: '', addedAt: Date.now() };
      setFav(true);
    }
    saveFavorites(data);
  }, [k, id, type]);

  return { isFavorited: fav, toggle };
}

export function toggleFavorite(
  entry: Omit<FavoriteEntry, 'addedAt'>,
): boolean {
  const data = loadFavorites();
  const k = key(entry.type, entry.id);
  if (data[k]) {
    delete data[k];
    saveFavorites(data);
    return false;
  } else {
    data[k] = { ...entry, addedAt: Date.now() };
    saveFavorites(data);
    return true;
  }
}

export function removeFavorite(type: MediaType, id: number) {
  const data = loadFavorites();
  delete data[key(type, id)];
  saveFavorites(data);
}
