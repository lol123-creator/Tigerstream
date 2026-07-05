'use client';

import { useEffect, useRef } from 'react';

// CinemaOS.live embed endpoint - https://cinemaos.live/embed
const BASE = 'https://cinemaos.live/embed';

interface CinemaOSPlayerProps {
  type: 'movie' | 'tv';
  mediaId: string | number;
  season?: number;
  episode?: number;
  title?: string;
  autoPlay?: boolean;
  autoNext?: boolean;
}

export function CinemaOSPlayer({
  type,
  mediaId,
  season,
  episode,
  title,
  autoPlay = true,
  autoNext = true,
}: CinemaOSPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildUrl = () => {
    const params = new URLSearchParams();

    // Set media ID as primary identifier
    const mediaPath = type === 'tv' 
      ? `${mediaId}/s${season || 1}/e${episode || 1}`
      : `${mediaId}`;

    // Base URL with media path
    let url = `${BASE}/${mediaPath}`;

    // Add optional parameters
    const queryParams: string[] = [];
    
    if (autoPlay === false) queryParams.push('autoPlay=false');
    if (autoNext && type === 'tv') queryParams.push('autoNext=true');

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    return url;
  };

  useEffect(() => {
    if (!iframeRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        // Verify origin is from cinemaos.live
        if (!event.origin.includes('cinemaos.live')) return;

        // Handle player events
        if (event.data?.event) {
          // Log events for debugging (optional)
          // console.log('CinemaOS event:', event.data.event);
        }

        // Handle progress/watchlist data
        if (event.data?.type === 'progress') {
          try {
            localStorage.setItem(
              'cinemaosProgress',
              JSON.stringify(event.data.data),
            );
          } catch {
            // Silently ignore storage errors
          }
        }
      } catch {
        // Silently ignore cross-origin errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
        referrerPolicy="no-referrer"
        sandbox="allow-same-origin allow-scripts allow-presentation allow-forms allow-popups"
      />
    </div>
  );
}
