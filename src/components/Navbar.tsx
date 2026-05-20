'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { SITE_NAME } from '@/lib/brand';

const NAV_LINKS = [
  { label: 'Movies', href: '/movies' },
  { label: 'TV Shows', href: '/tv' },
  { label: 'Anime', href: '/anime' },
  { label: 'Sports', href: '/sports' },
  { label: 'Genres', href: '/genres' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isWatch =
    pathname.startsWith('/watch') || pathname.startsWith('/sports/watch');

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setMenuOpen(false);
    }
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        isWatch
          ? 'bg-surface/90 backdrop-blur-md'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      {/* ── Main nav row ── */}
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="font-display shrink-0 text-xl font-bold tracking-tight"
        >
          Tiger<span className="text-accent">Stream</span>
        </Link>

        {/* Desktop category links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-accent/15 text-accent'
                  : 'text-white/70 hover:bg-white/8 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Search bar */}
        <form
          onSubmit={onSearch}
          className="ml-auto flex max-w-xs flex-1 sm:max-w-sm"
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, genres…"
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none ring-accent/50 focus:border-accent/50 focus:ring-2"
          />
        </form>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
        >
          {menuOpen ? (
            /* X icon */
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-surface/95 backdrop-blur-md md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-accent/15 text-accent'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
