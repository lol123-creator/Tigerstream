'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Surface to the browser console so devs can see what blew up.
    console.error('Tigerstream crashed:', error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-ambient-glow" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </div>

      <h1 className="font-display relative mt-5 text-4xl font-semibold">Something went wrong</h1>
      <p className="relative mt-2 max-w-md text-white/50">
        We hit an unexpected problem loading this page. It&apos;s been logged —
        try again, or head back home.
      </p>
      {error.digest && (
        <p className="relative mt-2 text-xs text-white/30">Reference: {error.digest}</p>
      )}
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl bg-accent px-6 py-2.5 font-medium text-[#0A1F2B] transition hover:bg-accent-hover hover:shadow-glow"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-white/10 px-6 py-2.5 font-medium text-white/80 transition hover:bg-white/5"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
