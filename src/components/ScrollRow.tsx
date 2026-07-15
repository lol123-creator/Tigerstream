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

  // Drag updates are batched into requestAnimationFrame instead of
  // writing scrollLeft synchronously on every mousemove. mousemove can
  // fire far faster than the display refresh rate, and each direct
  // scrollLeft write forces an immediate layout/paint - batching to one
  // write per animation frame is what actually makes the drag feel
  // smooth instead of janky.
  const rafId = useRef<number | null>(null);
  const pendingX = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = Math.max(el.clientWidth * 0.9, 280);
    el.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  const applyPendingScroll = useCallback(() => {
    rafId.current = null;
    const el = scrollerRef.current;
    if (!el || pendingX.current == null) return;
    const walk = (pendingX.current - dragStartX.current) * 1.5;
    el.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
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
    // Hint the browser this element's scroll position is about to change
    // repeatedly, and disable pointer events on its contents so dragging
    // across dozens of cards doesn't trigger a hover transition/box-shadow
    // recalculation on every single one along the way. Listeners are
    // attached to window (below) rather than this element, so removing
    // its own pointer events doesn't break drag tracking.
    el.style.willChange = 'scroll-position';
    el.style.pointerEvents = 'none';

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
  };

  const onWindowMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    if (!didDrag.current) {
      if (Math.abs(e.pageX - dragStartPageX.current) > DRAG_THRESHOLD) {
        didDrag.current = true;
        el.style.outline = '2px solid rgba(255,255,255,0.05)';
        el.style.outlineOffset = '-2px';
      }
    }
    pendingX.current = e.pageX - el.offsetLeft;
    if (rafId.current == null) {
      rafId.current = requestAnimationFrame(applyPendingScroll);
    }
  };

  const onWindowMouseUp = () => {
    stopDrag();
    window.removeEventListener('mousemove', onWindowMouseMove);
    window.removeEventListener('mouseup', onWindowMouseUp);
  };

  const stopDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    pendingX.current = null;
    const el = scrollerRef.current;
    if (el) {
      el.style.scrollBehavior = '';
      el.style.cursor = '';
      el.style.userSelect = '';
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.willChange = '';
      el.style.pointerEvents = '';
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
          <button type="button" onClick={() => scroll('left')} disabled={!canScrollLeft} aria-label={`Scroll ${title} left`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-white/80 backdrop-blur transition-all duration-200 enabled:hover:border-accent/40 enabled:hover:bg-accent/15 enabled:hover:text-accent enabled:hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-20"><ChevronLeft /></button>
          <button type="button" onClick={() => scroll('right')} disabled={!canScrollRight} aria-label={`Scroll ${title} right`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-white/80 backdrop-blur transition-all duration-200 enabled:hover:border-accent/40 enabled:hover:bg-accent/15 enabled:hover:text-accent enabled:hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-20"><ChevronRight /></button>
        </div>
      </div>

      <div className="group/row relative">
        {canScrollLeft && (
          <button type="button" onClick={() => scroll('left')} aria-label={`Scroll ${title} left`} className="absolute left-0 top-0 z-10 hidden h-full w-12 items-center justify-center bg-gradient-to-r from-surface via-surface/80 to-transparent opacity-0 transition hover:opacity-100 group-hover/row:opacity-100 md:flex lg:w-14">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-accent/80"><ChevronLeft /></span>
          </button>
        )}
        {canScrollRight && (
          <button type="button" onClick={() => scroll('right')} aria-label={`Scroll ${title} right`} className="absolute right-0 top-0 z-10 hidden h-full w-12 items-center justify-center bg-gradient-to-l from-surface via-surface/80 to-transparent opacity-0 transition hover:opacity-100 group-hover/row:opacity-100 md:flex lg:w-14">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-accent/80"><ChevronRight /></span>
          </button>
        )}

        <div ref={scrollerRef} onMouseDown={onMouseDown} onDragStart={(e) => e.preventDefault()} draggable={false} className="scrollbar-hide flex cursor-grab gap-3 overflow-x-auto px-4 pb-2 pt-5 -mt-5 active:cursor-grabbing sm:gap-4 sm:px-6">
          {children}
        </div>
      </div>
    </section>
  );
}
