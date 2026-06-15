'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { tmdbImage } from '@/lib/tmdb-images';
import type { TvShow } from '@/types/media';

interface Props {
  seasons: TvShow['seasons'];
  selectedSeasonNumber: number;
  onChange: (n: number) => void;
}

export function SeasonDropdown({ seasons, selectedSeasonNumber: selNum, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const selected = useMemo(() => seasons.find((s) => s.season_number === selNum) ?? seasons[0], [seasons, selNum]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      if (!listRef.current) return;
      const r = listRef.current.getBoundingClientRect();
      if (r.bottom > window.innerHeight) {
        const s = listRef.current.style;
        s.top = 'auto'; s.bottom = '100%'; s.marginTop = '0'; s.marginBottom = '8px';
      }
    });
  }, [open]);

  const selectAndClose = useCallback((n: number) => { onChange(n); setOpen(false); }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setFocusedIdx((p) => Math.min(p + 1, seasons.length - 1)); break;
      case 'ArrowUp': e.preventDefault(); setFocusedIdx((p) => Math.max(p - 1, 0)); break;
      case 'Enter': case ' ': e.preventDefault(); if (focusedIdx >= 0) selectAndClose(seasons[focusedIdx].season_number); break;
      case 'Home': e.preventDefault(); setFocusedIdx(0); break;
      case 'End': e.preventDefault(); setFocusedIdx(seasons.length - 1); break;
    }
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select season"
        onClick={() => setOpen((v) => !v)}
        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-300 sm:w-72 ${
          open
            ? 'border-accent/50 bg-accent/5 shadow-lg shadow-accent/10'
            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
        }`}
      >
        {/* Season poster thumbnail */}
        <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
          {selected?.poster_path ? (
            <Image
              src={tmdbImage(selected.poster_path, 'w92')}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">
              {selected?.season_number}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Season</div>
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-white">{selected?.name ?? 'Select season'}</span>
            <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/40">
              {selected?.episode_count ?? 0} ep
            </span>
          </div>
        </div>
        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 text-white/30 transition-transform duration-300 ${open ? 'rotate-180 text-accent' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Seasons"
          tabIndex={-1}
          className="animate-season-dropdown absolute left-0 right-0 z-50 mt-2 origin-top overflow-hidden rounded-2xl border border-white/10 bg-[#111116]/95 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-xl sm:w-80"
        >
          {seasons.map((season, idx) => {
            const isSel = season.season_number === selNum;
            const isFoc = idx === focusedIdx;
            return (
              <li key={season.season_number} role="option" aria-selected={isSel}>
                <button
                  type="button"
                  onClick={() => selectAndClose(season.season_number)}
                  onMouseEnter={() => setFocusedIdx(idx)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                    isSel
                      ? 'bg-accent/10 ring-1 ring-accent/20'
                      : isFoc
                        ? 'bg-white/[0.06]'
                        : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Season poster */}
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/[0.06]">
                    {season.poster_path ? (
                      <Image
                        src={tmdbImage(season.poster_path, 'w92')}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/20">
                        {season.season_number}
                      </div>
                    )}
                    {/* Hover overlay */}
                    {!isSel && (
                      <div className="absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium leading-tight ${
                      isSel ? 'text-accent' : 'text-white/90'
                    }`}>{season.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-white/35">
                      <span>{season.episode_count} episode{season.episode_count !== 1 ? 's' : ''}</span>
                      {season.air_date && (
                        <>
                          <span className="text-white/15">·</span>
                          <span>{season.air_date.slice(0, 4)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isSel && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20">
                      <svg className="h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}