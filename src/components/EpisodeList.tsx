'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { tmdbImage } from '@/lib/tmdb-images';
import Link from 'next/link';
import { watchTvHref } from '@/lib/routes';
import { SeasonDropdown } from '@/components/SeasonDropdown';
import type { TvShow } from '@/types/media';

const VISIBLE_ITEMS = 5;

interface EpisodeListProps {
  show: TvShow;
  activeSeason?: number;
  activeEpisode?: number;
}

export function EpisodeList({
  show,
  activeSeason = 1,
  activeEpisode = 1,
}: EpisodeListProps) {
  const initialSeason =
    show.seasons.find((season) => season.season_number === activeSeason) ??
    show.seasons[0];
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(
    initialSeason?.season_number ?? activeSeason,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedSeason = useMemo(
    () =>
      show.seasons.find(
        (season) => season.season_number === selectedSeasonNumber,
      ) ?? show.seasons[0],
    [selectedSeasonNumber, show.seasons],
  );

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDropdown();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen, closeDropdown]);

  const selectSeason = (num: number) => {
    setSelectedSeasonNumber(num);
    setDropdownOpen(false);
  };

  if (!selectedSeason) {
    return <p className="text-white/50">No seasons are available yet.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/45">
            Select season
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {selectedSeason.name}
            <span className="ml-2 text-sm font-normal text-white/45">
              {selectedSeason.episode_count} episodes
            </span>
          </p>
        </div>
        <div ref={dropdownRef} className="relative w-full sm:w-48">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm font-medium text-white outline-none transition focus:border-accent"
          >
            <span className="truncate">{selectedSeason.name}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {dropdownOpen && (
            <div
              ref={listRef}
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-y-auto rounded-lg border border-white/10 bg-surface-card shadow-2xl"
              style={{ maxHeight: `${VISIBLE_ITEMS * 40}px` }}
            >
              {show.seasons.map((season) => (
                <button
                  key={season.season_number}
                  type="button"
                  onClick={() => selectSeason(season.season_number)}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-white/8 ${
                    season.season_number === selectedSeasonNumber
                      ? 'bg-accent/15 text-accent font-medium'
                      : 'text-white'
                  }`}
                >
                  {season.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {selectedSeason.episodes.map((ep) => {
          const isActive =
            selectedSeason.season_number === activeSeason &&
            ep.episode === activeEpisode;
          return (
            <li key={`${ep.season}-${ep.episode}`}>
              <Link
                href={watchTvHref(show.id, ep.season, ep.episode)}
                className={`flex gap-4 rounded-lg border p-4 transition ${
                  isActive
                    ? 'border-accent/50 bg-accent/10'
                    : 'border-white/5 bg-surface-card hover:border-white/15 hover:bg-surface-raised'
                }`}
              >
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-white/5">
                  <Image
                    src={tmdbImage(ep.still_path, 'w185')}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isActive ? 'bg-accent text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {ep.episode}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{ep.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-white/50">
                    {ep.overview}
                  </p>
                  <p className="mt-1 text-xs text-white/35">{ep.runtime} min</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}