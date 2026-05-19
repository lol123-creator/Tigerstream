'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sportsCategoryHref, sportsHref } from '@/lib/routes';
import type { PpvCategory } from '@/types/sports';

interface SportsCategoryNavProps {
  categories: PpvCategory[];
  activeId?: number;
}

export function SportsCategoryNav({ categories, activeId }: SportsCategoryNavProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update, categories.length]);

  const scroll = (dir: 'left' | 'right') => {
    scrollerRef.current?.scrollBy({
      left: dir === 'left' ? -220 : 220,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll categories left"
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-surface/95 text-white shadow-lg backdrop-blur"
        >
          ‹
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll categories right"
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-surface/95 text-white shadow-lg backdrop-blur"
        >
          ›
        </button>
      )}
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth px-10 py-1"
      >
        <Link
          href={sportsHref()}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
            activeId == null
              ? 'border-accent bg-accent/20 text-white'
              : 'border-white/15 text-white/70 hover:text-white'
          }`}
        >
          All Sports
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={sportsCategoryHref(c.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
              activeId === c.id
                ? 'border-accent bg-accent/20 text-white'
                : 'border-white/15 text-white/70 hover:text-white'
            }`}
          >
            {c.category}
            <span className="ml-1.5 text-xs text-white/40">({c.streams.length})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
