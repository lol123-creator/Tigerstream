'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ScrollRow } from '@/components/ScrollRow';
import { buildContinueWatching, removeContinueWatchingItem } from '@/lib/progress-client';
import { tmdbImage } from '@/lib/tmdb-images';
import type { ContinueWatchingItem } from '@/types/media';

export function ContinueWatchingRow() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    setItems(buildContinueWatching());
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'peachifyProgress' || e.key == null) {
        setItems(buildContinueWatching());
      }
    };
    window.addEventListener('storage', onStorage);
    const interval = setInterval(() => setItems(buildContinueWatching()), 30000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const handleRemove = (item: ContinueWatchingItem) => {
    removeContinueWatchingItem(item.id);
    setItems((prev) => prev.filter((x) => !(x.id === item.id && x.type === item.type)));
  };

  if (items.length === 0) return null;

  return (
    <ScrollRow title="Continue Watching">
      {items.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="group relative shrink-0 snap-start overflow-hidden rounded-lg"
          style={{ width: 'clamp(200px, 28vw, 320px)' }}
        >
          <Link href={item.href} className="block">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-card">
              <Image
                src={tmdbImage(item.poster_path, 'w500')}
                alt={item.title}
                fill
                className="object-cover opacity-70 transition group-hover:opacity-90"
                sizes="320px"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent p-3">
                <p className="font-medium text-white">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-white/60">{item.subtitle}</p>
                )}
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(item);
            }}
            aria-label="Remove from continue watching"
            className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/70 opacity-0 backdrop-blur transition-all duration-200 group-hover:opacity-100 hover:bg-red-600 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </ScrollRow>
  );
}
