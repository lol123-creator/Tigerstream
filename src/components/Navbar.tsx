'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { SITE_NAME } from '@/lib/brand';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');
  const isWatch =
    pathname.startsWith('/watch') || pathname.startsWith('/sports/watch');

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        isWatch
          ? 'bg-surface/90 backdrop-blur-md'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6">
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="font-display text-xl font-bold tracking-tight"
        >
          Tiger<span className="text-accent">Stream</span>
        </Link>

        <form onSubmit={onSearch} className="ml-auto flex max-w-xs flex-1 sm:max-w-sm">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, genres…"
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none ring-accent/50 focus:border-accent/50 focus:ring-2"
          />
        </form>
      </nav>
    </header>
  );
}
