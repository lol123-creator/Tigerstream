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

// Minimum gap between cloud pushes triggered by timeupdate ticks -
// same throttle Videasy uses.
const PUSH_INTERVAL_MS = 8000;

interface CinemaOSPlayerProps {
  type: 'movie' | 'tv';
  mediaId: string | number;
  season?: number;
  episode?: number;
  title?: string;
  posterPath?: string;
  autoPlay?: boolean;
  autoNext?: boolean;
  autoResume?: boolean;
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

  const embedUrl = useMemo(() => {
    const path =
      type === 'movie'
        ? `${BASE}/${mediaId}`
        : `${BASE}/${mediaId}/${season || 1}/${episode || 1}`;

    const params = new URLSearchParams();
    params.set('theme', 'ffffff');
    if (autoPlay === false) params.set('autoPlay', 'false');
    if (autoNext && type === 'tv') params.set('autoNext', 'true');

    if (autoResume && typeof window !== 'undefined') {
      const resume =
        type === 'tv'
          ? getResumeSeconds(type, mediaId, season, episode)
          : getResumeSeconds(type, mediaId);
      if (resume != null) {
        params.set('startTime', String(Math.floor(resume)));
      }
    }

    return `${path}?${params.toString()}`;
  }, [type, mediaId, season, episode, autoPlay, autoNext, autoResume]);

  // Handles progress the exact same way VideasyPlayer does: take
  // CinemaOS's own reported currentTime/duration directly, no extra
  // estimation or transformation. The shared near-zero guard in
  // watch-progress.ts's recordTimeupdate is what protects against a
  // stuck-at-zero reading overwriting real progress - nothing more
  // than that is needed on top.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return;

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
        if (!Number.isFinite(p.currentTime) || !Number.isFinite(p.duration)) return;

        recordTimeupdate({
          type: p.mediaType,
          id: p.tmdbId,
          currentTime: p.currentTime,
          duration: p.duration,
          season: p.season,
          episode: p.episode,
          title,
          poster_path: posterPath,
        });

        const now = Date.now();
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
