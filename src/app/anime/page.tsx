import Link from 'next/link';
import { Hero, type HeroSlide } from '@/components/Hero';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaRow } from '@/components/MediaRow';
import { Pagination } from '@/components/Pagination';
import { ANIME_CATEGORIES, getAnimeCategory } from '@/lib/tmdb/genres';
import {
  getAnimeMovies,
  getAnimeTvShows,
  getAnimeMoviesPage,
  getAnimeTvPage,
  getTopRatedAnime,
  getNewAnime,
  getGhibliFilms,
  getAnimeCategoryCombined,
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

function pickHeroCandidate(items: MediaItem[]): MediaItem | undefined {
  return (
    items.find((i) => i.backdrop_path && i.overview.length > 40) ??
    items.find((i) => i.backdrop_path) ??
    items[0]
  );
}

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string; category?: string }>;
}) {
  const { tab: tabParam, page: pageParam, category: categoryParam } = await searchParams;
  const tab: Tab =
    tabParam === 'movies' ? 'movies' : tabParam === 'shows' ? 'shows' : 'all';
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const category = tab === 'all' ? getAnimeCategory(categoryParam ?? '') : undefined;

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
  } else if (category) {
    gridItems = await getAnimeCategoryCombined(category.movieGenres, category.tvGenres);
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
    <div className="pb-16">
      {/* Featured hero - only on the top-level "All" overview, not on a
          selected category or the Movies/Shows paginated views. */}
      {tab === 'all' && !category && <AnimeHero />}

      <div className={`mx-auto max-w-7xl px-4 sm:px-6 ${tab === 'all' && !category ? 'mt-10' : 'pt-24'}`}>
        {!(tab === 'all' && !category) && (
          <>
            <h1 className="font-display mb-1 text-3xl font-bold">
              {category ? category.name : 'Anime'}
            </h1>
            <p className="mb-6 text-sm text-white/45">
              {category
                ? 'Curated anime picks in this category.'
                : 'Anime movies & series, all in one place.'}
            </p>
          </>
        )}

        {/* Sub-tabs: All / Movies / Shows - top-16 matches the navbar's
            fixed h-16 exactly, and the lighter/blurred background reads
            as frosted glass instead of a solid bar. */}
        <div className="sticky top-16 z-40 -mx-4 mb-6 border-b border-white/5 bg-surface/70 px-4 py-3 backdrop-blur-lg sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map(({ label, value }) => (
              <a
                key={value}
                href={tabHref(value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === value && !category
                    ? 'bg-accent text-[#0A1F2B]'
                    : 'border border-white/10 bg-white/[0.04] text-white/65 hover:border-accent/30 hover:text-white'
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Curated category chips - how anime fans actually browse,
              rather than generic movie genre names. Only relevant on
              the "All" overview. */}
          {tab === 'all' && (
            <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto">
              <Link
                href="/anime"
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  !category
                    ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                    : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                }`}
              >
                Overview
              </Link>
              {ANIME_CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/anime?category=${c.slug}`}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    category?.slug === c.slug
                      ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                      : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {tab === 'all' ? (
          category ? (
            <MediaGrid items={gridItems} priorityCount={12} />
          ) : (
            <div className="space-y-2">
              <AnimeRows />
            </div>
          )
        ) : (
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
    </div>
  );
}

/** Featured hero for the anime overview - top pick from what's trending. */
async function AnimeHero() {
  const topRated = await getTopRatedAnime(1);
  const pick = pickHeroCandidate(topRated);
  if (!pick) return null;

  const slides: HeroSlide[] = [{ item: pick, badge: 'Top Rated Anime' }];
  return <Hero slides={slides} />;
}

/* Server component that fetches and renders the curated rows for the "All" overview */
async function AnimeRows() {
  const [newAnime, ghibli, topRated, movies, shows] = await Promise.all([
    getNewAnime(1),
    getGhibliFilms(1),
    getTopRatedAnime(1),
    getAnimeMovies(2),
    getAnimeTvShows(2),
  ]);

  return (
    <>
      {newAnime.length > 0 && (
        <MediaRow title="New This Season" items={newAnime.slice(0, 18)} />
      )}
      {ghibli.length > 0 && (
        <MediaRow title="Studio Ghibli Collection" items={ghibli.slice(0, 18)} />
      )}
      {topRated.length > 0 && (
        <MediaRow title="Top Rated Anime" items={topRated.slice(0, 18)} />
      )}
      <MediaRow title="Popular Anime Movies" items={movies.slice(0, 18)} />
      <MediaRow title="Popular Anime Shows" items={shows.slice(0, 18)} />
    </>
  );
}
