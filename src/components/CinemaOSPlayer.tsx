'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { PeachifyProgressStore } from '@/peachify';
import {
  getResumeSeconds,
  loadProgressStore,
  recordFromMediaData,
  recordTimeupdate,
} from '@/lib/watch-progress';

// Per CinemaOS's official integration guide:
//   Movie:   https://cinemaos.tech/player/{tmdb_id}
//   TV Show: https://cinemaos.tech/player/{tmdb_id}/{season}/{episode}
// `startTime` (seconds) is a documented param for resuming playback.
const ORIGIN = 'https://cinemaos.tech';
const BASE = `${ORIGIN}/player`;

// Minimum gap between cloud pushes triggered by timeupdate ticks.
// CinemaOS sends these roughly once a second while playing - local
// storage updates on every tick regardless (cheap), but pushing to
// Supabase that often would be wasteful and pointless. Progress is
// always pushed immediately on pause/ended regardless of this timer.
const PUSH_INTERVAL_MS = 8000;

// Caps how much wall-clock time a single tick can add to our own
// position estimate (see below) - guards against one huge jump if the
// tab was backgrounded/throttled between ticks, which would otherwise
// get counted as watched time.
const MAX_TICK_DELTA_SECONDS = 3;

interface CinemaOSPlayerProps {
  type: 'movie' | 'tv';
  mediaId: string | number;
  season?: number;
  episode?: number;
  title?: string;
  /** Optional - used as fallback metadata when CinemaOS's own ticks
   *  don't include it (see recordTimeupdate). Pass this from the
   *  watch page if you have it, for a nicer Continue Watching card. */
  posterPath?: string;
  autoPlay?: boolean;
  autoNext?: boolean;
  /** Resume from the saved position for this title, if any. Defaults to true. */
  autoResume?: boolean;
  /** Called after a progress update has been merged into storage. */
  onMediaData?: (store: PeachifyProgressStore) => void;
}

export function CinemaOSPlayer({
  type,
  mediaId,
  season,
  episode,
  title,
  posterPath,
  autoPlay = true,
  autoNext = true,
  autoResume = true,
  onMediaData,
}: CinemaOSPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastPushRef = useRef(0);

  // --- Self-tracked position estimate ---
  // CinemaOS's own `currentTime` field has been confirmed (by capturing
  // its raw postMessage traffic) to stay stuck at 0 for at least some
  // titles/streams, despite sending regular timeupdate ticks and an
  // accurate `duration`. Rather than trust that broken field, this
  // tracks real elapsed wall-clock time itself while CinemaOS reports
  // playing:true, seeded from whatever position was already saved (the
  // same value used for the `startTime` resume param below). This
  // can't detect a manual seek inside CinemaOS's own scrub bar (it
  // doesn't tell us when that happens) - it just keeps counting
  // forward from wherever it last was - but for normal continuous
  // playback it tracks correctly, which CinemaOS's own reporting does
  // not.
  const estimatedWatchedRef = useRef<number | null>(null);
  const lastTickAtRef = useRef<number | null>(null);

  const embedUrl = useMemo(() => {
    const path =
      type === 'movie'
        ? `${BASE}/${mediaId}`
        : `${BASE}/${mediaId}/${season || 1}/${episode || 1}`;

    const params = new URLSearchParams();
    params.set('theme', 'ffffff');
    if (autoPlay === false) params.set('autoPlay', 'false');
    if (autoNext && type === 'tv') params.set('autoNext', 'true');

    let resume: number | undefined;
    if (autoResume && typeof window !== 'undefined') {
      resume =
        type === 'tv'
          ? getResumeSeconds(type, mediaId, season, episode)
          : getResumeSeconds(type, mediaId);
      if (resume != null) {
        params.set('startTime', String(Math.floor(resume)));
      }
    }

    // Seed the estimate from the same resume point we're asking
    // CinemaOS to start at (0 if there's none yet) - reset any prior
    // estimate since this is effectively a fresh mount (new title,
    // new episode, or a fresh player switch).
    estimatedWatchedRef.current = resume ?? 0;
    lastTickAtRef.current = null;

    return `${path}?${params.toString()}`;
  }, [type, mediaId, season, episode, autoPlay, autoNext, autoResume]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return;

      // Kept as a fallback in case a future version (or a specific
      // title) actually sends this, matching CinemaOS's own docs -
      // but in practice, captured raw traffic shows CinemaOS never
      // sends this at all, only the PLAYER_EVENT ticks handled below.
      if (event.data?.type === 'MEDIA_DATA') {
        try {
          const merged = recordFromMediaData(event.data.data);
          onMediaData?.(merged);
        } catch {
          // Corrupt payload — ignore rather than risk clobbering storage.
        }
        return;
      }

      if (event.data?.type === 'PLAYER_EVENT') {
        const p = event.data.data;
        if (!p) return;
        if (p.event !== 'timeupdate' && p.event !== 'pause' && p.event !== 'ended') return;
        if (p.tmdbId == null) return;
        if (p.mediaType !== 'movie' && p.mediaType !== 'tv') return;
        if (!Number.isFinite(p.duration)) return;

        // Advance our own estimate by real elapsed time while actually
        // playing; reset the delta baseline (don't reset the estimate
        // itself) on pause/ended so a paused stretch never counts, and
        // resuming afterward starts a clean delta window rather than
        // one big jump covering the paused time too.
        const now = Date.now();
        if (estimatedWatchedRef.current == null) estimatedWatchedRef.current = 0;

        if (p.playing) {
          if (lastTickAtRef.current != null) {
            const delta = Math.min((now - lastTickAtRef.current) / 1000, MAX_TICK_DELTA_SECONDS);
            if (delta > 0) estimatedWatchedRef.current += delta;
          }
          lastTickAtRef.current = now;
        } else {
          lastTickAtRef.current = null;
        }

        // Never let floating-point drift push the estimate past the
        // (trusted) duration.
        const estimated = Math.min(estimatedWatchedRef.current, Math.max(p.duration - 0.25, 0));

        recordTimeupdate({
          type: p.mediaType,
          id: p.tmdbId,
          currentTime: estimated,
          duration: p.duration,
          season: p.season,
          episode: p.episode,
          title,
          poster_path: posterPath,
        });

        const shouldPushNow =
          p.event !== 'timeupdate' || now - lastPushRef.current >= PUSH_INTERVAL_MS;

        if (shouldPushNow) {
          lastPushRef.current = now;
          import('@/lib/cloud-sync')
            .then((m) => m.pushProgressSnapshot())
            .catch(() => {});
        }

        onMediaData?.(loadProgressStore());
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMediaData, title, posterPath]);

  return (
    <div className="relative w-full pt-[56.25%] overflow-hidden rounded-xl bg-black">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title || 'Video player'}
        className="absolute top-0 left-0 w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
