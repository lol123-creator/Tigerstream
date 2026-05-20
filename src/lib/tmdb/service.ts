import {
  movies as fallbackMovies,
  tvShows as fallbackTvShows,
  getMovie as fallbackGetMovie,
  getTvShow as fallbackGetTvShow,
  searchCatalog as fallbackSearch,
} from '@/lib/catalog';
import type { MediaItem, Movie, TvShow } from '@/types/media';
import { isTmdbEnabled, tmdbFetch } from './client';
import { dedupeById, fetchPaged } from './fetch-pages';
import { MOVIE_GENRES, TV_GENRES, type Genre } from './genres';
import { featured as fallbackFeatured } from '@/lib/catalog';
import {
  mapMovieDetail,
  mapMovieSummary,
  mapSearchResult,
  mapTrendingItem,
  mapTvDetail,
  mapTvHeroDetail,
  mapTvSummary,
} from './mappers';
import type {
  TmdbMovieDetail,
  TmdbPaginated,
  TmdbMovieSummary,
  TmdbSeasonDetail,
  TmdbTrendingResult,
  TmdbTvDetail,
  TmdbTvSummary,
  TmdbSearchResult,
} from './types';

/** Pages × 20 results — 15 pages = 300 titles per browse view */
export const BROWSE_PAGE_COUNT = 15;

/** Number of items per paginated browse page (1 TMDB page = 20 items) */
export const PAGE_SIZE = 20;

const HOME_ROW_SIZE = 24;

export { HOME_ROW_SIZE };

async function fetchMoviePopularPage(page: number): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>('/movie/popular', {
    page,
  });
  return data.results.map((m) => mapMovieSummary(m));
}

async function fetchTvPopularPage(page: number): Promise<TvShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>('/tv/popular', { page });
  return data.results.map((t) => mapTvSummary(t));
}

async function fetchMovieTopRatedPage(page: number): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>('/movie/top_rated', {
    page,
  });
  return data.results.map((m) => mapMovieSummary(m));
}

async function fetchTvTopRatedPage(page: number): Promise<TvShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>('/tv/top_rated', { page });
  return data.results.map((t) => mapTvSummary(t));
}

async function fetchDiscoverMoviePage(
  page: number,
  genreIds: string,
): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>('/discover/movie', {
    with_genres: genreIds,
    sort_by: 'popularity.desc',
    page,
  });
  return data.results.map((m) => mapMovieSummary(m));
}

async function fetchDiscoverTvPage(page: number, genreIds: string): Promise<TvShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>('/discover/tv', {
    with_genres: genreIds,
    sort_by: 'popularity.desc',
    page,
  });
  return data.results.map((t) => mapTvSummary(t));
}

async function fetchTrendingMoviePage(page: number): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>(
    '/trending/movie/week',
    { page },
  );
  return data.results.map((m) => mapMovieSummary(m));
}

async function fetchTrendingTvPage(page: number): Promise<TvShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>('/trending/tv/week', {
    page,
  });
  return data.results.map((t) => mapTvSummary(t));
}

async function fetchNowPlayingPage(page: number): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>('/movie/now_playing', {
    page,
  });
  return data.results.map((m) => mapMovieSummary(m));
}

/** Shorter cache for “what’s hot now” lists and the hero. */
const HOT_REVALIDATE = 1800;

export async function getTrendingToday(): Promise<MediaItem[]> {
  if (!isTmdbEnabled()) return [];
  const data = await tmdbFetch<TmdbPaginated<TmdbTrendingResult>>(
    '/trending/all/day',
    {},
    HOT_REVALIDATE,
  );
  const items = data.results
    .map(mapTrendingItem)
    .filter((x): x is MediaItem => x != null);
  return dedupeById(items);
}

export async function getTrendingThisWeek(): Promise<MediaItem[]> {
  if (!isTmdbEnabled()) return [];
  const data = await tmdbFetch<TmdbPaginated<TmdbTrendingResult>>('/trending/all/week');
  const items = data.results
    .map(mapTrendingItem)
    .filter((x): x is MediaItem => x != null);
  return dedupeById(items);
}

async function fetchNewMoviesPage(page: number): Promise<Movie[]> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>(
    '/discover/movie',
    {
      sort_by: 'primary_release_date.desc',
      'primary_release_date.lte': today,
      'vote_count.gte': '25',
      region: 'US',
      page,
    },
    HOT_REVALIDATE,
  );
  return data.results.map((m) => mapMovieSummary(m));
}

