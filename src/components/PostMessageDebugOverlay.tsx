'use client';

import { useEffect, useState } from 'react';

interface LoggedMessage {
  id: number;
  time: string;
  origin: string;
  raw: string;
}

/**
 * TEMPORARY diagnostic tool. Shows every postMessage the page
 * receives, plus our own internal debug steps (dispatched by
 * CinemaOSPlayer as a 'tigerstream-debug-estimate' CustomEvent,
 * tagged [ESTIMATE] here) - so we can see both what CinemaOS actually
 * sends AND what our own code does with it, without needing DevTools.
 * Only renders with ?debug=1 in the URL.
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
    const push = (origin: string, raw: string) => {
      counter += 1;
      setMessages((prev) => [{ id: counter, time: new Date().toLocaleTimeString(), origin, raw }, ...prev].slice(0, 40));
    };

    const messageHandler = (event: MessageEvent) => {
      const raw = (() => {
        try {
          return JSON.stringify(event.data);
        } catch {
          return String(event.data);
        }
      })();
      push(event.origin, raw);
    };

    const estimateHandler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      push('[ESTIMATE]', JSON.stringify(detail));
    };

    window.addEventListener('message', messageHandler);
    window.addEventListener('tigerstream-debug-estimate', estimateHandler as EventListener);
    return () => {
      window.removeEventListener('message', messageHandler);
      window.removeEventListener('tigerstream-debug-estimate', estimateHandler as EventListener);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 9999,
        width: minimized ? 180 : 440,
        maxHeight: minimized ? 44 : '65vh',
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
        <span>debug log ({messages.length})</span>
        <span>{minimized ? '▲' : '▼'}</span>
      </div>
      {!minimized && (
        <div style={{ overflowY: 'auto', maxHeight: 'calc(65vh - 40px)', padding: 8 }}>
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
                background: m.origin === '[ESTIMATE]' ? 'rgba(127,184,217,0.15)' : 'rgba(255,255,255,0.05)',
                borderRadius: 6,
                wordBreak: 'break-all',
              }}
            >
              <div style={{ opacity: 0.6, marginBottom: 2, color: m.origin === '[ESTIMATE]' ? '#7FB8D9' : undefined }}>
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
