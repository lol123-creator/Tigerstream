'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function WatchError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Watch page crashed:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl font-bold">
        We couldn&apos;t start playback
      </h1>
      <p className="mt-2 max-w-md text-white/50">
        The video player hit an error. This is usually a temporary issue
        with the source.
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