async function fetchNewTvPage(page: number): Promise<TvShow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>(
    '/discover/tv',
    {
      sort_by: 'first_air_date.desc',
      'first_air_date.lte': today,
      'vote_count.gte': '25',
      page,
    },
    HOT_REVALIDATE,
  );
  return data.results.map((t) => mapTvSummary(t));
}

export async function getNewMovies(pages = 3): Promise<Movie[]> {
  if (!isTmdbEnabled()) return fallbackMovies;
  return dedupeById(await fetchPaged(pages, fetchNewMoviesPage));
}

export async function getNewTvSeries(pages = 3): Promise<TvShow[]> {
  if (!isTmdbEnabled()) return fallbackTvShows;
  return dedupeById(await fetchPaged(pages, fetchNewTvPage));
}

function pickHeroCandidate(items: MediaItem[]): MediaItem | undefined {
  return (
    items.find((i) => i.backdrop_path && i.overview.length > 40) ??
    items.find((i) => i.backdrop_path) ??
    items[0]
  );
}

/**
 * Featured hero: #1 hot title today, with full detail (tagline, genres).
 * Refreshes every ~30 minutes via page revalidate.
 */
export async function getFeaturedHero(): Promise<{
  item: MediaItem;
  badge: string;
}> {
  const [today, newMovies, newTv] = await Promise.all([
    getTrendingToday(),
    getNewMovies(1),
    getNewTvSeries(1),
  ]);

  const pick =
    pickHeroCandidate(today) ??
    pickHeroCandidate(newMovies) ??
    pickHeroCandidate(newTv);

  if (!pick) {
    return { item: fallbackFeatured, badge: 'Featured' };
  }

  let badge = 'Trending Today';
  if (today.some((t) => t.id === pick.id && t.type === pick.type)) {
    badge = pick.type === 'movie' ? 'Hot Movie Today' : 'Hot Series Today';
  } else if (newMovies.some((m) => m.id === pick.id)) {
    badge = 'New Movie';
  } else if (newTv.some((t) => t.id === pick.id)) {
    badge = 'New Series';
  }

  try {
    if (pick.type === 'movie') {
      const full = await getMovieById(pick.id);
      if (full) return { item: full, badge };
    } else {
      const data = await tmdbFetch<TmdbTvDetail>(`/tv/${pick.id}`, {}, HOT_REVALIDATE);
      return { item: mapTvHeroDetail(data), badge };
    }
  } catch {
    // use list metadata
  }

  return { item: pick, badge };
}

export async function getPopularMovies(pages = BROWSE_PAGE_COUNT): Promise<Movie[]> {
  if (!isTmdbEnabled()) return fallbackMovies;
  return dedupeById(await fetchPaged(pages, fetchMoviePopularPage));
}

export async function getPopularTv(pages = BROWSE_PAGE_COUNT): Promise<TvShow[]> {
  if (!isTmdbEnabled()) return fallbackTvShows;
  return dedupeById(await fetchPaged(pages, fetchTvPopularPage));
}

export async function getTopRatedMovies(pages = 5): Promise<Movie[]> {
  if (!isTmdbEnabled()) return fallbackMovies;
  return dedupeById(await fetchPaged(pages, fetchMovieTopRatedPage));
}

export async function getTopRatedTv(pages = 5): Promise<TvShow[]> {
  if (!isTmdbEnabled()) return fallbackTvShows;
  return dedupeById(await fetchPaged(pages, fetchTvTopRatedPage));
}

export async function getTrendingMovies(pages = 3): Promise<Movie[]> {
  if (!isTmdbEnabled()) return fallbackMovies;
  return dedupeById(await fetchPaged(pages, fetchTrendingMoviePage));
}

export async function getTrendingTv(pages = 3): Promise<TvShow[]> {
  if (!isTmdbEnabled()) return fallbackTvShows;
  return dedupeById(await fetchPaged(pages, fetchTrendingTvPage));
}

export async function getNowPlayingMovies(pages = 3): Promise<Movie[]> {
  if (!isTmdbEnabled()) return fallbackMovies;
  return dedupeById(await fetchPaged(pages, fetchNowPlayingPage));
}

