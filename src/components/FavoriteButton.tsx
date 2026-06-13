'use client';

import { useEffect, useState } from 'react';
import { toggleFavorite, type FavoriteEntry } from '@/lib/favorites-client';

interface FavoriteButtonProps {
  /** Data needed to save the favorite. */
  entry: Omit<FavoriteEntry, 'addedAt'>;
  /** Make the button look good in different contexts. */
  variant?: 'card' | 'detail';
  className?: string;
}

export function FavoriteButton({
  entry,
  variant = 'detail',
  className = '',
}: FavoriteButtonProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Check initial state on mount (client only)
    const { isFavorited } = require('@/lib/favorites-client');
    setActive(isFavorited(entry.type, entry.id));
  }, [entry.type, entry.id]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowActive = toggleFavorite(entry);
    setActive(nowActive);
  };

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
        className={`absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur transition hover:bg-black/80 ${className}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={active ? '#f59e0b' : 'none'}
          stroke={active ? '#f59e0b' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      className={`inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition ${
        active
          ? 'border-accent/50 bg-accent/15 text-accent'
          : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
      } ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? '#f59e0b' : 'none'}
        stroke={active ? '#f59e0b' : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {active ? 'Saved' : 'Save'}
    </button>
  );
}