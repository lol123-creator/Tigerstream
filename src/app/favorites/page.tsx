'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MediaGrid } from '@/components/MediaGrid';
import { getFavorites, type FavoriteEntry } from '@/lib/favorites-client';
import type { MediaItem } from '@/types/media';

/** Convert a stored FavoriteEntry into a minimal MediaItem for MediaGrid. */
function toMediaItem(e: FavoriteEntry): MediaItem {
  if (e.type === 'movie') {
    return {
      id: e.id,
      type: 'movie',
      title: e.title,
      overview: '',
      poster_path: e.poster_path,
      backdrop_path: e.poster_path,
      release_date: e.release_date ?? '',
      runtime: 0,
      vote_average: e.vote_average ?? 0,
      genres: [],
    };
  }
  return {
    id: e.id,
    type: 'tv',
    title: e.title,
    overview: '',
    poster_path: e.poster_path,
    backdrop_path: e.poster_path,
    first_air_date: e.first_air_date ?? '',
    vote_average: e.vote_average ?? 0,
    genres: [],
    seasons: [],
  };
}

export default function FavoritesPage() {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setItems(getFavorites().map(toMediaItem));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">My List</h1>
      <p className="mb-8 text-sm text-white/45">
        {items.length > 0
          ? `${items.length} saved title${items.length !== 1 ? 's' : ''}`
          : 'No saved titles yet.'}
      </p>

      {items.length > 0 ? (
        <MediaGrid items={items} />
      ) : (
        <div className="relative flex min-h-[40vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-surface-card/40 px-6 text-center">
          <div className="pointer-events-none absolute inset-0 bg-ambient-glow opacity-60" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p className="relative mt-4 max-w-xs text-sm text-white/50">
            Nothing saved yet. Tap the heart on any movie or show to keep it here.
          </p>
          <Link
            href="/"
            className="relative mt-5 rounded-2xl bg-accent px-5 py-2.5 text-sm font-medium text-[#0A1F2B] transition hover:bg-accent-hover hover:shadow-glow"
          >
            Browse titles
          </Link>
        </div>
      )}
    </div>
  );
}
