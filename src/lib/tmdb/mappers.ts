import type { Cast, Episode, MediaItem, Movie, Season, TvShow } from '@/types/media';
import type {
  TmdbCast,
  TmdbMovieDetail,
  TmdbMovieSummary,
  TmdbSearchResult,
  TmdbSeasonDetail,
  TmdbTrendingResult,
  TmdbTvDetail,
  TmdbTvSummary,
} from './types';

function genreNames(genres: { name: string }[] | undefined): string[] {
  return genres?.map((g) => g.name) ?? [];
}

function mapCast(cast: TmdbCast[] | undefined): Cast[] {
  if (!cast) return [];
  return cast
    .slice(0, 12)
    .map((c) => ({
      name: c.name,
      character: c.character,
      profile_path: c.profile_path ?? undefined,
      order: c.order,
    }));
}

export function mapMovieSummary(m: TmdbMovieSummary, genres: string[] = []): Movie {
  const trailer = (m.videos?.results || [])
    .find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
    ?.key;

  return {
    ...mapMovieSummary(m, genreNames(m.genres)),
    runtime: m.runtime ?? 0,
    tagline: m.tagline || undefined,
    cast: mapCast(cast),
    status: (m.status as any) || undefined,
    trailer_key: trailer || undefined,
  };
}

export function mapMovieDetail(
  m: TmdbMovieDetail,
  cast?: TmdbCast[],
): Movie {
  const trailer = (m.videos?.results || [])
    .find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
    ?.key;

  return {
    ...mapMovieSummary(m, genreNames(m.genres)),
    runtime: m.runtime ?? 0,
    tagline: m.tagline || undefined,
    cast: mapCast(cast),
    status: (m.status as any) || undefined,
    trailer_key: trailer || undefined,
  };
}

export function mapTvSummary(t: TmdbTvSummary, genres: string[] = []): TvShow {
  return {
    id: t.id,
    type: 'tv',
    title: t.name,
    overview: t.overview ?? '',
    poster_path: t.poster_path ?? '',
    backdrop_path: t.backdrop_path ?? '',
    first_air_date: t.first_air_date ?? '',
    vote_average: t.vote_average ?? 0,
    genres,
    seasons: [],
    original_language: t.original_language,
  };
}

/** Hero banner: full metadata without loading every episode. */
export function mapTvHeroDetail(t: TmdbTvDetail): TvShow {
  const trailer = (t.videos?.results || [])
    .find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
    ?.key;

  return {
    ...mapTvSummary(
      {
        id: t.id,
        name: t.name,
        overview: t.overview,
        poster_path: t.poster_path,
        backdrop_path: t.backdrop_path,
        first_air_date: t.first_air_date,
        vote_average: t.vote_average,
      },
      genreNames(t.genres),
    ),
    tagline: t.tagline || undefined,
    seasons: [],
    trailer_key: trailer || undefined,
  };
}

export function mapTvDetail(
  t: TmdbTvDetail,
  seasonDetails: TmdbSeasonDetail[],
  cast?: TmdbCast[],
): TvShow {
  const seasons: Season[] = seasonDetails
    .filter((s) => s.season_number > 0 && s.episodes.length > 0)
    .sort((a, b) => a.season_number - b.season_number)
    .map((s) => ({
      season_number: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      episode_count: s.episodes.length,
      poster_path: s.poster_path ?? undefined,
      air_date: s.air_date ?? undefined,
      episodes: s.episodes.map(
        (ep): Episode => ({
          season: s.season_number,
          episode: ep.episode_number,
          title: ep.name,
          overview: ep.overview ?? '',
          runtime: ep.runtime ?? 0,
          still_path: ep.still_path ?? undefined,
        }),
      ),
    }));

  const trailer = (t.videos?.results || [])
    .find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
    ?.key;

  return {
    ...mapTvSummary(t, genreNames(t.genres)),
    tagline: t.tagline || undefined,
    seasons,
    cast: mapCast(cast),
    status: (t.status as any) || undefined,
    trailer_key: trailer || undefined,
  };
}

export function mapTrendingItem(r: TmdbTrendingResult): MediaItem | null {
  if (r.media_type === 'movie') {
    return mapMovieSummary({
      id: r.id,
      title: r.title ?? 'Untitled',
      overview: r.overview ?? '',
      poster_path: r.poster_path,
      backdrop_path: r.backdrop_path,
      release_date: r.release_date ?? '',
      vote_average: r.vote_average ?? 0,
      original_language: r.original_language,
    });
  }
  if (r.media_type === 'tv') {
    return mapTvSummary({
      id: r.id,
      name: r.name ?? 'Untitled',
      overview: r.overview ?? '',
      poster_path: r.poster_path,
      backdrop_path: r.backdrop_path,
      first_air_date: r.first_air_date ?? '',
      vote_average: r.vote_average ?? 0,
      original_language: r.original_language,
    });
  }
  return null;
}

export function mapSearchResult(r: TmdbSearchResult): MediaItem | null {
  if (r.media_type === 'movie') {
    return mapMovieSummary({
      id: r.id,
      title: r.title ?? 'Untitled',
      overview: r.overview ?? '',
      poster_path: r.poster_path,
      backdrop_path: r.backdrop_path,
      release_date: r.release_date ?? '',
      vote_average: r.vote_average ?? 0,
      original_language: r.original_language,
    });
  }
  if (r.media_type === 'tv') {
    return mapTvSummary({
      id: r.id,
      name: r.name ?? 'Untitled',
      overview: r.overview ?? '',
      poster_path: r.poster_path,
      backdrop_path: r.backdrop_path,
      first_air_date: r.first_air_date ?? '',
      vote_average: r.vote_average ?? 0,
      original_language: r.original_language,
    });
  }
  return null;
}
