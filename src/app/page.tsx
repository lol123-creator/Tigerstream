import { Suspense } from 'react';
import { ContinueWatchingRow } from '@/components/ContinueWatchingRow';
import { Hero } from '@/components/Hero';
import { MediaRow } from '@/components/MediaRow';
import { SportsRow } from '@/components/sports/SportsRow';
import { HomeMoreRows } from '@/components/HomeMoreRows';
import { HomeMoreRowsSkeleton } from '@/components/HomeMoreRowsSkeleton';
import { getHomeSportsRow } from '@/lib/ppv/service';
import { HOME_ROW_SIZE } from '@/lib/tmdb/service';
import {
  getFeaturedHero,
  getNewMovies,
  getNewTvSeries,
  getTrendingToday,
} from '@/lib/tmdb/service';

/** Refresh hero + "hot today" rows every 30 minutes */
export const revalidate = 1800;

function row<T>(items: T[]): T[] {
  return items.slice(0, HOME_ROW_SIZE);
}

export default async function HomePage() {
  const [featured, trendingToday, newMovies, newTv, sportsRow] =
    await Promise.all([
      getFeaturedHero(),
      getTrendingToday(),
      getNewMovies(3),
      getNewTvSeries(3),
      getHomeSportsRow(16),
    ]);

  return (
    <>
      <Hero item={featured.item} badge={featured.badge} />
      <div className="relative z-10 -mt-8 space-y-2 pb-16">
        <ContinueWatchingRow />
        <SportsRow title={sportsRow.title} streams={sportsRow.streams} />
        <MediaRow title="Hot Right Now" items={row(trendingToday)} />
        <MediaRow title="New Movies" items={row(newMovies)} />
        <MediaRow title="New TV Series" items={row(newTv)} />

        <Suspense fallback={<HomeMoreRowsSkeleton />}>
          <HomeMoreRows />
        </Suspense>
      </div>
    </>
  );
}