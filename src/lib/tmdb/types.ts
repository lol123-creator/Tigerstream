export interface TmdbPaginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order?: number;
}

export interface TmdbCredits {
  cast: TmdbCast[];
}

export interface TmdbMovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
  original_language?: string;
}

export interface TmdbVideo { id: string; key: string; name: string; site: string; type: string; official?: boolean; }

/**
 * A single regional release entry from TMDB's /movie/{id}/release_dates
 * (fetched via append_to_response=release_dates).
 * type: 1 Premiere, 2 Theatrical (limited), 3 Theatrical, 4 Digital,
 *       5 Physical, 6 TV.
 */
export interface TmdbReleaseDateEntry {
  certification?: string;
  release_date: string;
  type: number;
}

export interface TmdbReleaseDatesResult {
  iso_3166_1: string;
  release_dates: TmdbReleaseDateEntry[];
}

export interface TmdbMovieDetail extends TmdbMovieSummary {
  runtime: number | null;
  tagline?: string | null;
  genres: TmdbGenre[];
  status?: string;
  credits?: TmdbCredits;
  videos?: { results: TmdbVideo[] };
  release_dates?: { results: TmdbReleaseDatesResult[] };
}

export interface TmdbTvSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface TmdbTvDetail extends TmdbTvSummary {
  tagline?: string | null;
  genres: TmdbGenre[];
  seasons: {
    season_number: number;
    name: string;
    episode_count: number;
  }[];
  status?: string;
  credits?: TmdbCredits;
  videos?: { results: TmdbVideo[] };
}

export interface TmdbSeasonDetail {
  season_number: number;
  name: string;
  poster_path?: string | null;
  air_date?: string | null;
  episodes: {
    episode_number: number;
    name: string;
    overview: string;
    runtime: number | null;
    still_path: string | null;
  }[];
}

export interface TmdbTrendingResult {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  original_language?: string;
  /** TMDB includes this on trending results even though it wasn't
   *  previously declared here - see @/lib/kid-mode for why it matters. */
  genre_ids?: number[];
}

export interface TmdbSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  original_language?: string;
  /** See TmdbTrendingResult.genre_ids. */
  genre_ids?: number[];
}

/** /person/{id} - basic bio fields we display on the person page. */
export interface TmdbPersonDetail {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string | null;
}

/** A single credit row from /person/{id}/combined_credits (movie or tv). */
export interface TmdbPersonCreditItem {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  character?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  original_language?: string;
  popularity?: number;
}

export interface TmdbPersonCombinedCredits {
  cast: TmdbPersonCreditItem[];
}
