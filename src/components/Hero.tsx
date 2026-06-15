'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

export interface HeroSlide {
  item: MediaItem;
  badge: string;
}

interface HeroProps {
  slides: HeroSlide[];
}

const AUTO_MS = 6000;

export function Hero({ slides }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
  }, []);

  /* Auto-rotate */
  useEffect(() => {
    if (hovered || slides.length <= 1) return;
    timerRef.current = setTimeout(next, AUTO_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, hovered, next, slides.length]);

  /* Keyboard arrows */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (slides.length === 0) return null;

  const item = slides[current].item;
  const badge = slides[current].badge;
  const watchHref =
    item.type === 'movie' ? watchMovieHref(item.id) : watchTvHref(item.id, 1, 1);
  const detailHref =
    item.type === 'movie' ? movieDetailHref(item.id) : tvDetailHref(item.id);

  return (
    <section
      className="group/hero relative min-h-[70vh] w-full overflow-hidden md:min-h-[85vh]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background slides (crossfade) */}
      {slides.map((s, i) => (
        <div
          key={s.item.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={tmdbImage(s.item.backdrop_path, 'original')}
            alt=""
            fill
            priority={i === 0}
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent" />
        </div>
      ))}

      {/* Content (fade between slides) */}
      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 md:pb-24">
<<<<<<< feat/ui-modernization
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
=======
        <div
          key={item.id}
          className="animate-fade-in"
          style={{ animation: 'fadeSlide 0.6s ease-out' }}
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
            {badge}
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
            {item.title}
          </h1>
          {'tagline' in item && item.tagline && (
            <p className="mt-2 text-lg text-white/70 italic">{item.tagline}</p>
          )}
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            {item.overview?.slice(0, 200)}{item.overview && item.overview.length > 200 ? '...' : ''}
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
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover"
            >
              <PlayIcon />
              Watch Now
            </Link>
            <Link
              href={detailHref}
              onClick={storeReturnPath}
              className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              More Info
            </Link>
          </div>
>>>>>>> feat/drag-to-scroll
        </div>
      </div>

      {/* Left arrow */}
      {slides.length > 1 && (
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition opacity-0 hover:opacity-100 group-hover/hero:opacity-100 md:left-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {slides.length > 1 && (
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition opacity-0 hover:opacity-100 group-hover/hero:opacity-100 md:right-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-8">
          {slides.map((s, i) => (
            <button
              key={s.item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-accent' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
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
