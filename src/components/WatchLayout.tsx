'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PLAYER_ACCENT } from '@/lib/brand';
import { buildContinueWatching } from '@/lib/progress-client';
import { getEntry } from '@/lib/watch-progress';
import { PeachifyPlayer } from '@/components/PeachifyPlayer';
import { CinemaOSPlayer } from '@/components/CinemaOSPlayer';
import { VideasyPlayer } from '@/components/VideasyPlayer';
import { PostMessageDebugOverlay } from '@/components/PostMessageDebugOverlay';
import type { PeachifyEmbedTarget } from '@/peachify';

type PlayerSource = 'peachify' | 'cinemaos' | 'videasy';

const STORAGE_KEY = 'tigerstream:player';
// How long to wait for ANY signal from a newly-mounted player before
// offering to switch (total silence case - a dead/blocked source
// still loads its iframe shell fine, it just never sends anything).
const SILENCE_TIMEOUT_MS = 12000;
// How long to wait, once ticks ARE arriving, before deciding the
// reported playhead position is stuck rather than just starting out
// near zero (a source can be chatty - sending regular timeupdate
// events - while still never reporting real progress; that's a
// different failure mode than silence, and needs its own timer since
// the silence one never fires for it).
const STUCK_TIMEOUT_MS = 20000;
// Below this many seconds of movement, successive readings count as
// "the same" rather than genuine (if tiny) forward progress.
const STUCK_EPSILON_SECONDS = 2;

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
  const [stalledReason, setStalledReason] = useState<'silent' | 'stuck'>('silent');
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstSeenWatched = useRef<number | null>(null);

  useEffect(() => {
    setPlayerSource(loadPlayerPref());
  }, []);

  const clearTimers = () => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    if (stuckTimer.current) {
      clearTimeout(stuckTimer.current);
      stuckTimer.current = null;
    }
  };

  // Arms fresh silence + stuck-position timers every time the player
  // (or the title/episode) changes.
  useEffect(() => {
    setStalled(false);
    firstSeenWatched.current = null;
    clearTimers();
    silenceTimer.current = setTimeout(() => {
      setStalledReason('silent');
      setStalled(true);
    }, SILENCE_TIMEOUT_MS);
    return clearTimers;
  }, [playerSource, errorKey, target.mediaId, target.type === 'tv' ? target.season : null, target.type === 'tv' ? target.episode : null]);

  const markAlive = useCallback(() => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    setStalled(false);
  }, []);

  // Called after every progress update lands in storage. Compares the
  // stored playhead position against what it was ~20s ago (per this
  // mount) - if it hasn't moved at all despite ticks actively arriving,
  // that's the "chatty but stuck" failure mode (confirmed: CinemaOS,
  // for at least some titles) rather than the "gone silent" one, which
  // the timer above already covers separately.
  const checkStuckPosition = useCallback(() => {
    const entry = getEntry(target.type, target.mediaId);
    const watched =
      target.type === 'tv' && target.season != null && target.episode != null
        ? entry?.show_progress?.[`s${target.season}e${target.episode}`]?.progress?.watched
        : entry?.progress?.watched;
    if (watched == null) return;

    if (firstSeenWatched.current == null) {
      firstSeenWatched.current = watched;
      if (stuckTimer.current) clearTimeout(stuckTimer.current);
      stuckTimer.current = setTimeout(() => {
        const latest = getEntry(target.type, target.mediaId);
        const latestWatched =
          target.type === 'tv' && target.season != null && target.episode != null
            ? latest?.show_progress?.[`s${target.season}e${target.episode}`]?.progress?.watched
            : latest?.progress?.watched;
        if (
          latestWatched != null &&
          firstSeenWatched.current != null &&
          Math.abs(latestWatched - firstSeenWatched.current) < STUCK_EPSILON_SECONDS
        ) {
          setStalledReason('stuck');
          setStalled(true);
        }
      }, STUCK_TIMEOUT_MS);
    }
  }, [target.type, target.mediaId, target.type === 'tv' ? target.season : null, target.type === 'tv' ? target.episode : null]);

  const switchPlayer = (source: PlayerSource) => {
    setPlayerSource(source);
    savePlayerPref(source);
    setProgressSynced(false);
    setErrorKey((prev) => prev + 1);
  };

  const onMediaData = useCallback(() => {
    setProgressSynced(true);
    markAlive();
    checkStuckPosition();
  }, [markAlive, checkStuckPosition]);

  const continueCount = progressSynced ? buildContinueWatching().length : 0;
  const suggested = nextPlayer(playerSource);
  const suggestedLabel = PLAYERS.find((p) => p.id === suggested)?.label ?? suggested;

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* TEMPORARY diagnostic - only renders with ?debug=1 in the URL.
          Remove this line (and delete PostMessageDebugOverlay.tsx) once
          the CinemaOS/Videasy progress-sync issue is fully closed out. */}
      <PostMessageDebugOverlay />

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
              {stalledReason === 'stuck'
                ? "This player doesn't seem to be tracking your position correctly for this title, so progress won't save."
                : 'Still nothing after a while? This source might be down for this title.'}
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
