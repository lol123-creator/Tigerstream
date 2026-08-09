'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
}

const LITE_KEY = 'tigerstream:lite-mode';

/**
 * Fades + slides a section in the first time it scrolls into view.
 * One IntersectionObserver per instance (e.g. one per row), not one
 * per card inside it - with up to 20 rows on the homepage that's still
 * a small, cheap number of observers, well within what
 * IntersectionObserver is designed for.
 *
 * Skips the animation (renders fully visible immediately) in two
 * cases: Lite Mode is on, or IntersectionObserver isn't available at
 * all - very old browsers (e.g. game console browsers) may lack or
 * only partially support it. Without this fallback, content could get
 * permanently stuck at opacity:0 if the observer never fires - a
 * correctness bug, not just a performance one.
 */
export function RevealOnScroll({ children, className }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let liteMode = false;
    try {
      liteMode = localStorage.getItem(LITE_KEY) === '1';
    } catch {
      // storage unavailable - treat as not lite mode
    }

    if (liteMode || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect(); // only animate in once
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {children}
    </div>
  );
}
