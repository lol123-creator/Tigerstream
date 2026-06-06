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
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-white/50">
        We hit an unexpected problem loading this page. It&apos;s been logged —
        try again, or head back home.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-white/30">Reference: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-accent px-6 py-2 font-medium text-white hover:bg-accent-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/10 px-6 py-2 font-medium text-white/80 hover:bg-white/5"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
