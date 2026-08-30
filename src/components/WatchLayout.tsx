'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PLAYER_ACCENT } from '@/lib/brand';
import { buildContinueWatching } from '@/lib/progress-client';
import { PeachifyPlayer } from '@/components/PeachifyPlayer';
import { CinemaOSPlayer } from '@/components/CinemaOSPlayer';
import { VideasyPlayer } from '@/components/VideasyPlayer';
import type { PeachifyEmbedTarget } from '@/peachify';

type PlayerSource = 'peachify' | 'cinemaos' | 'videasy';

const STORAGE_KEY = 'tigerstream:player';
// How long to wait for ANY signal from a newly-mounted player (a
// MEDIA_DATA payload or a player event - proof the embed is actually
// alive and talking, not just that the iframe tag loaded) before
// offering to switch. A dead/blocked source still loads its iframe
// shell fine; it just never sends anything after that.
const STALL_TIMEOUT_MS = 12000;

const PLAYERS: { id: PlayerSource; label: string }[] = [
  { id: 'peachify', label: 'Peachify' },
  { id: 'cinemaos', label: 'CinemaOS' },
  { id: 'videasy', label: 'Videasy' },
];

function nextPlayer(current: PlayerSource): PlayerSource {
  const i = PLAYERS.findIndex((p) => p.id === current);
  return PLAYERS[(i + 1) % PLAYERS.length].id;
}

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
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-white/5 text-sm text-white/40">
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
  const [stalled, setStalled] = useState(false);
  const stallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPlayerSource(loadPlayerPref());
  }, []);

  // Arms a fresh stall timer every time the player (or the title/
  // episode) changes. Any sign of life - a MEDIA_DATA payload or a
  // player event - clears it via markAlive below.
  useEffect(() => {
    setStalled(false);
    if (stallTimer.current) clearTimeout(stallTimer.current);
    stallTimer.current = setTimeout(() => setStalled(true), STALL_TIMEOUT_MS);
    return () => {
      if (stallTimer.current) clearTimeout(stallTimer.current);
    };
  }, [playerSource, errorKey, target.mediaId, target.type === 'tv' ? target.season : null, target.type === 'tv' ? target.episode : null]);

  const markAlive = useCallback(() => {
    if (stallTimer.current) {
      clearTimeout(stallTimer.current);
      stallTimer.current = null;
    }
    setStalled(false);
  }, []);

  const switchPlayer = (source: PlayerSource) => {
    setPlayerSource(source);
    savePlayerPref(source);
    setProgressSynced(false);
    setErrorKey((prev) => prev + 1);
  };

  const onMediaData = useCallback(() => {
    setProgressSynced(true);
    markAlive();
  }, [markAlive]);

  const continueCount = progressSynced ? buildContinueWatching().length : 0;
  const suggested = nextPlayer(playerSource);
  const suggestedLabel = PLAYERS.find((p) => p.id === suggested)?.label ?? suggested;

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href={backHref}
              className="text-sm text-white/50 transition hover:text-white"
            >
              ← Back
            </Link>
            <h1 className="font-display mt-1 text-xl font-semibold text-white md:text-2xl">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {nextHref && (
              <Link
                href={nextHref}
                className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-accent/30 hover:bg-accent/10 hover:text-white"
              >
                {nextLabel} →
              </Link>
            )}
          </div>
        </div>

        {/* Player switcher - a proper segmented control instead of loose
            pill buttons, so it reads as one grouped choice. */}
        <div className="mb-4 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {PLAYERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchPlayer(id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                playerSource === id
                  ? 'bg-accent text-[#0A1F2B] shadow-glow'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {stalled && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
            <p className="text-sm text-amber-200/90">
              Still nothing after a while? This source might be down for this title.
            </p>
            <button
              type="button"
              onClick={() => switchPlayer(suggested)}
              className="shrink-0 rounded-full bg-amber-400/90 px-4 py-1.5 text-xs font-semibold text-[#2B1B00] transition hover:bg-amber-300"
            >
              Try {suggestedLabel} instead
            </button>
          </div>
        )}

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
                markAlive();
                if (e.event === 'ended' && nextHref) {
                  router.push(nextHref);
                }
              }}
              className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
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
              autoResume
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
              autoResume
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
