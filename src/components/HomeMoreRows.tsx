import { MediaRow } from '@/components/MediaRow';
import { HOME_ROW_SIZE } from '@/lib/tmdb/service';
import {
  getAnimeMovies,
  getAnimeTvShows,
  getDiscoverMovies,
  getNewMovies,
  getNewTvSeries,
  getNowPlayingMovies,
  getPopularMovies,
  getPopularTv,
  getTopRatedMovies,
  getTopRatedTv,
  getTrendingMovies,
  getTrendingThisWeek,
  getTrendingTv,
} from '@/lib/tmdb/service';

function row<T>(items: T[]): T[] {
  return items.slice(0, HOME_ROW_SIZE);
}

/**
 * Below-the-fold rows for the home page.
 * Wrapped in <Suspense> so the hero + first rows render immediately
 * while these fetch in the background.
 */
export async function HomeMoreRows() {
  const [
    trendingWeek,
    newMovies,
    newTv,
    trendingMovies,
    trendingTv,
    popularMovies,
    popularTv,
    topRatedMovies,
    topRatedTv,
    nowPlaying,
    horror,
    comedy,
    sciFi,
    romance,
    animation,
    crimeThriller,
    action,
    animeMovies,
    animeShows,
  ] = await Promise.all([
    getTrendingThisWeek(),
    getNewMovies(3),
    getNewTvSeries(3),
    getTrendingMovies(3),
    getTrendingTv(3),
    getPopularMovies(3),
    getPopularTv(3),
    getTopRatedMovies(3),
    getTopRatedTv(3),
    getNowPlayingMovies(3),
    getDiscoverMovies(27, 3),
    getDiscoverMovies(35, 3),
    getDiscoverMovies('878,14', 3),
    getDiscoverMovies(10749, 3),
    getDiscoverMovies('16,10751', 3),
    getDiscoverMovies('80,53', 3),
    getDiscoverMovies('28,12', 3),
    getAnimeMovies(3),
    getAnimeTvShows(3),
  ]);

  return (
    <>
      <MediaRow title="Trending This Week" items={row(trendingWeek)} />
      <MediaRow title="Trending Movies" items={row(trendingMovies)} />
      <MediaRow title="Trending TV Shows" items={row(trendingTv)} />
      <MediaRow title="Popular Movies" items={row(popularMovies)} />
      <MediaRow title="Popular TV Shows" items={row(popularTv)} />
      <MediaRow title="Top Rated Movies" items={row(topRatedMovies)} />
      <MediaRow title="Top Rated TV" items={row(topRatedTv)} />
      <MediaRow title="In Theaters Now" items={row(nowPlaying)} />
      <MediaRow title="Action & Adventure" items={row(action)} />
      <MediaRow title="Horror" items={row(horror)} />
      <MediaRow title="Comedy" items={row(comedy)} />
      <MediaRow title="Sci-Fi & Fantasy" items={row(sciFi)} />
      <MediaRow title="Romance" items={row(romance)} />
      <MediaRow title="Animation & Family" items={row(animation)} />
      <MediaRow title="Crime & Thriller" items={row(crimeThriller)} />
      <MediaRow title="Anime Movies" items={row(animeMovies)} />
      <MediaRow title="Anime Shows" items={row(animeShows)} />
    </>
  );
}