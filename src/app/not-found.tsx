'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="mt-2 text-white/50">
        This title isn&apos;t in our catalog.
      </p>

      {/* Search box so users can recover quickly from a bad URL */}
      <form
        onSubmit={onSubmit}
        className="mt-6 flex w-full max-w-sm gap-2"
        role="search"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for a movie or show…"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 outline-none focus:border-accent"
          aria-label="Search"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          disabled={!q.trim()}
        >
          Search
        </button>
      </form>

      <Link
        href="/"
        className="mt-4 text-sm text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
      >
        or back to home
      </Link>
    </div>
  );
}