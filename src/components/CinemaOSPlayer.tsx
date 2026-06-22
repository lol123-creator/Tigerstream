'use client';

import { useEffect, useRef } from 'react';

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
    const path =
      type === 'movie'
        ? `${BASE}/${mediaId}`
        : `${BASE}/${mediaId}/${season}/${episode}`;
    const params = new URLSearchParams();
    params.set('theme', 'ffffff');
    if (!autoPlay) params.set('autoPlay', 'false');
    if (autoNext && type === 'tv') params.set('autoNext', 'true');
    return `${path}?${params.toString()}`;
  };

  // Sync progress back to Tigerstream (same key used by Peachify)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Only accept messages from the CinemaOS domain
      if (event.origin !== 'https://cinemaos.tech') return;
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
        // Allow necessary features and relax sandbox restrictions
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        // Remove sandbox restrictions that could block source selection UI
        sandbox="allow-same-origin allow-scripts allow-popups allow-modals allow-forms"
        referrerPolicy="origin"
      />
    </div>
  );
}