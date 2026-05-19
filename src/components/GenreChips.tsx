'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Genre } from '@/lib/tmdb/genres';

interface GenreChipsProps {
  type: 'movie' | 'tv';
  genres: Genre[];
  activeId?: number;
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GenreChips({ type, genres, activeId }: GenreChipsProps) {
  const base = type === 'movie' ? '/movies/genre' : '/tv/genre';
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateArrows);
      observer.disconnect();
    };
  }, [updateArrows, genres.length, activeId]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || activeId == null) return;
    const active = el.querySelector<HTMLElement>(`[data-genre-id="${activeId}"]`);
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeId]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = Math.max(el.clientWidth * 0.75, 200);
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const chipClass = (active: boolean) =>
    `shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm transition ${
      active
        ? 'border-accent bg-accent/20 text-white'
        : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
    }`;

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll genres left"
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-surface/95 text-white shadow-lg backdrop-blur transition hover:border-accent/50 hover:bg-accent/20"
        >
          <ChevronLeft />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll genres right"
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-surface/95 text-white shadow-lg backdrop-blur transition hover:border-accent/50 hover:bg-accent/20"
        >
          <ChevronRight />
        </button>
      )}

      <div
        ref={scrollerRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth overscroll-x-contain px-10 py-1 snap-x snap-mandatory touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Link
          href={type === 'movie' ? '/movies' : '/tv'}
          data-genre-id="all"
          className={chipClass(activeId == null)}
        >
          All
        </Link>
        {genres.map((g) => (
          <Link
            key={g.id}
            href={`${base}/${g.id}`}
            data-genre-id={g.id}
            className={chipClass(activeId === g.id)}
          >
            {g.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
