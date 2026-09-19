'use client';

import { useEffect, useState } from 'react';
import { isInWatchLater, toggleWatchLater, type FavoriteEntry } from '@/lib/favorites-client';
import { useToast } from '@/components/ToastProvider';

interface WatchLaterButtonProps {
  entry: Omit<FavoriteEntry, 'addedAt'>;
  variant?: 'card' | 'detail';
  className?: string;
}

export function WatchLaterButton({
  entry,
  variant = 'detail',
  className = '',
}: WatchLaterButtonProps) {
  const [active, setActive] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setActive(isInWatchLater(entry.type, entry.id));
  }, [entry.type, entry.id]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowActive = toggleWatchLater(entry);
    setActive(nowActive);
    showToast(
      nowActive ? `Added "${entry.title}" to Watch Later` : `Removed "${entry.title}" from Watch Later`,
      nowActive ? 'success' : 'info',
    );
  };

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={active ? 'Remove from Watch Later' : 'Add to Watch Later'}
        // Sits next to FavoriteButton's top-2 left-2 heart (32px wide,
        // 8px inset) with a small gap, rather than stacking on top of it.
        className={`absolute top-2 left-[44px] z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-black/80 ${className}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={active ? '#7FB8D9' : 'none'}
          stroke={active ? '#7FB8D9' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Remove from Watch Later' : 'Add to Watch Later'}
      className={`inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition ${
        active
          ? 'border-accent/50 bg-accent/15 text-accent'
          : 'border-glass-border bg-white/5 text-ink-1 hover:bg-white/10'
      } ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? '#7FB8D9' : 'none'}
        stroke={active ? '#7FB8D9' : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
      </svg>
      {active ? 'In Watch Later' : 'Watch Later'}
    </button>
  );
}
