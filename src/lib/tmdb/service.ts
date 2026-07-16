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
  TmdbPersonDetail,
  TmdbPersonCombinedCredits,
} from './types';

export const BROWSE_PAGE_COUNT = 15;
export const PAGE_SIZE = 20;

/**
 * Items per row on the homepage.
 *
 * The homepage renders up to 20 rows in one page (3 on the main page +
 * 17 in HomeMoreRows). At 24 items/row that's up to ~480 <MediaCard>
 * components at once - each with its own image, hover transitions, and
 * a FavoriteButton doing post-hydration work. That volume was a real,
 * measurable contributor to poor mobile INP/FID (Speed Insights showed
 * 912ms INP / 262ms FID on mobile). Cutting this to 14 reduces total
 * homepage card count by roughly 40% while each row still scrolls for
 * more - full catalogs remain available via the dedicated browse pages.
 */
const HOME_ROW_SIZE = 14;

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
  genreId: number | string,
  pages = BROWSE_PAGE_COUNT,
): Promise<Movie[]> {
  return getDiscoverMovies(genreId, pages);
}

export async function getTvByGenre(
  genreId: number | string,
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
    // `append_to_response=credits,videos,release_dates` gets cast, the
    // trailer, and the regional release-date breakdown in one call.
    // release_dates is what lets us resolve the *actual* U.S./wide
    // release date instead of TMDB's top-level `release_date`, which
    // can be an earlier festival/foreign premiere date - see
    // resolveReleaseDate() in mappers.ts.
    const data = await tmdbFetch<TmdbMovieDetail>(
      `/movie/${id}`,
      { append_to_response: "credits,videos,release_dates" },
    );
    return mapMovieDetail(data, data.credits?.cast);
  } catch {
    return fallbackGetMovie(id) ?? null;
  }
}

/**
 * Recommendations (not "similar") tend to be a better "if you liked
 * this, watch that" signal than TMDB's /similar endpoint, which mostly
 * matches on shared keywords/genres rather than actual audience overlap.
 */
export async function getSimilarMovies(id: number, limit = 14): Promise<Movie[]> {
  if (!isTmdbEnabled()) return [];
  try {
    const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>(
      `/movie/${id}/recommendations`,
    );
    return dedupeById(data.results.map((m) => mapMovieSummary(m))).slice(0, limit);
  } catch {
    return [];
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
    const show = await tmdbFetch<TmdbTvDetail>(
      `/tv/${id}`,
      { append_to_response: "credits,videos" },
    );
    const seasonNumbers = show.seasons
      .filter((s) => s.season_number > 0 && s.episode_count > 0)
      .map((s) => s.season_number)
      .slice(0, 20);

    const seasonDetails = (
      await Promise.all(seasonNumbers.map((n) => fetchSeason(id, n)))
    ).filter((s): s is TmdbSeasonDetail => s != null);

    return mapTvDetail(show, seasonDetails, show.credits?.cast);
  } catch {
    return fallbackGetTvShow(id) ?? null;
  }
}

export async function getSimilarTv(id: number, limit = 14): Promise<TvShow[]> {
  if (!isTmdbEnabled()) return [];
  try {
    const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>(
      `/tv/${id}/recommendations`,
    );
    return dedupeById(data.results.map((t) => mapTvSummary(t))).slice(0, limit);
  } catch {
    return [];
  }
}

export interface PersonProfile {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string | null;
}

export interface PersonCredits {
  movies: Movie[];
  tvShows: TvShow[];
}

export async function getPersonById(id: number): Promise<PersonProfile | null> {
  if (!isTmdbEnabled()) return null;
  try {
    const data = await tmdbFetch<TmdbPersonDetail>(`/person/${id}`);
    return {
      id: data.id,
      name: data.name,
      biography: data.biography,
      profile_path: data.profile_path,
      birthday: data.birthday,
      deathday: data.deathday,
      place_of_birth: data.place_of_birth,
      known_for_department: data.known_for_department,
    };
  } catch {
    return null;
  }
}

export async function getPersonCredits(id: number): Promise<PersonCredits> {
  if (!isTmdbEnabled()) return { movies: [], tvShows: [] };
  try {
    const data = await tmdbFetch<TmdbPersonCombinedCredits>(
      `/person/${id}/combined_credits`,
    );
    const movies = data.cast
      .filter((c) => c.media_type === 'movie' && c.title)
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .map((c) =>
        mapMovieSummary({
          id: c.id,
          title: c.title ?? 'Untitled',
          overview: '',
          poster_path: c.poster_path,
          backdrop_path: c.backdrop_path,
          release_date: c.release_date ?? '',
          vote_average: c.vote_average ?? 0,
          original_language: c.original_language,
        }),
      );
    const tvShows = data.cast
      .filter((c) => c.media_type === 'tv' && c.name)
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .map((c) =>
        mapTvSummary({
          id: c.id,
          name: c.name ?? 'Untitled',
          overview: '',
          poster_path: c.poster_path,
          backdrop_path: c.backdrop_path,
          first_air_date: c.first_air_date ?? '',
          vote_average: c.vote_average ?? 0,
        }),
      );
    return {
      movies: dedupeById(movies),
      tvShows: dedupeById(tvShows),
    };
  } catch {
    return { movies: [], tvShows: [] };
  }
}

/**
 * Similar/recommended titles for a detail page's "More Like This" row.
 * TMDB's /recommendations endpoint tends to be more relevant than
 * /similar (which is closer to a genre/keyword match), so that's the
 * primary source; if a title is too new/obscure to have recommendation
 * data yet, /similar is used as a fallback.
 */
