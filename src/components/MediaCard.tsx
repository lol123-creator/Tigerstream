'use client';
import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { tmdbImage } from '@/lib/tmdb-images';
import type { MediaItem } from '@/types/media';
import { storeReturnPath } from '@/components/BackButton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';

interface MediaCardProps {
  item: MediaItem;
  priority?: boolean;
  variant?: 'row' | 'grid';
}


export const MediaCard = React.memo(function MediaCard({ item, priority, variant = 'row' }: MediaCardProps) {
  const href =
    item.type === 'movie' ? movieDetailHref(item.id) : tvDetailHref(item.id);

  const year = item.type === 'movie'
    ? new Date(item.release_date).getFullYear()
    : new Date(item.first_air_date).getFullYear();

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
      className={`group relative block overflow-hidden rounded-2xl bg-surface-card transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:-translate-y-1.5 hover:scale-[1.04] hover:shadow-glow-lg hover:ring-1 hover:ring-accent/30 ${
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
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
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
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-accent backdrop-blur-sm">
          {item.vote_average.toFixed(1)}
        </span>

        {/* Play affordance - center-stage on hover */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-accent/90 shadow-glow backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A1F2B" className="translate-x-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Hover overlay with details */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-sm font-medium text-white leading-tight">{item.title}</p>
          <p className="mt-1 text-xs text-white/55">
            {year} · ★ {item.vote_average.toFixed(1)}
          </p>
          {item.original_language && (
            <p className="mt-0.5 text-xs text-white/35">
              {item.original_language.toUpperCase()}
            </p>
          )}
          {item.genres && item.genres.length > 0 && (
            <p className="mt-1 text-xs text-white/45 line-clamp-2 leading-relaxed">
              {item.genres.slice(0, 3).join(", ")}
            </p>
          )}
          {item.overview && (
            <p className="mt-1 text-[11px] text-white/35 line-clamp-3 leading-relaxed">
              {item.overview}
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 truncate px-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-200">
        {item.title}
      </p>
      <p className="truncate px-1 text-xs text-white/40">
        {item.type === 'movie' ? `Movie · ${year}` : `TV · ${year}`}
      </p>
    </Link>
  );
});
