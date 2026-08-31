'use client';

import { useEffect, useState } from 'react';

interface LoggedMessage {
  id: number;
  time: string;
  origin: string;
  raw: string;
}

/**
 * TEMPORARY diagnostic tool - not meant to stay in the codebase long
 * term. Shows every postMessage the page receives, directly on
 * screen, so we can see what CinemaOS/Videasy actually send without
 * needing DevTools (which CinemaOS appears to block/detect). Only
 * renders when the URL has ?debug=1, so it never shows for normal
 * visitors even if this stays in place a while.
 *
 * Delete this file and its one usage in WatchLayout.tsx once the
 * progress-sync issue is diagnosed.
 */
export function PostMessageDebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [messages, setMessages] = useState<LoggedMessage[]>([]);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setEnabled(new URLSearchParams(window.location.search).get('debug') === '1');
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let counter = 0;
    const handler = (event: MessageEvent) => {
      counter += 1;
      const raw = (() => {
        try {
          return JSON.stringify(event.data);
        } catch {
          return String(event.data);
        }
      })();

      setMessages((prev) =>
        [
          {
            id: counter,
            time: new Date().toLocaleTimeString(),
            origin: event.origin,
            raw,
          },
          ...prev,
        ].slice(0, 25),
      );
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 9999,
        width: minimized ? 180 : 420,
        maxHeight: minimized ? 44 : '60vh',
        overflow: 'hidden',
        background: 'rgba(10, 12, 16, 0.95)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12,
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 11,
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div
        onClick={() => setMinimized((m) => !m)}
        style={{
          padding: '8px 12px',
          borderBottom: minimized ? 'none' : '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 700,
        }}
      >
        <span>postMessage log ({messages.length})</span>
        <span>{minimized ? '▲' : '▼'}</span>
      </div>
      {!minimized && (
        <div style={{ overflowY: 'auto', maxHeight: 'calc(60vh - 40px)', padding: 8 }}>
          {messages.length === 0 && (
            <p style={{ opacity: 0.5, padding: 8 }}>
              No messages received yet. Press play and wait a few seconds.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                marginBottom: 6,
                padding: 6,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 6,
                wordBreak: 'break-all',
              }}
            >
              <div style={{ opacity: 0.6, marginBottom: 2 }}>
                {m.time} · {m.origin}
              </div>
              <div>{m.raw}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
