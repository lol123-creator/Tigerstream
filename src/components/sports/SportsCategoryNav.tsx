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

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-accent text-[#0A1F2B] shadow-glow'
        : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-accent/30 hover:bg-accent/10 hover:text-white'
    }`;

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll categories left"
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-surface/90 text-white/80 shadow-lg backdrop-blur-md transition hover:border-accent/40 hover:text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll categories right"
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-surface/90 text-white/80 shadow-lg backdrop-blur-md transition hover:border-accent/40 hover:text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth px-10 py-1"
      >
        <Link href={sportsHref()} className={chipClass(activeId == null)}>
          All Sports
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={sportsCategoryHref(c.id)} className={chipClass(activeId === c.id)}>
            {c.category}
            <span className={`ml-1.5 text-xs ${activeId === c.id ? 'text-[#0A1F2B]/60' : 'text-white/35'}`}>
              ({c.streams.length})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
