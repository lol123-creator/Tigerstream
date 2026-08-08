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


  /* Preload adjacent slides after initial paint */
  useEffect(() => {
    if (slides.length <= 2) return;
    const nextIndex = (current + 1) % slides.length;
    const prevIndex = (current - 1 + slides.length) % slides.length;
    const preload = (idx: number) => {
      if (idx === current) return;
      const img = new window.Image();
      img.src = tmdbImage(slides[idx].item.backdrop_path, 'w1280');
    };
    const t = setTimeout(() => {
      preload(nextIndex);
      preload(prevIndex);
    }, 800);
    return () => clearTimeout(t);
  }, [current, slides]);

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
      {/* Soft ambient glow - the signature touch for this direction,
          restraint over a bold motif */}
      <div className="pointer-events-none absolute inset-0 bg-ambient-glow" />

      {/* Background slides (crossfade + gentle drift). Each slide's
          mask-image fades the bottom ~18% to transparent - since this
          section has no opaque background of its own, that reveals the
          real page gradient underneath directly, which is what makes
          the transition to the content below actually feel like a
          blend instead of a hard-edged rectangle sitting on top of the
          gradient. */}
      {slides.map((s, i) => (
        <div
          key={s.item.id}
          className="absolute inset-0 overflow-hidden transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            maskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
          }}
        >
          <div
            className="absolute inset-0"
            style={i === current ? { animation: 'kenburns 12s ease-out forwards' } : undefined}
          >
            <Image
              src={tmdbImage(s.item.backdrop_path, 'w1280')}
              alt=""
              fill
              priority={i === 0}
              className="object-cover object-top"
              style={{ filter: 'saturate(1.35) contrast(1.12) brightness(1.03)' }}
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#242124] via-[#242124]/70 to-transparent" />
        </div>
      ))}

      {/* Content - staggered entrance */}
      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 md:pb-24">
        <div key={item.id}>
          <p
            className="mb-2 inline-block rounded-full bg-accent/15 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-accent backdrop-blur-sm"
            style={{ animation: 'heroRise 0.5s ease-out both' }}
          >
            {badge}
          </p>
          <h1
            className="font-display max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight text-white md:text-6xl"
            style={{ animation: 'heroRise 0.55s ease-out 0.08s both' }}
          >
            {item.title}
          </h1>
          {'tagline' in item && item.tagline && (
            <p
              className="mt-3 text-lg text-ink-2 italic"
              style={{ animation: 'heroRise 0.5s ease-out 0.16s both' }}
            >
              {item.tagline}
            </p>
          )}
          <p
            className="mt-4 max-w-xl text-sm leading-relaxed text-ink-2 md:text-base"
            style={{ animation: 'heroRise 0.5s ease-out 0.22s both' }}
          >
            {item.overview?.slice(0, 200)}{item.overview && item.overview.length > 200 ? '...' : ''}
          </p>
          {item.genres.length > 0 && (
            <div
              className="mt-4 flex flex-wrap gap-2"
              style={{ animation: 'heroRise 0.5s ease-out 0.28s both' }}
            >
              {item.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-glass-border bg-white/5 px-3 py-0.5 text-xs text-ink-2"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{ animation: 'heroRise 0.5s ease-out 0.34s both' }}
          >
            <Link
              href={watchHref}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-medium text-[#0A1F2B] shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-glow-lg hover:scale-[1.02] active:scale-95"
            >
              <PlayIcon />
              Watch Now
            </Link>
            <Link
              href={detailHref}
              onClick={storeReturnPath}
              className="inline-flex items-center rounded-2xl border border-glass-border bg-white/[0.06] px-6 py-3 text-sm font-medium text-ink-1 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.12] hover:text-white hover:scale-[1.02] active:scale-95"
            >
              More Info
            </Link>
          </div>

        </div>
      </div>

      {/* Left arrow */}
      {slides.length > 1 && (
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-md transition opacity-0 hover:opacity-100 group-hover/hero:opacity-100 md:left-6"
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
          className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-md transition opacity-0 hover:opacity-100 group-hover/hero:opacity-100 md:right-6"
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
                i === current ? 'w-8 bg-accent' : 'w-2 bg-white/30 hover:bg-white/50'
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
