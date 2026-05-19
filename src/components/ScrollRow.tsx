'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface ScrollRowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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

export function ScrollRow({ title, children, className }: ScrollRowProps) {
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
  }, [updateArrows, children]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = Math.max(el.clientWidth * 0.9, 280);
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <section className={className ?? 'mb-10'}>
      <div className="mb-4 flex items-center justify-between gap-4 px-4 sm:px-6">
        <h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${title} left`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-raised text-white transition enabled:hover:border-accent/50 enabled:hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label={`Scroll ${title} right`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-raised text-white transition enabled:hover:border-accent/50 enabled:hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="group/row relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            className="absolute left-0 top-0 z-10 hidden h-full w-12 items-center justify-center bg-gradient-to-r from-surface via-surface/80 to-transparent opacity-0 transition hover:opacity-100 group-hover/row:opacity-100 md:flex lg:w-14"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur hover:bg-accent">
              <ChevronLeft />
            </span>
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            className="absolute right-0 top-0 z-10 hidden h-full w-12 items-center justify-center bg-gradient-to-l from-surface via-surface/80 to-transparent opacity-0 transition hover:opacity-100 group-hover/row:opacity-100 md:flex lg:w-14"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur hover:bg-accent">
              <ChevronRight />
            </span>
          </button>
        )}

        <div
          ref={scrollerRef}
          className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 snap-x snap-mandatory sm:gap-4 sm:px-6"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
