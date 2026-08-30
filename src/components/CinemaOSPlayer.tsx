'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { PeachifyProgressStore } from '@/peachify';
import { getResumeSeconds, recordFromMediaData } from '@/lib/watch-progress';

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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return;
      if (event.data?.type !== 'MEDIA_DATA') return;

      try {
        // recordFromMediaData re-keys off each entry's own id/type
        // fields rather than the payload's own object keys, so
        // CinemaOS keying its store like "m550" (per its docs) doesn't
        // matter here - it's handled centrally, the same way for all
        // three players. It also does the cloud push, so nothing else
        // is needed in this handler.
        const merged = recordFromMediaData(event.data.data);
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
