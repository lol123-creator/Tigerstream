'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback, useState, lazy, Suspense } from 'react';
import { SITE_NAME } from '@/lib/brand';
import { LiteModeToggle } from '@/components/LiteModeToggle';

const SearchDropdown = lazy(() =>
  import('@/components/SearchDropdown').then((m) => ({ default: m.SearchDropdown }))
);

const NAV_LINKS = [
  { label: 'Movies', href: '/movies', icon: 'film' },
  { label: 'TV Shows', href: '/tv', icon: 'tv' },
  { label: 'Anime', href: '/anime', icon: 'sparkle' },
  { label: 'Sports', href: '/sports', icon: 'trophy' },
  { label: 'Genres', href: '/genres', icon: 'grid' },
  { label: 'My List', href: '/favorites', icon: 'bookmark' },
];

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'film':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" />
        </svg>
      );
    case 'tv':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 3 8 6M16 3l-4 3" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...common}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
          <path d="M8 6H5a2 2 0 0 0 2 4M16 6h3a2 2 0 0 1-2 4" />
          <path d="M12 13v3M9 20h6M9.5 20c0-2 .8-3 2.5-3s2.5 1 2.5 3" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg {...common}>
          <path d="M6 4h12v17l-6-4-6 4V4Z" />
        </svg>
      );
    default:
      return null;
  }
}

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
    <>
      {/*
        Fixed, deterministic height (h-16 = 4rem) - several pages use
        `sticky top-16` for their own filter bars to sit flush under
        the nav. When this height was implicit (padding-driven, varying
        across redesign passes) those sticky offsets drifted out of
        sync and left a visible gap where page content peeked through.
        Keeping this explicit is what keeps that seam from coming back.
      */}
      <header
        className={`fixed inset-x-0 top-0 z-50 h-16 border-b border-glass-border bg-surface/60 backdrop-blur-md transition-colors ${
          isWatch
            ? 'bg-surface/80 backdrop-blur-md'
            : 'bg-gradient-to-b from-black/60 to-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            aria-label={`${SITE_NAME} home`}
            className="font-display shrink-0 text-xl font-medium tracking-tight"
          >
            Tiger<span className="text-accent">Stream</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-accent/15 text-accent'
                    : 'text-ink-2 hover:bg-white/[0.06] hover:text-white'
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

          <LiteModeToggle />

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-2 transition hover:bg-white/[0.08] hover:text-white md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`h-5 w-5 transition-transform duration-200 ${menuOpen ? 'rotate-90' : ''}`}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Backdrop - dims the page behind the mobile menu and gives it
          somewhere to visually sit, instead of a flat list floating
          directly under the nav. z-[60] - strictly above the fixed nav
          (z-50) and any page-level sticky bars like the genre filter
          row (z-40), which were previously the same z-index as this
          menu and could render on top of it, blocking taps underneath. */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fadeIn md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {menuOpen && (
        <div className="fixed inset-x-3 top-[4.5rem] z-[60] overflow-hidden rounded-2xl border border-glass-border bg-surface-card/95 shadow-2xl backdrop-blur-md md:hidden">
          <div className="p-2">
            {NAV_LINKS.map(({ label, href, icon }, i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{ animation: `heroRise 0.3s ease-out ${i * 0.03}s both` }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-accent/15 text-accent'
                    : 'text-ink-2 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <NavIcon name={icon} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
