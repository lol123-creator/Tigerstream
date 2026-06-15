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

function loadFavorites(): Record<string, FavoriteEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFavorites(data: Record<string, FavoriteEntry>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
      // We need title & poster — caller sets them via a wrapper.
      // For the hook, just store what we have.
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
