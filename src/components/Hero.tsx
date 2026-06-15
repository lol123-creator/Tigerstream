'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  movieDetailHref,
  tvDetailHref,
  watchMovieHref,
  watchTvHref,
} from '@/lib/routes';
import { tmdbImage } from '@/lib/tmdb-images';
import { storeReturnPath } from '@/components/BackButton';
import type { MediaItem } from '@/types/media';

interface HeroProps {
  item: MediaItem;
  badge?: string;
}

export function Hero({ item, badge = 'Featured' }: HeroProps) {
  const watchHref =
    item.type === 'movie'
      ? watchMovieHref(item.id)
      : watchTvHref(item.id, 1, 1);
  const detailHref =
    item.type === 'movie' ? movieDetailHref(item.id) : tvDetailHref(item.id);

  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden md:min-h-[85vh]">
      <Image
        src={tmdbImage(item.backdrop_path, 'original')}
        alt=""
        fill
        priority
        className="object-cover object-top"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 md:pb-24">
        <p className="mb-2 inline-block rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent backdrop-blur-sm">
          {badge}
        </p>
        <h1 className="font-display max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
          {item.title}
        </h1>
        {'tagline' in item && item.tagline && (
          <p className="mt-2 text-lg text-white/70 italic">{item.tagline}</p>
        )}
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
          {item.overview}
        </p>
        {item.genres.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-xs text-white/70"
              >
                {g}
              </span>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={watchHref}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:shadow-glow-lg active:scale-95"
          >
            <PlayIcon />
            Watch Now
          </Link>
          <Link
            href={detailHref}
            onClick={storeReturnPath}
            className="inline-flex items-center rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.12] hover:text-white active:scale-95"
          >
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}