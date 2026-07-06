'use client';

import { useEffect, useState } from 'react';

const SESSION_KEY = 'tigerstream:intro-shown';

/**
 * One-time full-screen intro that plays when someone first lands on the
 * site in a given browser session (not on every internal navigation -
 * gated by sessionStorage). Skipped entirely for prefers-reduced-motion.
 *
 * Timeline: reveal (0-0.7s) -> hold (0.7-1.4s) -> fade out (1.4-1.9s) ->
 * unmount. Total ~1.9s so it reads as a deliberate beat, not a delay.
 */
export function IntroSplash() {
  const [phase, setPhase] = useState<'hidden' | 'showing' | 'leaving'>('hidden');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (alreadyShown || prefersReduced) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return;
    }

    setPhase('showing');
    const leaveTimer = setTimeout(() => setPhase('leaving'), 1400);
    const doneTimer = setTimeout(() => {
      setPhase('hidden');
      sessionStorage.setItem(SESSION_KEY, '1');
    }, 1900);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-surface transition-opacity duration-500 ease-in-out"
      style={{ opacity: phase === 'leaving' ? 0 : 1 }}
    >
      <div className="flex flex-col items-center">
        <span
          className="font-display text-4xl font-medium tracking-tight text-white md:text-5xl"
          style={{ animation: 'introReveal 0.7s ease-out both' }}
        >
          Tiger<span className="text-accent">Stream</span>
        </span>
        <span
          className="mt-4 h-[2px] w-10 origin-center bg-accent/60"
          style={{ animation: 'introLine 0.5s ease-out 0.35s both' }}
        />
      </div>
    </div>
  );
}
