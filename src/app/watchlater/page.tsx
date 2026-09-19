'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { tmdbImage } from '@/lib/tmdb-images';
import { getWatchLater, removeFromWatchLater, type FavoriteEntry } from '@/lib/favorites-client';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';

export default function WatchLaterPage() {
  const [items, setItems] = useState<FavoriteEntry[] | null>(null);

  useEffect(() => {
    setItems(getWatchLater());
  }, []);

  const handleRemove = (entry: FavoriteEntry) => {
    removeFromWatchLater(entry.type, entry.id);
    setItems((prev) => prev?.filter((i) => !(i.id === entry.id && i.type === entry.type)) ?? null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">Watch Later</h1>
      <p className="mb-8 text-sm text-ink-3">
        {items === null
          ? 'Loading...'
          : items.length > 0
            ? `${items.length} title${items.length !== 1 ? 's' : ''} saved`
            : 'Nothing saved yet.'}
      </p>

      {items && items.length === 0 && (
        <div className="relative flex min-h-[35vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-glass-border bg-surface-card/40 px-6 text-center">
          <div className="pointer-events-none absolute inset-0 bg-ambient-glow opacity-60" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
            </svg>
          </div>
          <p className="relative mt-4 max-w-xs text-sm text-ink-3">
            Save titles here to build up a queue for later, separate from your Favorites.
          </p>
          <Link
            href="/"
            className="relative mt-5 rounded-2xl bg-accent px-5 py-2.5 text-sm font-medium text-[#0A1F2B] transition hover:bg-accent-hover hover:shadow-glow"
          >
            Browse titles
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {items.map((entry) => {
            const href = entry.type === 'movie' ? movieDetailHref(entry.id) : tvDetailHref(entry.id);
            return (
              <div key={`${entry.type}-${entry.id}`} className="group relative">
                <Link href={href} className="block overflow-hidden rounded-xl">
                  <div className="relative aspect-[2/3] w-full bg-surface-card">
                    <Image
                      src={tmdbImage(entry.poster_path, 'w342')}
                      alt={entry.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="(max-width: 640px) 45vw, 200px"
                    />
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(entry)}
                  aria-label="Remove from Watch Later"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white/70 opacity-0 backdrop-blur transition-all duration-200 group-hover:opacity-100 hover:bg-red-600 hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
                <p className="mt-2 truncate text-sm font-medium text-white">{entry.title}</p>
                <p className="text-xs text-ink-3">{entry.type === 'movie' ? 'Movie' : 'TV'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
