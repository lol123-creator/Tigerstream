import { MediaGrid } from '@/components/MediaGrid';
import { MediaRow } from '@/components/MediaRow';
import { Pagination } from '@/components/Pagination';
import {
  getAnimeMovies,
  getAnimeTvShows,
  getAnimeMoviesPage,
  getAnimeTvPage,
} from '@/lib/tmdb/service';
import type { MediaItem } from '@/types/media';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anime',
  description: 'Browse anime movies and TV shows.',
};

/**
 * Render on-demand instead of at build time.
 *
 * This page fetches live external data (TMDB anime listings)
 * which triggers a stack-overflow bug in Next 15.5.x's static-generation
 * worker ("Generating static pages" step). Forcing dynamic rendering
 * skips that codepath entirely; the underlying fetch() calls still use
 * their own `revalidate` windows, so response caching is unaffected.
 */
export const dynamic = 'force-dynamic';

type Tab = 'all' | 'movies' | 'shows';

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { tab: tabParam, page: pageParam } = await searchParams;
  const tab: Tab =
    tabParam === 'movies' ? 'movies' : tabParam === 'shows' ? 'shows' : 'all';
  const currentPage = Math.max(1, Number(pageParam) || 1);

  /* ── Data fetching ── */
  let gridItems: MediaItem[] = [];
  let totalPages = 1;

  if (tab === 'movies') {
    const result = await getAnimeMoviesPage(currentPage);
    gridItems = result.items;
    totalPages = result.totalPages;
  } else if (tab === 'shows') {
    const result = await getAnimeTvPage(currentPage);
    gridItems = result.items;
    totalPages = result.totalPages;
  } else {
    // "All" tab — show horizontal rows of both, no paginator needed
    const [movies, shows] = await Promise.all([
      getAnimeMovies(3),
      getAnimeTvShows(3),
    ]);
    gridItems = [...movies, ...shows];
  }

  /* ── Tab helpers ── */
  function tabHref(t: Tab) {
    return t === 'all' ? '/anime' : `/anime?tab=${t}`;
  }

  const tabs: { label: string; value: Tab }[] = [
    { label: 'All', value: 'all' },
    { label: 'Movies', value: 'movies' },
    { label: 'Shows', value: 'shows' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      {/* Header */}
      <h1 className="font-display mb-1 text-3xl font-bold">
        Anime
      </h1>
      <p className="mb-6 text-sm text-white/45">
        Anime movies &amp; series, all in one place.
      </p>

      {/* Sub-tabs: All / Movies / Shows */}
      <div className="sticky top-[4.25rem] z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          {tabs.map(({ label, value }) => (
            <a
              key={value}
              href={tabHref(value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === value
                  ? 'bg-accent text-black'
                  : 'border border-white/15 text-white/65 hover:border-accent/50 hover:text-white'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'all' ? (
        /* Horizontal scroll rows */
        <div className="space-y-2">
          <AnimeRows />
        </div>
      ) : (
        /* Paginated grid */
        <>
          {currentPage > 1 && (
            <p className="mb-4 text-sm text-white/45">
              Page {currentPage} of {totalPages}
            </p>
          )}
          <MediaGrid items={gridItems} priorityCount={18} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={(p) => `/anime?tab=${tab}&page=${p}`}
          />
        </>
      )}
    </div>
  );
}

/* Server component that fetches and renders the two rows for the "All" view */
async function AnimeRows() {
  const [movies, shows] = await Promise.all([
    getAnimeMovies(3),
    getAnimeTvShows(3),
  ]);

  return (
    <>
      <MediaRow title="Popular Anime Movies" items={movies.slice(0, 24)} />
      <MediaRow title="Popular Anime Shows" items={shows.slice(0, 24)} />
    </>
  );
}
