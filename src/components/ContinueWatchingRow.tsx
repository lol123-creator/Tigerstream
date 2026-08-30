'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ScrollRow } from '@/components/ScrollRow';
import { buildContinueWatching, removeContinueWatchingItem } from '@/lib/progress-client';
import { tmdbImage } from '@/lib/tmdb-images';
import type { ContinueWatchingItem } from '@/types/media';

/** Parses "S1 · E4"-style subtitles back into numbers for the new-episode check. */
function parseSeasonEpisode(subtitle: string | undefined): { season: number; episode: number } | null {
  if (!subtitle) return null;
  const match = subtitle.match(/S(\d+).*E(\d+)/i);
  if (!match) return null;
  return { season: Number(match[1]), episode: Number(match[2]) };
}

export function ContinueWatchingRow() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [newEpisodeIds, setNewEpisodeIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setItems(buildContinueWatching());
    const onStorage = (e: StorageEvent) => {
      // Storage key is now profile-scoped when signed in ("peachifyProgress:<id>"),
      // so match on the base key rather than an exact string.
      if (e.key == null || e.key.startsWith('peachifyProgress')) {
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

  // Checks TV shows in the list against their actual latest episode.
  // Bounded to what's already on-screen (buildContinueWatching caps at
  // 12), so this is a small, one-shot batch call, not per-card fetches.
  useEffect(() => {
    const tvChecks = items
      .filter((i) => i.type === 'tv')
      .map((i) => {
        const se = parseSeasonEpisode(i.subtitle);
        return se ? { id: i.id, season: se.season, episode: se.episode } : null;
      })
      .filter((x): x is { id: number; season: number; episode: number } => x != null);

    if (tvChecks.length === 0) return;

    let cancelled = false;
    fetch('/api/new-episodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shows: tvChecks }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.results) return;
        const ids = new Set<number>(
          data.results.filter((r: { hasNew: boolean }) => r.hasNew).map((r: { id: number }) => r.id),
        );
        setNewEpisodeIds(ids);
      })
      .catch(() => {
        // Silently skip - this is a nice-to-have badge, not core content
      });

    return () => {
      cancelled = true;
    };
    // items.length as a proxy dep so this doesn't re-run on every progress tick, only when the set of titles actually changes
  }, [items.length]);

  const handleRemove = (item: ContinueWatchingItem) => {
    removeContinueWatchingItem(item.type, item.id);
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
              {item.type === 'tv' && newEpisodeIds.has(item.id) && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0A1F2B] shadow-glow">
                  New Episode
                </span>
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent p-3">
                <p className="font-medium text-white">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-ink-2">{item.subtitle}</p>
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
