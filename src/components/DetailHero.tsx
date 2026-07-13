"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { tmdbImage } from "@/lib/tmdb-images";
import type { MediaItem } from "@/types/media";
import { watchMovieHref, watchTvHref } from "@/lib/routes";
import { TrailerModal } from "@/components/TrailerModal";

interface DetailHeroProps {
  item: MediaItem;
  playLabel?: string;
  playHref?: string;
  disablePlay?: boolean;
}

const PLACEHOLDER = "https://placehold.co/1280x720/1a1a20/666?text=No+Image";
const PLACEHOLDER_POSTER = "https://placehold.co/500x750/1a1a20/666?text=No+Image";

export function DetailHero({
  item,
  playLabel = "Play",
  playHref,
  disablePlay = false,
}: DetailHeroProps) {
  const defaultPlay =
    item.type === "movie"
      ? watchMovieHref(item.id)
      : watchTvHref(item.id, 1, item.seasons[0]?.episodes[0]?.episode ?? 1);

  const finalHref = playHref ?? defaultPlay;
  const isDisabled = disablePlay || !finalHref;
  const trailerKey = "trailer_key" in item ? item.trailer_key : undefined;
  const [showTrailer, setShowTrailer] = useState(false);

  // Both images fall back to a placeholder on load failure - a stale
  // TMDB path, CDN hiccup, or missing artwork - instead of leaving a
  // broken icon with no background behind it.
  const [backdropSrc, setBackdropSrc] = useState(() =>
    tmdbImage(item.backdrop_path, "original"),
  );
  const [posterSrc, setPosterSrc] = useState(() =>
    tmdbImage(item.poster_path, "w500"),
  );

  return (
    <section className="relative h-[42vh] min-h-[320px] overflow-hidden bg-surface-card sm:h-[52vh] md:h-[62vh]">
      <Image
        src={backdropSrc}
        alt=""
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
        onError={() => setBackdropSrc(PLACEHOLDER)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface/60 via-transparent to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl items-end gap-6 px-4 pb-12 pt-28 sm:px-6 md:gap-10">
        <div className="relative hidden h-64 w-44 shrink-0 overflow-hidden rounded-lg bg-surface-card shadow-2xl sm:block md:h-80 md:w-52">
          <Image
            src={posterSrc}
            alt={item.title}
            fill
            className="object-cover"
            sizes="208px"
            onError={() => setPosterSrc(PLACEHOLDER_POSTER)}
          />
        </div>
        <div className="flex flex-col justify-end">
          <h1 className="font-display text-3xl font-bold text-white md:text-5xl">
            {item.title}
          </h1>
          {"tagline" in item && item.tagline && (
            <p className="mt-1 text-white/60 italic">{item.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/55">
            <span className="text-accent font-medium">
              ★ {item.vote_average.toFixed(1)}
            </span>
            {item.genres.map((g) => (
              <span key={g}>{g}</span>
            ))}
            {item.type === "movie" ? (
              <span>{item.runtime} min</span>
            ) : (
              <span>
                {item.seasons.length} season
                {item.seasons.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
            {item.overview}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isDisabled ? (
              <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent/50 px-8 py-3 font-semibold text-white/50 cursor-not-allowed">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {playLabel}
              </div>
            ) : (
              <Link
                href={finalHref}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-8 py-3 font-semibold text-white transition hover:bg-accent-hover"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {playLabel}
              </Link>
            )}
            {trailerKey && (
              <button
                onClick={() => setShowTrailer(true)}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect x="2" y="6" width="14" height="12" rx="2" />
                </svg>
                Watch Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {showTrailer && (
        <TrailerModal trailerKey={trailerKey!} onClose={() => setShowTrailer(false)} />
      )}
    </section>
  );
}
