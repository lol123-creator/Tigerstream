'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  mergePeachifyProgress,
  loadPeachifyProgress,
  getResumeSeconds,
  type PeachifyProgressStore,
} from '@/peachify';

// Per CinemaOS's official integration guide:
//   Movie:   https://cinemaos.tech/player/{tmdb_id}
//   TV Show: https://cinemaos.tech/player/{tmdb_id}/{season}/{episode}
// `startTime` (seconds) is a documented param for resuming playback.
const ORIGIN = 'https://cinemaos.tech';
const BASE = `${ORIGIN}/player`;

interface CinemaOSPlayerProps {
  type: 'movie' | 'tv';
  mediaId: string | number;
  season?: number;
  episode?: number;
  title?: string;
  autoPlay?: boolean;
  autoNext?: boolean;
  /** Resume from the saved position for this title, if any. Defaults to true. */
  autoResume?: boolean;
  /** Called after a MEDIA_DATA payload has been merged into storage. */
  onMediaData?: (store: PeachifyProgressStore) => void;
}

interface CinemaOSMediaEntry {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  progress: { watched: number; duration: number };
  last_updated?: number;
  last_season_watched?: string | number;
  last_episode_watched?: string | number;
  show_progress?: Record<string, unknown>;
}

/**
 * CinemaOS keys its MEDIA_DATA store entries like "m550" (per its own
 * docs example), but Peachify's PeachifyProgressStore is keyed by the
 * bare id string ("550"). Re-keying by each entry's own `id` field
 * (rather than trusting the object's key) makes this robust to that
 * difference so continue-watching lookups actually find these entries.
 */
function toPeachifyStore(
  raw: Record<string, CinemaOSMediaEntry>,
): PeachifyProgressStore {
  const out: PeachifyProgressStore = {};
  for (const entry of Object.values(raw ?? {})) {
    if (!entry || entry.id == null) continue;
    out[String(entry.id)] = entry as PeachifyProgressStore[string];
  }
  return out;
}

export function CinemaOSPlayer({
  type,
  mediaId,
  season,
  episode,
  title,
  autoPlay = true,
  autoNext = true,
  autoResume = true,
  onMediaData,
}: CinemaOSPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Built once per title/episode - looks up the saved position from the
  // shared progress store (same one Peachify reads/writes) and passes it
  // as CinemaOS's documented `startTime` param, the same way
  // PeachifyPlayer already does for its own embed URL.
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
      const store = loadPeachifyProgress();
      const resume =
        type === 'tv'
          ? getResumeSeconds(store, mediaId, season, episode)
          : getResumeSeconds(store, mediaId);
      if (resume != null) {
        params.set('startTime', String(Math.floor(resume)));
      }
    }

    return `${path}?${params.toString()}`;
  }, [type, mediaId, season, episode, autoPlay, autoNext, autoResume]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return;
      if (event.data?.type !== 'MEDIA_DATA') return;

      try {
        const store = toPeachifyStore(
          event.data.data as Record<string, CinemaOSMediaEntry>,
        );
        const merged = mergePeachifyProgress(store);
        onMediaData?.(merged);
      } catch {
        // Corrupt payload — ignore rather than risk clobbering storage.
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMediaData]);

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
