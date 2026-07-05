'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { PLAYER_ACCENT } from '@/lib/brand';
import { buildContinueWatching } from '@/lib/progress-client';
import { PeachifyPlayer } from '@/components/PeachifyPlayer';
import { CinemaOSPlayer } from '@/components/CinemaOSPlayer';
import { VideasyPlayer } from '@/components/VideasyPlayer';
import type { PeachifyEmbedTarget } from '@/peachify';

type PlayerSource = 'peachify' | 'cinemaos' | 'videasy';

const STORAGE_KEY = 'tigerstream:player';

function loadPlayerPref(): PlayerSource {
  if (typeof window === 'undefined') return 'peachify';
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'cinemaos' || val === 'peachify' || val === 'videasy') return val;
  } catch {}
  return 'peachify';
}

function savePlayerPref(source: PlayerSource) {
  try {
    localStorage.setItem(STORAGE_KEY, source);
  } catch {}
}

interface WatchLayoutProps {
  title: string;
  backHref: string;
  target: PeachifyEmbedTarget;
  nextHref?: string;
  nextLabel?: string;
}

function PlayerSkeleton() {
  return (
    <div className="aspect-video w-full animate-pulse rounded-xl bg-white/5 ring-1 ring-white/10" />
  );
}

class PlayerErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode; key?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode; key?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error('Player error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-white/5 text-sm text-white/40">
            Player failed to load. Try switching to another player.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export function WatchLayout({
  title,
  backHref,
  target,
  nextHref,
  nextLabel = 'Next episode',
}: WatchLayoutProps) {
  const router = useRouter();
  const [progressSynced, setProgressSynced] = useState(false);
  const [playerSource, setPlayerSource] = useState<PlayerSource>('peachify');
  const [errorKey, setErrorKey] = useState(0);

  useEffect(() => {
    setPlayerSource(loadPlayerPref());
  }, []);

  const switchPlayer = (source: PlayerSource) => {
    setPlayerSource(source);
    savePlayerPref(source);
    setProgressSynced(false);
    // Reset error boundary by changing key
    setErrorKey((prev) => prev + 1);
  };

  const onMediaData = useCallback(() => {
    setProgressSynced(true);
  }, []);

  const continueCount = progressSynced ? buildContinueWatching().length : 0;

  const toggleClass = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer select-none ${
      active
        ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
    }`;

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href={backHref}
              className="text-sm text-white/50 transition hover:text-white"
            >
              ← Back
            </Link>
            <h1 className="mt-1 text-xl font-semibold text-white md:text-2xl">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {nextHref && (
              <Link
                href={nextHref}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                {nextLabel} →
              </Link>
            )}
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-white/40">Player:</span>
          <button
            type="button"
            onClick={() => switchPlayer('peachify')}
            className={toggleClass(playerSource === 'peachify')}
          >
            Peachify
          </button>
          <button
            type="button"
            onClick={() => switchPlayer('cinemaos')}
            className={toggleClass(playerSource === 'cinemaos')}
          >
            CinemaOS
          </button>
          <button
            type="button"
            onClick={() => switchPlayer('videasy')}
            className={toggleClass(playerSource === 'videasy')}
          >
            Videasy
          </button>
        </div>

        <PlayerErrorBoundary key={`${playerSource}-${errorKey}`}>
          {playerSource === 'peachify' ? (
            <PeachifyPlayer
              target={{
                ...target,
                options: {
                  accent: PLAYER_ACCENT,
                  sub: 'English',
                  autoNext: target.type === 'tv',
                  showNextBtn: true,
                  ...target.options,
                },
              }}
              autoResume
              onMediaData={onMediaData}
              onPlayerEvent={(e) => {
                if (e.event === 'ended' && nextHref) {
                  router.push(nextHref);
                }
              }}
              className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
            />
          ) : playerSource === 'cinemaos' ? (
            <CinemaOSPlayer
              type={target.type}
              mediaId={target.mediaId}
              season={target.type === 'tv' ? target.season : undefined}
              episode={target.type === 'tv' ? target.episode : undefined}
              title={title}
              autoPlay
              autoNext={target.type === 'tv'}
              onMediaData={onMediaData}
            />
          ) : (
            <VideasyPlayer
              type={target.type}
              mediaId={target.mediaId}
              season={target.type === 'tv' ? target.season : undefined}
              episode={target.type === 'tv' ? target.episode : undefined}
              title={title}
              autoPlay
              onMediaData={onMediaData}
            />
          )}
        </PlayerErrorBoundary>

        {progressSynced && (
          <p className="mt-4 text-center text-xs text-white/30">
            {continueCount > 0
              ? 'Saved to Continue Watching on home'
              : 'Watch progress saved'}
          </p>
        )}
      </div>
    </div>
  );
}
