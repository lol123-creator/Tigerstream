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
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DRAG_THRESHOLD = 5;

export function ScrollRow({ title, children, className }: ScrollRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPageX = useRef(0);
  const dragScrollLeft = useRef(0);

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
    el.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select')) return;
    const el = scrollerRef.current;
    if (!el) return;
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragStartPageX.current = e.pageX;
    dragScrollLeft.current = el.scrollLeft;
    el.style.scrollBehavior = 'auto';
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const el = scrollerRef.current;
    if (!el) return;
    if (!didDrag.current) {
      if (Math.abs(e.pageX - dragStartPageX.current) > DRAG_THRESHOLD) {
        didDrag.current = true;
        const overlay = document.createElement('div');
        overlay.setAttribute('data-drag-overlay', '');
        overlay.style.cssText =
          'position:absolute;inset:0;z-index:20;cursor:grabbing;pointer-events:auto;';
        el.style.position = 'relative';
        el.appendChild(overlay);
      }
    }
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    el.scrollLeft = dragScrollLeft.current - walk;
  };

  const stopDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const el = scrollerRef.current;
    if (el) {
      el.style.scrollBehavior = '';
      el.style.cursor = '';
      el.style.userSelect = '';
      const overlay = el.querySelector('[data-drag-overlay]');
      if (overlay) overlay.remove();
    }
    if (didDrag.current) {
      const el = scrollerRef.current;
      const suppress = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      el?.addEventListener('click', suppress, { capture: true, once: true });
    }
  };

  return (
    <section className={className ?? 'mb-10'}>
      <div className="mb-4 flex items-center justify-between gap-4 px-4 sm:px-6">
        <h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => scroll('left')} disabled={!canScrollLeft} aria-label={`Scroll ${title} left`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-raised text-white transition enabled:hover:border-accent/50 enabled:hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft /></button>
          <button type="button" onClick={() => scroll('right')} disabled={!canScrollRight} aria-label={`Scroll ${title} right`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-raised text-white transition enabled:hover:border-accent/50 enabled:hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight /></button>
        </div>
      </div>

      <div className="group/row relative">
        {canScrollLeft && (
          <button type="button" onClick={() => scroll('left')} aria-label={`Scroll ${title} left`} className="absolute left-0 top-0 z-10 hidden h-full w-12 items-center justify-center bg-gradient-to-r from-surface via-surface/80 to-transparent opacity-0 transition hover:opacity-100 group-hover/row:opacity-100 md:flex lg:w-14">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur hover:bg-accent"><ChevronLeft /></span>
          </button>
        )}
        {canScrollRight && (
          <button type="button" onClick={() => scroll('right')} aria-label={`Scroll ${title} right`} className="absolute right-0 top-0 z-10 hidden h-full w-12 items-center justify-center bg-gradient-to-l from-surface via-surface/80 to-transparent opacity-0 transition hover:opacity-100 group-hover/row:opacity-100 md:flex lg:w-14">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur hover:bg-accent"><ChevronRight /></span>
          </button>
        )}

        <div ref={scrollerRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag} className="scrollbar-hide flex cursor-grab gap-3 overflow-x-auto px-4 pb-2 active:cursor-grabbing sm:gap-4 sm:px-6">
          {children}
        </div>
      </div>
    </section>
  );
}
