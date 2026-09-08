'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PeachifyProgressStore } from '@/peachify';
import {
  getResumeSeconds,
  loadProgressStore,
  recordFromMediaData,
  recordTimeupdate,
} from '@/lib/watch-progress';

const ORIGIN = 'https://cinemaos.tech';
const BASE = `${ORIGIN}/player`;
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

  // TEMPORARY - self-contained debug state, rendered directly on this
  // component (no separate overlay file to coordinate deploying).
  // Only ever set when ?debug=1 is present.
  const [debugOn, setDebugOn] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDebugOn(new URLSearchParams(window.location.search).get('debug') === '1');
  }, []);

  const pushDebug = (line: string) => {
    setDebugLog((prev) => [
      `${new Date().toLocaleTimeString()}  ${line}`,
      ...prev,
    ].slice(0, 30));
  };

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
    pushDebug(`LISTENER ATTACHED for ${type} ${mediaId}`);

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return;

      pushDebug(`MSG type=${event.data?.type} event=${event.data?.data?.event}`);

      if (event.data?.type === 'MEDIA_DATA') {
        try {
          const merged = recordFromMediaData(event.data.data);
          onMediaData?.(merged);
        } catch (err) {
          pushDebug(`MEDIA_DATA ERROR: ${String(err)}`);
        }
        return;
      }

      if (event.data?.type === 'PLAYER_EVENT') {
        const p = event.data.data;
        if (!p) {
          pushDebug('SKIP: no payload');
          return;
        }
        if (p.event !== 'timeupdate' && p.event !== 'pause' && p.event !== 'ended') {
          pushDebug(`SKIP: event type "${p.event}" not handled`);
          return;
        }
        if (p.tmdbId == null) {
          pushDebug('SKIP: no tmdbId');
          return;
        }
        if (p.mediaType !== 'movie' && p.mediaType !== 'tv') {
          pushDebug(`SKIP: bad mediaType "${p.mediaType}"`);
          return;
        }
        if (!Number.isFinite(p.currentTime) || !Number.isFinite(p.duration)) {
          pushDebug(`SKIP: bad numbers ct=${p.currentTime} dur=${p.duration}`);
          return;
        }

        pushDebug(`RECORDING ct=${p.currentTime} dur=${p.duration} id=${p.tmdbId}`);

        try {
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

          const store = loadProgressStore();
          const key = `${p.mediaType}-${p.tmdbId}`;
          const saved = store[key];

          pushDebug(
            saved
              ? `SAVED OK: watched=${saved.progress?.watched} duration=${saved.progress?.duration} title="${saved.title}"`
              : `SAVE FAILED: key "${key}" not found after write! keys=[${Object.keys(store).join(',')}]`,
          );

          const now = Date.now();
          const shouldPushNow =
            p.event !== 'timeupdate' || now - lastPushRef.current >= PUSH_INTERVAL_MS;

          if (shouldPushNow) {
            lastPushRef.current = now;
            import('@/lib/cloud-sync')
              .then((m) => m.pushProgressSnapshot())
              .catch((err) => pushDebug(`CLOUD PUSH ERROR: ${String(err)}`));
          }

          onMediaData?.(store);
        } catch (err) {
          pushDebug(`RECORD THREW: ${String(err)}`);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      pushDebug('LISTENER DETACHED');
      window.removeEventListener('message', handleMessage);
    };
  }, [onMediaData, title, posterPath, type, mediaId]);

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
      {debugOn && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            maxHeight: '70%',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.85)',
            color: '#7FB8D9',
            fontFamily: 'monospace',
            fontSize: 11,
            padding: 8,
            borderRadius: 8,
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div style={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}>
            CinemaOS debug (this file, live)
          </div>
          {debugLog.length === 0 && <div style={{ opacity: 0.6 }}>Waiting for messages...</div>}
          {debugLog.map((line, i) => (
            <div key={i} style={{ marginBottom: 2, wordBreak: 'break-all' }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
