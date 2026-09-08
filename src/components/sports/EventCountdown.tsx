'use client';

import { useEffect, useState } from 'react';

/**
 * Live-ticking countdown to an event's start time, ppv.st-style:
 * "HH:MM:SS" when under a day away, "N days, HH:MM:SS" beyond that.
 * Client-only (needs setInterval) - the card itself stays a plain
 * component and only this small piece opts into client rendering.
 */
export function EventCountdown({ startsAt }: { startsAt: number }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Nothing rendered until the first client tick, to avoid a
  // server/client mismatch (the server has no "now" to render from).
  if (now == null) return null;

  const diffMs = startsAt * 1000 - now;
  if (diffMs <= 0) return null; // already started - the page's own live/ended sections handle that

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <span className="tabular-nums">
      {days > 0 ? `${days} day${days === 1 ? '' : 's'}, ${clock}` : clock}
    </span>
  );
}
