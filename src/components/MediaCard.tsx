'use client';

import Image from 'next/image';
import Link from 'next/link';
import { tmdbImage } from '@/lib/tmdb-images';
import type { MediaItem } from '@/types/media';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';

interface MediaCardProps {
  item: MediaItem;
  priority?: boolean;
  variant?: 'row' | 'grid';
}

export function MediaCard({ item, priority, variant = 'row' }: MediaCardProps) {
  const href =
    item.type === 'movie' ? movieDetailHref(item.id) : tvDetailHref(item.id);

  return (
    <Link
      href={href}
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
          className="object-cover transition-opacity group-hover:opacity-80" draggable={false}
        />
        <div className="absolute inset-0 bg-card-shine opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-accent">
          {item.vote_average.toFixed(1)}
        </span>
      </div>
      <p className="mt-2 truncate px-1 text-sm font-medium text-white/90 group-hover:text-white">
        {item.title}
      </p>
      <p className="truncate px-1 text-xs text-white/45">
        {item.type === 'movie'
          ? new Date(item.release_date).getFullYear()
          : `TV · ${new Date(item.first_air_date).getFullYear()}`}
      </p>
    </Link>
  );
}
