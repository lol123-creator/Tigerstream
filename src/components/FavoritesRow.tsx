'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ScrollRow } from '@/components/ScrollRow';
import { getFavorites, type FavoriteEntry } from '@/lib/favorites-client';
import { tmdbImage } from '@/lib/tmdb-images';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';

export function FavoritesRow() {
  const [items, setItems] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getFavorites());
    refresh();

    // Re-read when localStorage changes (another tab or component)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tigerstream:favorites' || e.key == null) {
        refresh();
      }
    };
    window.addEventListener('storage', onStorage);

    // Also poll lightly so the row updates immediately after
    // the user clicks a heart on the same page.
    const interval = setInterval(refresh, 1000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <ScrollRow title="My List">
      {items.map((item) => {
        const href =
          item.type === 'movie'
            ? movieDetailHref(item.id)
            : tvDetailHref(item.id);

        return (
          <Link
            key={`${item.type}-${item.id}`}
            href={href}
            className="group relative shrink-0 snap-start overflow-hidden rounded-lg bg-surface-card"
            style={{ width: 'clamp(140px, 18vw, 200px)' }}
          >
            <div className="relative aspect-[2/3] overflow-hidden">
              <Image
                src={tmdbImage(item.poster_path, 'w342')}
                alt={item.title}
                fill
                className="object-cover transition-opacity group-hover:opacity-80"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-card-shine opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-2 truncate px-1 text-sm font-medium text-white/90 group-hover:text-white">
              {item.title}
            </p>
            <p className="truncate px-1 text-xs text-white/45">
              {item.type === 'movie' ? 'Movie' : 'TV'}
            </p>
          </Link>
        );
      })}
    </ScrollRow>
  );
}