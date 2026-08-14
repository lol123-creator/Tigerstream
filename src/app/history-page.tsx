'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { tmdbImage } from '@/lib/tmdb-images';
import {
  buildWatchHistory,
  removeContinueWatchingItem,
  type WatchHistoryItem,
} from '@/lib/progress-client';

function formatWhen(ts: number): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(ts).toLocaleDateString();
}

export default function HistoryPage() {
  const [items, setItems] = useState<WatchHistoryItem[] | null>(null);

  useEffect(() => {
    setItems(buildWatchHistory());
  }, []);

  const handleRemove = (id: number, type: 'movie' | 'tv') => {
    removeContinueWatchingItem(id);
    setItems((prev) => prev?.filter((i) => !(i.id === id && i.type === type)) ?? null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">Watch History</h1>
      <p className="mb-8 text-sm text-ink-3">
        {items === null
          ? 'Loading...'
          : items.length > 0
            ? `${items.length} title${items.length !== 1 ? 's' : ''} watched`
            : 'Nothing watched yet.'}
      </p>

      {items && items.length === 0 && (
        <div className="relative flex min-h-[35vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-glass-border bg-surface-card/40 px-6 text-center">
          <div className="pointer-events-none absolute inset-0 bg-ambient-glow opacity-60" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          </div>
          <p className="relative mt-4 max-w-xs text-sm text-ink-3">
            Anything you start watching will show up here.
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
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-glass-border bg-white/[0.03] p-2.5 backdrop-blur-sm transition hover:bg-white/[0.06]"
            >
              <Link
                href={item.detailHref}
                className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-card"
              >
                <Image
                  src={tmdbImage(item.poster_path, 'w185')}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={item.detailHref} className="truncate text-sm font-medium text-white hover:text-accent">
                  {item.title}
                </Link>
                <p className="mt-0.5 text-xs text-ink-3">
                  {item.type === 'movie' ? 'Movie' : 'TV'}
                  {item.subtitle && ` · ${item.subtitle}`}
                  {' · '}
                  {formatWhen(item.lastWatchedAt)}
                </p>
                <div className="mt-2 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${item.completed ? 'bg-accent' : 'bg-accent/70'}`}
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {!item.completed && (
                  <Link
                    href={item.href}
                    className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-[#0A1F2B] transition hover:bg-accent-hover"
                  >
                    Resume
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id, item.type)}
                  aria-label="Remove from history"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-4 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
