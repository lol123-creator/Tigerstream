'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ScrollRow } from '@/components/ScrollRow';
import { buildContinueWatching } from '@/lib/progress-client';
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
    const interval = setInterval(() => setItems(buildContinueWatching()), 5000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <ScrollRow title="Continue Watching">
      {items.map((item) => (
        <Link
          key={`${item.type}-${item.id}`}
          href={item.href}
          className="group relative shrink-0 snap-start overflow-hidden rounded-lg"
          style={{ width: 'clamp(200px, 28vw, 320px)' }}
        >
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
      ))}
    </ScrollRow>
  );
}
