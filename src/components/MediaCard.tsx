'use client';
import React, { useEffect, useRef, useState } from 'react';

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

// How long a hover has to hold before the trailer preview kicks in -
// long enough that someone just scrolling their cursor across the row
// doesn't trigger a wall of video requests, short enough to still feel
// responsive for an intentional hover.
const HOVER_DELAY_MS = 1200;

// Module-level cache so re-hovering the same card (or seeing it again
// in another row) doesn't re-fetch. null is a valid cached value -
// "checked, this title has no trailer" - not "not yet checked".
const trailerCache = new Map<string, string | null>();

export const MediaCard = React.memo(function MediaCard({ item, priority, variant = 'row' }: MediaCardProps) {
  const href =
    item.type === 'movie' ? movieDetailHref(item.id) : tvDetailHref(item.id);

  const releaseDateStr = item.type === 'movie' ? item.release_date : item.first_air_date;

  // Guards against missing/empty release dates (e.g. favorites saved
  // via a path that didn't pass this data along) producing a raw NaN
  // in the UI - shows nothing for the year instead of "NaN".
  const rawYear = releaseDateStr ? new Date(releaseDateStr).getFullYear() : NaN;
  const year = Number.isFinite(rawYear) ? rawYear : null;

  const hasRating = typeof item.vote_average === 'number' && item.vote_average > 0;

  // A title is "upcoming" purely based on its own release date being
  // in the future - independent of isRecentRelease, which only looks
  // backward. The two badges are mutually exclusive by construction:
  // isNew is forced off while isUpcoming is true, so the moment a
  // release date passes, "Coming Soon" simply stops being true and
  // "New" picks up automatically on the very next render (no separate
  // transition logic needed - it falls out of the two date checks).
  const releaseTime = releaseDateStr ? new Date(releaseDateStr).getTime() : NaN;
  const isUpcoming = Number.isFinite(releaseTime) && releaseTime > Date.now();
  const isNew = !isUpcoming && isRecentRelease(releaseDateStr);

  // Falls back to a placeholder if the poster fails to load for any
  // reason - a stale/expired TMDB path, a CDN hiccup, or the image
  // optimizer timing out - rather than leaving a blank/broken box with
  // no retry, which is what a bare <Image> does on error.
  const [imgSrc, setImgSrc] = useState(() => tmdbImage(item.poster_path, 'w342'));
  const [failed, setFailed] = useState(false);

  // --- Hover trailer preview ---
  const cacheKey = `${item.type}-${item.id}`;
  const [trailerKey, setTrailerKey] = useState<string | null>(() => trailerCache.get(cacheKey) ?? null);
  const [showTrailer, setShowTrailer] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handleMouseEnter = () => {
    // Lite Mode devices are on weak hardware - an autoplaying video
    // per hovered card is exactly the kind of thing it exists to skip.
    if (typeof document !== 'undefined' && document.documentElement.dataset.lite === 'true') {
      return;
    }
    // Nothing to preview yet - don't even start the timer.
    if (isUpcoming) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(async () => {
      const cached = trailerCache.get(cacheKey);
      if (cached !== undefined) {
        if (cached) setShowTrailer(true);
        return;
      }
      try {
        const res = await fetch(`/api/trailer?id=${item.id}&type=${item.type}`);
        const data = res.ok ? await res.json() : { key: null };
        trailerCache.set(cacheKey, data.key ?? null);
        setTrailerKey(data.key ?? null);
        if (data.key) setShowTrailer(true);
      } catch {
        trailerCache.set(cacheKey, null);
      }
    }, HOVER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    clearHoverTimer();
    setShowTrailer(false);
  };

  useEffect(() => clearHoverTimer, []);

  return (
    <Link
      href={href}
      onClick={storeReturnPath}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          className={`object-cover transition-all duration-300 group-hover:scale-110 ${
            showTrailer ? 'opacity-0' : 'group-hover:opacity-70'
          } ${isUpcoming ? 'grayscale-[0.3] brightness-75' : ''}`}
        />

        {showTrailer && trailerKey && (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&playsinline=1`}
            title=""
            className="absolute inset-0 h-full w-full scale-125 border-0"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        )}

        <div className="absolute inset-0 bg-card-shine opacity-0 transition-opacity group-hover:opacity-100" />
        <FavoriteButton
          entry={{ id: item.id, type: item.type, title: item.title, poster_path: item.poster_path, vote_average: item.vote_average, release_date: item.type === "movie" ? item.release_date : undefined, first_air_date: item.type === "tv" ? item.first_air_date : undefined }}
          variant="card"
        />

        {/* Coming Soon / New are mutually exclusive - a title can only
            ever be one or the other, driven purely by whether its
            release date has passed yet, so this just falls out of the
            two boolean checks above with no extra state to manage. */}
        {isUpcoming ? (
          <span className="absolute top-2 right-2 z-10 rounded-full border border-white/25 bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            Coming Soon
          </span>
        ) : (
          isNew && (
            <span className="absolute top-2 right-2 z-10 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0A1F2B] shadow-glow">
              New
            </span>
          )
        )}

        {hasRating && !showTrailer && !isUpcoming && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-accent backdrop-blur-sm">
            {item.vote_average.toFixed(1)}
          </span>
        )}

        {/* Play affordance - hidden for unreleased titles (nothing to
            play yet) and once the trailer preview takes over. */}
        {!showTrailer && !isUpcoming && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-accent/90 shadow-glow backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A1F2B" className="translate-x-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        <div
          className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3 transition-opacity duration-300 ${
            showTrailer ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {item.title}
          </p>
          <p className="mt-1 truncate text-xs text-ink-3">
            {isUpcoming && releaseDateStr
              ? `Releases ${new Date(releaseDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
              : (
                <>
                  {year}
                  {year && hasRating && <span className="mx-1.5 text-ink-4">·</span>}
                  {hasRating && <span className="text-accent">★ {item.vote_average.toFixed(1)}</span>}
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
                </>
              )}
          </p>
        </div>

        {showTrailer && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5Z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
            Muted preview
          </div>
        )}
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