export async function getDiscoverMovies(
  genreIds: string | number,
  pages = 3,
): Promise<Movie[]> {
  const ids = String(genreIds);
  if (!isTmdbEnabled()) return fallbackMovies;
  return dedupeById(await fetchPaged(pages, (p) => fetchDiscoverMoviePage(p, ids)));
}

export async function getDiscoverTv(
  genreIds: string | number,
  pages = 3,
): Promise<TvShow[]> {
  const ids = String(genreIds);
  if (!isTmdbEnabled()) return fallbackTvShows;
  return dedupeById(await fetchPaged(pages, (p) => fetchDiscoverTvPage(p, ids)));
}

export async function getMoviesByGenre(
  genreId: number,
  pages = BROWSE_PAGE_COUNT,
): Promise<Movie[]> {
  return getDiscoverMovies(genreId, pages);
}

export async function getTvByGenre(
  genreId: number,
  pages = BROWSE_PAGE_COUNT,
): Promise<TvShow[]> {
  return getDiscoverTv(genreId, pages);
}

export async function getMovieGenres(): Promise<Genre[]> {
  if (!isTmdbEnabled()) return MOVIE_GENRES;
  try {
    const data = await tmdbFetch<{ genres: Genre[] }>('/genre/movie/list');
    return data.genres.length ? data.genres : MOVIE_GENRES;
  } catch {
    return MOVIE_GENRES;
  }
}

export async function getTvGenres(): Promise<Genre[]> {
  if (!isTmdbEnabled()) return TV_GENRES;
  try {
    const data = await tmdbFetch<{ genres: Genre[] }>('/genre/tv/list');
    return data.genres.length ? data.genres : TV_GENRES;
  } catch {
    return TV_GENRES;
  }
}

/** @deprecated use getDiscoverMovies('28,12') */
export async function getActionAdventureMovies(): Promise<MediaItem[]> {
  return getDiscoverMovies('28,12', 3);
}

export async function searchMedia(query: string): Promise<MediaItem[]> {
  const q = query.trim();
  if (!q) return [];
  if (!isTmdbEnabled()) return fallbackSearch(q);

  const data = await tmdbFetch<TmdbPaginated<TmdbSearchResult>>('/search/multi', {
    query: q,
    include_adult: 'false',
    page: 1,
  });

  return data.results
    .map(mapSearchResult)
    .filter((x): x is MediaItem => x != null)
    .slice(0, 40);
}

export async function getMovieById(id: number): Promise<Movie | null> {
  if (!isTmdbEnabled()) return fallbackGetMovie(id) ?? null;
  try {
    const data = await tmdbFetch<TmdbMovieDetail>(`/movie/${id}`);
    return mapMovieDetail(data);
  } catch {
    return fallbackGetMovie(id) ?? null;
  }
}

async function fetchSeason(
  tvId: number,
  seasonNumber: number,
): Promise<TmdbSeasonDetail | null> {
  try {
    return await tmdbFetch<TmdbSeasonDetail>(
      `/tv/${tvId}/season/${seasonNumber}`,
    );
  } catch {
    return null;
  }
}

export async function getTvShowById(id: number): Promise<TvShow | null> {
  if (!isTmdbEnabled()) return fallbackGetTvShow(id) ?? null;

  try {
    const show = await tmdbFetch<TmdbTvDetail>(`/tv/${id}`);
    const seasonNumbers = show.seasons
      .filter((s) => s.season_number > 0 && s.episode_count > 0)
      .map((s) => s.season_number)
      .slice(0, 20);

    const seasonDetails = (
      await Promise.all(seasonNumbers.map((n) => fetchSeason(id, n)))
    ).filter((s): s is TmdbSeasonDetail => s != null);

    return mapTvDetail(show, seasonDetails);
  } catch {
    return fallbackGetTvShow(id) ?? null;
  }
}

export interface WatchTvContext {
  showTitle: string;
  episodeTitle: string;
  next?: { season: number; episode: number; title: string };
}