export async function getSimilarMovies(id: number, limit = 14): Promise<Movie[]> {
  if (!isTmdbEnabled()) return fallbackMovies.slice(0, limit);
  try {
    let data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>(
      `/movie/${id}/recommendations`,
    );
    if (data.results.length === 0) {
      data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>(`/movie/${id}/similar`);
    }
    return dedupeById(data.results.map((m) => mapMovieSummary(m))).slice(0, limit);
  } catch {
    return [];
  }
}

export async function getSimilarTv(id: number, limit = 14): Promise<TvShow[]> {
  if (!isTmdbEnabled()) return fallbackTvShows.slice(0, limit);
  try {
    let data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>(
      `/tv/${id}/recommendations`,
    );
    if (data.results.length === 0) {
      data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>(`/tv/${id}/similar`);
    }
    return dedupeById(data.results.map((t) => mapTvSummary(t))).slice(0, limit);
  } catch {
    return [];
  }
}

export interface PersonProfile {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string | null;
  credits: MediaItem[];
}

/**
 * Person detail + their combined (movie + TV) filmography in one call,
 * sorted by popularity so the roles they're best known for surface
 * first. Filters out anything without a poster or release/air date,
 * since those tend to be low-quality/incomplete TMDB entries that
 * aren't worth showing.
 */
export async function getPersonById(id: number): Promise<PersonProfile | null> {
  if (!isTmdbEnabled()) return null;
  try {
    const [person, credits] = await Promise.all([
      tmdbFetch<TmdbPersonDetail>(`/person/${id}`),
      tmdbFetch<TmdbPersonCombinedCredits>(`/person/${id}/combined_credits`),
    ]);

    const items = credits.cast
      .filter((c) => c.poster_path && (c.release_date || c.first_air_date))
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .map((c): MediaItem | null => {
        if (c.media_type === 'movie') {
          return mapMovieSummary({
            id: c.id,
            title: c.title ?? 'Untitled',
            overview: '',
            poster_path: c.poster_path,
            backdrop_path: c.backdrop_path,
            release_date: c.release_date ?? '',
            vote_average: c.vote_average ?? 0,
            original_language: c.original_language,
          });
        }
        if (c.media_type === 'tv') {
          return mapTvSummary({
            id: c.id,
            name: c.name ?? 'Untitled',
            overview: '',
            poster_path: c.poster_path,
            backdrop_path: c.backdrop_path,
            first_air_date: c.first_air_date ?? '',
            vote_average: c.vote_average ?? 0,
          });
        }
        return null;
      })
      .filter((x): x is MediaItem => x != null);

    return {
      id: person.id,
      name: person.name,
      biography: person.biography,
      profile_path: person.profile_path,
      birthday: person.birthday,
      deathday: person.deathday,
      place_of_birth: person.place_of_birth,
      known_for_department: person.known_for_department,
      credits: dedupeById(items),
    };
  } catch {
    return null;
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
    const [showDetail, seasonData] = await Promise.all([
      tmdbFetch<TmdbTvDetail>(`/tv/${showId}`),
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
      showTitle: showDetail.name,
      episodeTitle: current.name,
      next,
    };
  } catch {
    return null;
  }
}

const ANIME_MOVIE_PARAMS = {
  with_genres: '16',
  with_keywords: '210024',
  sort_by: 'popularity.desc',
} as const;

const ANIME_TV_PARAMS = {
  with_genres: '16',
  with_keywords: '210024',
  sort_by: 'popularity.desc',
} as const;

async function fetchAnimeMoviePage(page: number): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>('/discover/movie', {
    ...ANIME_MOVIE_PARAMS,
    page,
  });
  return data.results.map(mapMovieSummary);
}

async function fetchAnimeTvPage(page: number): Promise<TvShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>('/discover/tv', {
    ...ANIME_TV_PARAMS,
    page,
  });
  return data.results.map(mapTvSummary);
}

export async function getAnimeMovies(pages = 3): Promise<Movie[]> {
  if (!isTmdbEnabled()) return fallbackMovies;
  return dedupeById(await fetchPaged(pages, fetchAnimeMoviePage));
}

export async function getAnimeTvShows(pages = 3): Promise<TvShow[]> {
  if (!isTmdbEnabled()) return fallbackTvShows;
  return dedupeById(await fetchPaged(pages, fetchAnimeTvPage));
}

export async function getAnimeMoviesPage(page = 1): Promise<PagedResult<Movie>> {
  if (!isTmdbEnabled()) {
    return { items: fallbackMovies.slice(0, PAGE_SIZE), totalPages: 1, currentPage: 1 };
  }
  const data = await tmdbFetch<TmdbPaginated<TmdbMovieSummary>>('/discover/movie', {
    ...ANIME_MOVIE_PARAMS,
    page,
  });
  return {
    items: dedupeById(data.results.map(mapMovieSummary)),
    totalPages: Math.min(data.total_pages ?? 1, 500),
    currentPage: page,
  };
}

export async function getAnimeTvPage(page = 1): Promise<PagedResult<TvShow>> {
  if (!isTmdbEnabled()) {
    return { items: fallbackTvShows.slice(0, PAGE_SIZE), totalPages: 1, currentPage: 1 };
  }
  const data = await tmdbFetch<TmdbPaginated<TmdbTvSummary>>('/discover/tv', {
    ...ANIME_TV_PARAMS,
    page,
  });
  return {
    items: dedupeById(data.results.map(mapTvSummary)),
    totalPages: Math.min(data.total_pages ?? 1, 500),
    currentPage: page,
  };
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
  genreId: number | string,
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
  genreId: number | string,
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
