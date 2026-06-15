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
}

export interface TmdbMovieDetail extends TmdbMovieSummary {
  runtime: number | null;
  tagline?: string | null;
  genres: TmdbGenre[];
  status?: string;
  credits?: TmdbCredits;
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
}