'use client';

import { useEffect, useRef } from 'react';

// CinemaOS provides a proxy endpoint that wraps Videasy player embeds (cinemaos.live/embed is 404)
// Use the working proxy endpoint to get Videasy player with CinemaOS branding
const BASE = 'https://cinemaos.live/api/proxy?url=https://player.videasy.net';

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
        ? `/movie/${mediaId}`
        : `/tv/${mediaId}/${season}/${episode}`;
    const params = new URLSearchParams();
    params.set('theme', 'ffffff');
    if (autoPlay === false) params.set('autoPlay', 'false');
    if (autoNext && type === 'tv') params.set('autoNext', 'true');
    return `${BASE}${path}?${params.toString()}`;
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://player.videasy.net') return;
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
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="origin"
      />
    </div>
  );
}