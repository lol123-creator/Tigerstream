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
      release_date: '',
      runtime: 0,
      vote_average: 0,
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
    first_air_date: '',
    vote_average: 0,
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
        <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
          <p className="text-white/40">
            Tap the ❤ on any movie or show to save it here.
          </p>
          <Link
            href="/"
            className="mt-4 text-sm text-accent underline-offset-2 hover:underline"
          >
            Browse titles
          </Link>
        </div>
      )}
    </div>
  );
}