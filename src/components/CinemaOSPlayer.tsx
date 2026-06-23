'use client';

import { useEffect, useRef } from 'react';

// Use cinemaos.live embed endpoint (confirmed working)
const BASE = 'https://cinemaos.live';

export function CinemaOSPlayer({
  type,
  mediaId,
  season,
  episode,
  title,
  autoPlay = true,
  autoNext = true,
}: {
  type: 'movie' | 'tv';
  mediaId: string | number;
  season?: number;
  episode?: number;
  title?: string;
  autoPlay?: boolean;
  autoNext?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildUrl = () => {
    const path =
      type === 'movie'
        ? `${BASE}/movie/${mediaId}`
        : `${BASE}/tv/${mediaId}`;
    const params = new URLSearchParams();
    params.set('theme', 'ffffff');
    if (!autoPlay) params.set('autoPlay', 'false');
    if (autoNext && type === 'tv') params.set('autoNext', 'true');
    if (type === 'tv' && season != null && episode != null) {
      params.set('season', String(season));
      params.set('episode', String(episode));
    }
    return `${path}?${params.toString()}`;
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://cinemaos.live') return;
      if (event.data?.type === 'MEDIA_DATA') {
        try {
          localStorage.setItem(
            'peachifyProgress',
            JSON.stringify(event.data.data),
          );
        } catch {}
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div className="relative w-full pt-[56.25%] overflow-hidden rounded-xl bg-black">
      <iframe
        ref={iframeRef}
        src={buildUrl()}
        title={title || 'Video player'}
        className="absolute top-0 left-0 w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen"
        referrerPolicy="origin"
      />
    </div>
  );
}
