'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PLAYER_ACCENT } from '@/lib/brand';
import { buildContinueWatching } from '@/lib/progress-client';
import { ensureEntryMetadata, getEntry } from '@/lib/watch-progress';
import { PeachifyPlayer } from '@/components/PeachifyPlayer';
import { CinemaOSPlayer } from '@/components/CinemaOSPlayer';
import { VideasyPlayer } from '@/components/VideasyPlayer';
import type { PeachifyEmbedTarget } from '@/peachify';

type PlayerSource = 'peachify' | 'cinemaos' | 'videasy';

const STORAGE_KEY = 'tigerstream:player';
const SILENCE_TIMEOUT_MS = 12000;
const STUCK_TIMEOUT_MS = 20000;
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
  posterPath?: string;
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

function ReportBrokenButton({
  target,
  title,
  player,
}: {
  target: PeachifyEmbedTarget;
  title: string;
  player: PlayerSource;
}) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      await fetch('/api/report-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: target.mediaId,
          mediaType: target.type,
          season: target.type === 'tv' ? target.season : undefined,
          episode: target.type === 'tv' ? target.episode : undefined,
          player,
          title,
        }),
      });
      setSent(true);
    } catch {
      // best-effort - the button still confirms visually either way
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-ink-3">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Thanks, reported
      </span>
    );
  }

  if (open) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-ink-3">Report {player} as broken for this title?</span>
        <button
          type="button"
          disabled={sending}
          onClick={send}
          className="rounded-full bg-amber-400/90 px-3 py-1 font-semibold text-[#2B1B00] transition hover:bg-amber-300 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Yes, report it'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-4 hover:text-ink-2"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 text-xs text-ink-4 transition hover:text-ink-2"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4M12 17h.01" />
        <circle cx="12" cy="12" r="10" />
      </svg>
      Report broken stream
    </button>
  );
}

export function WatchLayout({
  title,
  backHref,
  target,
  posterPath,
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
    ensureEntryMetadata(target.type, target.mediaId, { title, poster_path: posterPath });
  }, [markAlive, checkStuckPosition, target.type, target.mediaId, title, posterPath]);

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

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
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
          <ReportBrokenButton target={target} title={title} player={playerSource} />
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
              posterPath={posterPath}
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
              posterPath={posterPath}
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
