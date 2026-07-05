export type MediaType = 'movie' | 'tv';

export interface Cast {
  name: string;
  character: string;
  profile_path?: string;
  order?: number;
}

export interface Movie {
  trailer_key?: string;
  id: number;
  type: 'movie';
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: string[];
  tagline?: string;
  cast?: Cast[];
  original_language?: string;
  status?: 'Released' | 'Post Production' | 'In Production' | 'Planned' | 'Rumored';
  quality?: string;
  lastQualityUpdate?: number;
}

export interface Episode {
  season: number;
  episode: number;
  title: string;
  overview: string;
  runtime: number;
  still_path?: string;
}

export interface Season {
  season_number: number;
  name: string;
  episode_count: number;
  episodes: Episode[];
  poster_path?: string;
  air_date?: string;
}

export interface TvShow {
  trailer_key?: string;
  id: number;
  type: 'tv';
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genres: string[];
  seasons: Season[];
  tagline?: string;
  cast?: Cast[];
  original_language?: string;
  status?: 'Returning Series' | 'Planned' | 'In Production' | 'Ended' | 'Cancelled';
  quality?: string;
  lastQualityUpdate?: number;
}

export type MediaItem = Movie | TvShow;

export interface ContinueWatchingItem {
  id: number;
  type: MediaType;
  title: string;
  poster_path: string;
  progressPercent: number;
  href: string;
  subtitle?: string;
}
