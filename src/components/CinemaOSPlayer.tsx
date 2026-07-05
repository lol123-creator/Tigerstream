'use client';

import { useEffect, useRef } from 'react';

// CinemaOS direct embed endpoint
const BASE = 'https://cinemaos.tech/player';

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
    const params = new URLSearchParams();
    params.set('theme', 'ffffff');
    if (type === 'tv') {
      params.set('type', 'tv');
      params.set('season', String(season));
      params.set('episode', String(episode));
    }
    if (autoPlay === false) params.set('autoPlay', 'false');
    if (autoNext && type === 'tv') params.set('autoNext', 'true');
    return `${BASE}/${mediaId}?${params.toString()}`;
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        // Safely check origin without triggering cross-origin errors
        if (!event.origin.includes('cinemaos')) return;
        if (event.data?.type === 'MEDIA_DATA') {
          try {
            localStorage.setItem(
              'peachifyProgress',
              JSON.stringify(event.data.data),
            );
          } catch {}
        }
      } catch {
        // Silently ignore cross-origin access errors
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
        sandbox="allow-same-origin allow-scripts allow-presentation allow-forms"
      />
    </div>
  );
}
