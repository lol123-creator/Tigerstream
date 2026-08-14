import { Suspense } from 'react';
import { ContinueWatchingRow } from '@/components/ContinueWatchingRow';
import { FavoritesRow } from '@/components/FavoritesRow';
import { BecauseYouWatched } from '@/components/BecauseYouWatched';
import { Hero, type HeroSlide } from '@/components/Hero';
import { MediaRow } from '@/components/MediaRow';
import { SportsRow } from '@/components/sports/SportsRow';
import { HomeMoreRows } from '@/components/HomeMoreRows';
import { HomeMoreRowsSkeleton } from '@/components/HomeMoreRowsSkeleton';
import { getHomeSportsRow } from '@/lib/ppv/service';
import { HOME_ROW_SIZE } from '@/lib/tmdb/service';
import {
  getNewMovies,
  getNewTvSeries,
  getTrendingToday,
} from '@/lib/tmdb/service';
 
/**
 * Render on-demand instead of at build time.
 *
 * This page mixes live external data (PPV sports feed, TMDB trending)
 * inside a top-level Promise.all + a nested Suspense boundary, which
 * triggers a stack-overflow bug in Next 15.5.x's static-generation
 * worker ("Generating static pages" step). Forcing dynamic rendering
 * skips that codepath entirely; the underlying fetch() calls still use
 * their own `revalidate` windows, so response caching is unaffected.
 */
export const dynamic = 'force-dynamic';
 
function row<T>(items: T[]): T[] {
  return items.slice(0, HOME_ROW_SIZE);
}
 
export default async function HomePage() {
  const [trendingToday, newMovies, newTv, sportsRow] =
    await Promise.all([
      getTrendingToday(),
      getNewMovies(3),
      getNewTvSeries(3),
      getHomeSportsRow(16),
    ]);
 
  const heroSlides: HeroSlide[] = trendingToday.slice(0, 6).map((t) => ({
    item: t,
    badge: t.type === 'movie' ? 'Hot Movie Today' : 'Hot Series Today',
  }));
 
  return (
    <>
      <Hero slides={heroSlides} />
      <div className="relative z-10 -mt-8 space-y-2 pb-16">
        {/* Bridges the hero's bottom fade into the page background so
            the seam between the backdrop image and the rows below
            reads as one continuous gradient instead of a hard cut
            into flat color. Sits behind the rows, not on the cards. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-96 bg-ambient-glow opacity-90"
        />
        <FavoritesRow />
        <ContinueWatchingRow />
        <BecauseYouWatched />
        <div style={{contentVisibility:'auto', containIntrinsicSize:'auto 300px'}}><SportsRow title={sportsRow.title} streams={sportsRow.streams} /></div>
        <div style={{contentVisibility:'auto', containIntrinsicSize:'auto 300px'}}><MediaRow title="Hot Right Now" items={row(trendingToday)} /></div>
        <MediaRow title="New Movies" items={row(newMovies)} />
        <MediaRow title="New TV Series" items={row(newTv)} />
 
        <Suspense fallback={<HomeMoreRowsSkeleton />}>
          <HomeMoreRows />
        </Suspense>
      </div>
    </>
  );
}
