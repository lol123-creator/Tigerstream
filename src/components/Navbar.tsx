'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback, useState, lazy, Suspense } from 'react';
import { SITE_NAME } from '@/lib/brand';

const SearchDropdown = lazy(() =>
  import('@/components/SearchDropdown').then((m) => ({ default: m.SearchDropdown }))
);

const NAV_LINKS = [
  { label: 'Movies', href: '/movies' },
  { label: 'TV Shows', href: '/tv' },
  { label: 'Anime', href: '/anime' },
  { label: 'Sports', href: '/sports' },
  { label: 'Genres', href: '/genres' },
  { label: 'My List', href: '/favorites' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isWatch =
    pathname.startsWith('/watch') || pathname.startsWith('/sports/watch');

  const activeMap = useMemo(() => {
    const m = {};
    for (const { href } of NAV_LINKS) {
      m[href] = href === '/' ? pathname === '/' : pathname.startsWith(href);
    }
    return m;
  }, [pathname]);

  const isActive = useCallback(
    (href) => activeMap[href] ?? false,
    [activeMap]
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/[0.03] bg-surface/80 backdrop-blur-xl transition-colors ${
        isWatch
          ? 'bg-surface/90 backdrop-blur-md'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="font-display shrink-0 text-xl font-bold tracking-tight"
        >
          Tiger<span className="text-accent">Stream</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-accent/15 text-accent'
                  : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <Suspense
          fallback={
            <div className="ml-auto h-9 w-full max-w-xs animate-pulse rounded-full bg-white/5 sm:max-w-sm" />
          }
        >
          <SearchDropdown />
        </Suspense>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

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
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
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
