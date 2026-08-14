'use client';
import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { tmdbImage } from '@/lib/tmdb-images';
import type { MediaItem } from '@/types/media';
import { storeReturnPath } from '@/components/BackButton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';
import { isRecentRelease } from '@/lib/date-utils';

interface MediaCardProps {
  item: MediaItem;
  priority?: boolean;
  variant?: 'row' | 'grid';
}


export const MediaCard = React.memo(function MediaCard({ item, priority, variant = 'row' }: MediaCardProps) {
  const href =
    item.type === 'movie' ? movieDetailHref(item.id) : tvDetailHref(item.id);

  // Guards against missing/empty release dates (e.g. favorites saved
  // via a path that didn't pass this data along) producing a raw NaN
  // in the UI - shows nothing for the year instead of "NaN".
  const rawYear = item.type === 'movie'
    ? new Date(item.release_date).getFullYear()
    : new Date(item.first_air_date).getFullYear();
  const year = Number.isFinite(rawYear) ? rawYear : null;

  const hasRating = typeof item.vote_average === 'number' && item.vote_average > 0;
  const isNew = isRecentRelease(item.type === 'movie' ? item.release_date : item.first_air_date);

  // Falls back to a placeholder if the poster fails to load for any
  // reason - a stale/expired TMDB path, a CDN hiccup, or the image
  // optimizer timing out - rather than leaving a blank/broken box with
  // no retry, which is what a bare <Image> does on error.
  const [imgSrc, setImgSrc] = useState(() => tmdbImage(item.poster_path, 'w342'));
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={href}
      onClick={storeReturnPath}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className={`group relative block overflow-hidden rounded-2xl border border-glass-border bg-white/[0.05] p-1.5 backdrop-blur-md transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:-translate-y-1.5 hover:scale-[1.04] hover:shadow-glow-lg hover:border-accent/30 hover:bg-white/[0.08] ${
        variant === 'row'
          ? 'shrink-0 snap-start'
          : 'w-full'
      }`}
      style={
        variant === 'row'
          ? { width: 'clamp(140px, 18vw, 200px)' }
          : undefined
      }
    >
      {/* Subtle top highlight - the "glass reflection" edge that reads
          as a frosted pane rather than a flat panel */}
      <div className="pointer-events-none absolute inset-x-1.5 top-1.5 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
        <Image
          src={imgSrc}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 35vw, (max-width: 1024px) 18vw, 200px"
          priority={priority}
          onError={() => {
            if (!failed) {
              setFailed(true);
              setImgSrc(`https://placehold.co/500x750/1a1a20/666?text=No+Image`);
            }
          }}
          className="object-cover transition-all duration-300 group-hover:scale-110 group-hover:opacity-70"
        />
        <div className="absolute inset-0 bg-card-shine opacity-0 transition-opacity group-hover:opacity-100" />
        <FavoriteButton
          entry={{ id: item.id, type: item.type, title: item.title, poster_path: item.poster_path, vote_average: item.vote_average, release_date: item.type === "movie" ? item.release_date : undefined, first_air_date: item.type === "tv" ? item.first_air_date : undefined }}
          variant="card"
        />
        {isNew && (
          <span className="absolute top-2 right-2 z-10 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0A1F2B] shadow-glow">
            New
          </span>
        )}
        {hasRating && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-accent backdrop-blur-sm">
            {item.vote_average.toFixed(1)}
          </span>
        )}

        {/* Play affordance - center-stage on hover */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-accent/90 shadow-glow backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A1F2B" className="translate-x-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Hover overlay - title + one compact metadata line (year,
            rating, language, top genre) instead of stacking each as its
            own separate line, which read as cluttered. */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {item.title}
          </p>
          <p className="mt-1 truncate text-xs text-ink-3">
            {year}
            {year && hasRating && <span className="mx-1.5 text-ink-4">·</span>}
            {hasRating && (
              <span className="text-accent">★ {item.vote_average.toFixed(1)}</span>
            )}
            {item.original_language && (
              <>
                <span className="mx-1.5 text-ink-4">·</span>
                {item.original_language.toUpperCase()}
              </>
            )}
            {item.genres && item.genres.length > 0 && (
              <>
                <span className="mx-1.5 text-ink-4">·</span>
                {item.genres[0]}
              </>
            )}
          </p>
        </div>
      </div>
      <p className="mt-2 truncate px-1 text-sm font-medium text-ink-1 group-hover:text-white transition-colors duration-200">
        {item.title}
      </p>
      <p className="truncate px-1 text-xs text-ink-3">
        {item.type === 'movie' ? 'Movie' : 'TV'}{year ? ` · ${year}` : ''}
      </p>
    </Link>
  );
});
