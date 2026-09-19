'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MediaType } from '@/types/media';
import { getSignedInUserId } from './cloud-sync';
import { scopedStorageKey } from './profiles';

export type ListType = 'favorites' | 'watchlater';

const BASE_KEYS: Record<ListType, string> = {
  favorites: 'tigerstream:favorites',
  watchlater: 'tigerstream:watchlater',
};

function storageKey(listType: ListType): string {
  return scopedStorageKey(BASE_KEYS[listType], !!getSignedInUserId());
}

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

// In-memory cache per list, keyed alongside the storage key it was
// loaded from so switching profiles mid-session busts it correctly.
// Without this, every single FavoriteButton/WatchLaterButton on the
// page (there can be hundreds on the homepage) independently calls
// localStorage.getItem + JSON.parse on mount - hundreds of redundant
// synchronous reads of the exact same data, firing right after
// hydration. Cached here and kept in sync on every write.
const caches: Record<ListType, { key: string; data: Record<string, FavoriteEntry> } | null> = {
  favorites: null,
  watchlater: null,
};

function loadList(listType: ListType): Record<string, FavoriteEntry> {
  if (typeof window === 'undefined') return {};
  const storeKey = storageKey(listType);
  const cached = caches[listType];
  if (cached && cached.key === storeKey) return cached.data;
  try {
    const raw = localStorage.getItem(storeKey);
    caches[listType] = { key: storeKey, data: raw ? JSON.parse(raw) : {} };
  } catch {
    caches[listType] = { key: storeKey, data: {} };
  }
  return caches[listType]!.data;
}

function saveList(listType: ListType, data: Record<string, FavoriteEntry>) {
  if (typeof window === 'undefined') return;
  const storeKey = storageKey(listType);
  caches[listType] = { key: storeKey, data };
  try {
    localStorage.setItem(storeKey, JSON.stringify(data));
  } catch {
    // Storage full or unavailable - the in-memory cache still reflects
    // the change for this session even if it can't persist.
  }
  // Fire-and-forget: only actually does anything (and only imports
  // Supabase) if someone is signed in. Guest browsing never touches
  // this at all.
  import('@/lib/cloud-sync').then((m) => m.pushListSnapshot(listType)).catch(() => {});
}

function entryKey(type: MediaType, id: number) {
  return `${type}-${id}`;
}

// ---- Generic list API (used internally by both lists below) ----

function isInList(listType: ListType, type: MediaType, id: number): boolean {
  return !!loadList(listType)[entryKey(type, id)];
}

function getList(listType: ListType): FavoriteEntry[] {
  return Object.values(loadList(listType)).sort((a, b) => b.addedAt - a.addedAt);
}

function toggleInList(listType: ListType, entry: Omit<FavoriteEntry, 'addedAt'>): boolean {
  const data = loadList(listType);
  const k = entryKey(entry.type, entry.id);
  if (data[k]) {
    delete data[k];
    saveList(listType, data);
    return false;
  }
  data[k] = { ...entry, addedAt: Date.now() };
  saveList(listType, data);
  return true;
}

function removeFromList(listType: ListType, type: MediaType, id: number) {
  const data = loadList(listType);
  delete data[entryKey(type, id)];
  saveList(listType, data);
}

// ---- Favorites (unchanged public API - existing call sites untouched) ----

export function isFavorited(type: MediaType, id: number): boolean {
  return isInList('favorites', type, id);
}

export function getFavorites(): FavoriteEntry[] {
  return getList('favorites');
}

export function useFavorites(type: MediaType, id: number) {
  const k = entryKey(type, id);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isInList('favorites', type, id));
  }, [k, type, id]);

  const toggle = useCallback(() => {
    setFav(toggleInList('favorites', { id, type, title: '', poster_path: '' }));
  }, [id, type]);

  return { isFavorited: fav, toggle };
}

export function toggleFavorite(entry: Omit<FavoriteEntry, 'addedAt'>): boolean {
  return toggleInList('favorites', entry);
}

export function removeFavorite(type: MediaType, id: number) {
  removeFromList('favorites', type, id);
}

// ---- Watch Later (new, parallel API) ----

export function isInWatchLater(type: MediaType, id: number): boolean {
  return isInList('watchlater', type, id);
}

export function getWatchLater(): FavoriteEntry[] {
  return getList('watchlater');
}

export function useWatchLater(type: MediaType, id: number) {
  const k = entryKey(type, id);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInList('watchlater', type, id));
  }, [k, type, id]);

  const toggle = useCallback(() => {
    setSaved(toggleInList('watchlater', { id, type, title: '', poster_path: '' }));
  }, [id, type]);

  return { isInWatchLater: saved, toggle };
}

export function toggleWatchLater(entry: Omit<FavoriteEntry, 'addedAt'>): boolean {
  return toggleInList('watchlater', entry);
}

export function removeFromWatchLater(type: MediaType, id: number) {
  removeFromList('watchlater', type, id);
}
