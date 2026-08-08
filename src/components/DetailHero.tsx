"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { tmdbImage } from "@/lib/tmdb-images";
import type { MediaItem } from "@/types/media";
import { watchMovieHref, watchTvHref } from "@/lib/routes";
import { TrailerModal } from "@/components/TrailerModal";
import { BackButton } from "@/components/BackButton";

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
    <section
      // min-height instead of a fixed height: a fixed h-[…] + overflow-
      // hidden was clipping the title/poster whenever the content
      // needed more room than that fixed height allowed (a two-line
      // title, a short viewport, etc). min-height guarantees a floor
      // but lets the section grow to fit its content instead of
      // cutting it off.
      className="relative min-h-[52vh] overflow-hidden bg-surface-card pt-16 sm:min-h-[60vh] md:min-h-[70vh]"
    >
      <Image
        src={backdropSrc}
        alt=""
        fill
        className="object-cover object-top"
        style={{
          filter: 'saturate(1.35) contrast(1.12) brightness(1.03)',
          // Fades the bottom ~22% to transparent so the image blends
          // into the section instead of ending in a hard rectangular
          // edge - the surface-card tone behind it is close enough to
          // the page gradient's dark end that this reads as a real
          // blend rather than a visible seam.
          maskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
        }}
        priority
        sizes="100vw"
        onError={() => setBackdropSrc(PLACEHOLDER)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface/60 via-transparent to-transparent" />
      {/* Extra scrim right under the nav so the Back button and top of
          the title stay legible against busy backdrop art. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Back button now overlays the hero directly (full-bleed image
          starting at the true top of the page, matching how the
          homepage Hero behaves) instead of sitting in its own block
          above the hero, which was the dark empty band between the
          nav and the image. */}
      <div className="relative px-4 pt-4 sm:px-6">
        <BackButton />
      </div>

      <div className="relative mx-auto flex min-h-[calc(52vh-4rem)] max-w-7xl flex-wrap items-end gap-6 px-4 pb-12 pt-10 sm:min-h-[calc(60vh-4rem)] sm:px-6 md:min-h-[calc(70vh-4rem)] md:gap-10">
        <div className="relative hidden h-64 w-44 shrink-0 overflow-hidden rounded-lg bg-white/[0.04] backdrop-blur-sm shadow-2xl sm:block md:h-80 md:w-52">
          <Image
            src={posterSrc}
            alt={item.title}
            fill
            className="object-cover"
            sizes="208px"
            onError={() => setPosterSrc(PLACEHOLDER_POSTER)}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-end">
          <h1 className="font-display text-3xl font-bold text-white md:text-5xl">
            {item.title}
          </h1>
          {"tagline" in item && item.tagline && (
            <p className="mt-1 text-ink-2 italic">{item.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-3">
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
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2 md:text-base">
            {item.overview}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isDisabled ? (
              <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent/50 px-8 py-3 font-semibold text-[#0A1F2B]/70 cursor-not-allowed">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {playLabel}
              </div>
            ) : (
              <Link
                href={finalHref}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-8 py-3 font-semibold text-[#0A1F2B] transition hover:bg-accent-hover"
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