export async function getWatchTvContext(
  showId: number,
  season: number,
  episode: number,
): Promise<WatchTvContext | null> {
  if (!isTmdbEnabled()) {
    const show = fallbackGetTvShow(showId);
    if (!show) return null;
    const s = show.seasons.find((x) => x.season_number === season);
    const ep = s?.episodes.find((e) => e.episode === episode);
    if (!ep) return null;
    const idx = s!.episodes.findIndex((e) => e.episode === episode);
    const nextEp = s!.episodes[idx + 1];
    const nextSeason = !nextEp
      ? show.seasons[show.seasons.findIndex((x) => x.season_number === season) + 1]
      : null;
    return {
      showTitle: show.title,
      episodeTitle: ep.title,
      next: nextEp
        ? { season, episode: nextEp.episode, title: nextEp.title }
        : nextSeason?.episodes[0]
          ? {
              season: nextSeason.season_number,
              episode: nextSeason.episodes[0].episode,
              title: nextSeason.episodes[0].title,
            }
          : undefined,
    };
  }

  try {
    const [show, seasonData] = await Promise.all([
      tmdbFetch<{ name: string }>(`/tv/${showId}`),
      fetchSeason(showId, season),
    ]);
    if (!seasonData) return null;

    const current = seasonData.episodes.find((e) => e.episode_number === episode);
    if (!current) return null;

    const idx = seasonData.episodes.findIndex((e) => e.episode_number === episode);
    const nextInSeason = seasonData.episodes[idx + 1];

    let next: WatchTvContext['next'];
    if (nextInSeason) {
      next = {
        season,
        episode: nextInSeason.episode_number,
        title: nextInSeason.name,
      };
    } else {
      const showDetail = await tmdbFetch<TmdbTvDetail>(`/tv/${showId}`);
      const seasons = showDetail.seasons
        .filter((s) => s.season_number > 0)
        .sort((a, b) => a.season_number - b.season_number);
      const si = seasons.findIndex((s) => s.season_number === season);
      const nextSeasonNum = seasons[si + 1]?.season_number;
      if (nextSeasonNum != null) {
        const nextSeason = await fetchSeason(showId, nextSeasonNum);
        const first = nextSeason?.episodes[0];
        if (first) {
          next = {
            season: nextSeasonNum,
            episode: first.episode_number,
            title: first.name,
          };
        }
      }
    }

    return {
      showTitle: show.name,
      episodeTitle: current.name,
      next,
    };
  } catch {
    return null;
  }
}

export async function getMovieTitle(id: number): Promise<string | null> {
  const movie = await getMovieById(id);
  return movie?.title ?? null;
}

export interface PagedResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
}

export async function getPopularMoviesPage(page = 1): Promise<PagedResult<Movie>> {
  if (!isTmdbEnabled()) {
    return { items: fallbackMovies.slice(0, PAGE_SIZE), totalPages: 1, currentPage: 1 };
  }
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>('/movie/popular', { page });
  return {
    items: dedupeById(data.results.map(mapMovieSummary)),
    totalPages: Math.min(data.total_pages ?? 1, 500),
    currentPage: page,
  };
}

export async function getPopularTvPage(page = 1): Promise<PagedResult<TvShow>> {
  if (!isTmdbEnabled()) {
    return { items: fallbackTvShows.slice(0, PAGE_SIZE), totalPages: 1, currentPage: 1 };
  }
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>('/tv/popular', { page });
  return {
    items: dedupeById(data.results.map(mapTvSummary)),
    totalPages: Math.min(data.total_pages ?? 1, 500),
    currentPage: page,
  };
}

export async function getMoviesByGenrePage(
  genreId: number,
  page = 1,
): Promise<PagedResult<Movie>> {
  if (!isTmdbEnabled()) {
    return { items: fallbackMovies.slice(0, PAGE_SIZE), totalPages: 1, currentPage: 1 };
  }
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>('/discover/movie', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page,
  });
  return {
    items: dedupeById(data.results.map(mapMovieSummary)),
    totalPages: Math.min(data.total_pages ?? 1, 500),
    currentPage: page,
  };
}

export async function getTvByGenrePage(
  genreId: number,
  page = 1,
): Promise<PagedResult<TvShow>> {
  if (!isTmdbEnabled()) {
    return { items: fallbackTvShows.slice(0, PAGE_SIZE), totalPages: 1, currentPage: 1 };
  }
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>('/discover/tv', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page,
  });
  return {
    items: dedupeById(data.results.map(mapTvSummary)),
    totalPages: Math.min(data.total_pages ?? 1, 500),
    currentPage: page,
  };
}
