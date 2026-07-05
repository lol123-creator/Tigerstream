'use client';

import { useEffect, useRef } from 'react';
import { mergePeachifyProgress, type PeachifyProgressStore } from '@/peachify';

// CinemaOS.live embed endpoint - https://cinemaos.live/embed
// Path follows the same convention as every other embed in this family
// (Peachify, VidLink): /embed/movie/{id} and /embed/tv/{id}/{season}/{episode}.
const ORIGIN = 'https://cinemaos.live';
const BASE = `${ORIGIN}/embed`;

interface CinemaOSPlayerProps {
  type: 'movie' | 'tv';
  mediaId: string | number;
  season?: number;
  episode?: number;
  title?: string;
  autoPlay?: boolean;
  autoNext?: boolean;
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
  onMediaData,
}: CinemaOSPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildUrl = () => {
    const path =
      type === 'movie'
        ? `${BASE}/movie/${mediaId}`
        : `${BASE}/tv/${mediaId}/${season || 1}/${episode || 1}`;

    const params = new URLSearchParams();
    if (autoPlay === false) params.set('autoPlay', 'false');
    if (autoNext && type === 'tv') params.set('autoNext', 'true');

    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return;
      if (event.data?.type !== 'MEDIA_DATA') return;

      try {
        // CinemaOS uses the same MEDIA_DATA protocol as Peachify/VidLink:
        // the payload is the *entire* progress store keyed by media id,
        // not a single entry. Merge it in rather than overwrite — a raw
        // localStorage.setItem here would wipe out every other title's
        // continue-watching progress from other players.
        const merged = mergePeachifyProgress(
          event.data.data as PeachifyProgressStore,
        );
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
        src={buildUrl()}
        title={title || 'Video player'}
        className="absolute top-0 left-0 w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="no-referrer"
        sandbox="allow-same-origin allow-scripts allow-presentation allow-forms allow-popups"
      />
    </div>
  );
}
