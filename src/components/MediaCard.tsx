'use client';

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

export function MediaCard({ item, priority, variant = 'row' }: MediaCardProps) {
  const href =
    item.type === 'movie' ? movieDetailHref(item.id) : tvDetailHref(item.id);

  const year = item.type === 'movie'
    ? new Date(item.release_date).getFullYear()
    : new Date(item.first_air_date).getFullYear();

  return (
    <Link
      href={href}
      onClick={storeReturnPath}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className={`group relative block overflow-hidden rounded-lg bg-surface-card transition-transform duration-300 hover:z-10 hover:scale-[1.03] ${
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
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={tmdbImage(item.poster_path, 'w342')}
          alt={item.title}
          fill
          sizes="200px"
          priority={priority}
          className="object-cover transition-opacity group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-card-shine opacity-0 transition-opacity group-hover:opacity-100" />
        <FavoriteButton
          entry={{ id: item.id, type: item.type, title: item.title, poster_path: item.poster_path, vote_average: item.vote_average, release_date: item.type === "movie" ? item.release_date : undefined, first_air_date: item.type === "tv" ? item.first_air_date : undefined }}
          variant="card"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-accent">
          {item.vote_average.toFixed(1)}
        </span>

        {/* Hover overlay with details */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-sm font-semibold text-white leading-tight">{item.title}</p>
          <p className="mt-1 text-xs text-white/60">
            {year} · ★ {item.vote_average.toFixed(1)}
          </p>
          {item.original_language && (
            <p className="mt-0.5 text-xs text-white/40">
              {item.original_language.toUpperCase()}
            </p>
          )}
          {item.genres && item.genres.length > 0 && (
            <p className="mt-1 text-xs text-white/50 line-clamp-2 leading-relaxed">
              {item.genres.slice(0, 3).join(", ")}
            </p>
          )}
          {item.overview && (
            <p className="mt-1 text-[11px] text-white/40 line-clamp-3 leading-relaxed">
              {item.overview}
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 truncate px-1 text-sm font-medium text-white/90 group-hover:text-white">
        {item.title}
      </p>
      <p className="truncate px-1 text-xs text-white/45">
        {item.type === 'movie' ? `Movie · ${year}` : `TV · ${year}`}
      </p>
    </Link>
  );
}