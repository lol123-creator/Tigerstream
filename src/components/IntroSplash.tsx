'use client';

import { useEffect, useState } from 'react';

const SESSION_KEY = 'tigerstream:intro-shown';
const LITE_KEY = 'tigerstream:lite-mode';

/**
 * One-time full-screen intro that plays when someone first lands on the
 * site in a given browser session (not on every internal navigation -
 * gated by sessionStorage). Skipped entirely for prefers-reduced-motion
 * and for Lite Mode (weak devices don't need an extra animated overlay
 * delaying real content).
 *
 * Timeline: reveal (0-0.5s) -> hold (0.5-0.9s) -> fade out (0.9-1.2s) ->
 * unmount. Shortened from an original ~1.9s total - that was adding a
 * fixed, unavoidable delay before every new visitor saw any real
 * content, which reads as "the site is slow to load" even though the
 * page itself is loading normally underneath it.
 */
export function IntroSplash() {
  const [phase, setPhase] = useState<'hidden' | 'showing' | 'leaving'>('hidden');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let liteMode = false;
    try {
      liteMode = localStorage.getItem(LITE_KEY) === '1';
    } catch {
      // storage unavailable - treat as not lite mode
    }

    if (alreadyShown || prefersReduced || liteMode) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return;
    }

    setPhase('showing');
    const leaveTimer = setTimeout(() => setPhase('leaving'), 900);
    const doneTimer = setTimeout(() => {
      setPhase('hidden');
      sessionStorage.setItem(SESSION_KEY, '1');
    }, 1200);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-surface transition-opacity duration-300 ease-in-out"
      style={{ opacity: phase === 'leaving' ? 0 : 1 }}
    >
      <div className="flex flex-col items-center">
        <span
          className="font-display text-4xl font-medium tracking-tight text-white md:text-5xl"
          style={{ animation: 'introReveal 0.5s ease-out both' }}
        >
          Tiger<span className="text-accent">Stream</span>
        </span>
        <span
          className="mt-4 h-[2px] w-10 origin-center bg-accent/60"
          style={{ animation: 'introLine 0.4s ease-out 0.25s both' }}
        />
      </div>
    </div>
  );
}
