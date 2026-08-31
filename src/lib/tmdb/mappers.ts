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
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path ?? undefined,
      order: c.order,
    }));
}

/**
 * TMDB's top-level `release_date` on a movie is the *earliest* known
 * release anywhere in the world - often a festival premiere or a
 * different territory's date, which can be well before the actual
 * U.S./wide release everyone thinks of as "the release date". That
 * mismatch was making already-announced, not-yet-out movies (e.g. one
 * releasing July 16) show up as already released with a live rating.
 *
 * This looks at the regional release_dates (fetched via
 * append_to_response=release_dates) and picks the U.S. theatrical date
 * when available, falling back sensibly if not.
 *
 * TMDB release type codes: 1 Premiere, 2 Theatrical (limited),
 * 3 Theatrical, 4 Digital, 5 Physical, 6 TV.
 */
function resolveReleaseDate(m: TmdbMovieDetail): string {
  const us = m.release_dates?.results?.find((r) => r.iso_3166_1 === 'US');
  const entries = us?.release_dates ?? [];

  const byType = (type: number) =>
    entries.find((e) => e.type === type && e.release_date)?.release_date;

  const resolved =
    byType(3) ?? // Theatrical (wide) - the one people mean by "release date"
    byType(2) ?? // Theatrical (limited)
    byType(4) ?? // Digital
    byType(1) ?? // Premiere
    undefined;

  // ISO datetime like "2026-07-16T00:00:00.000Z" -> keep just the date part
  const normalized = resolved ? resolved.slice(0, 10) : undefined;

  return normalized || m.release_date || '';
}

export function mapMovieSummary(m: TmdbMovieSummary, genres: string[] = []): Movie {
  const trailer = (m.videos?.results || [])
    .find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
    ?.key;

  return {
    id: m.id,
    type: 'movie',
    title: m.title,
    overview: m.overview ?? '',
    poster_path: m.poster_path ?? '',
    backdrop_path: m.backdrop_path ?? '',
    release_date: m.release_date ?? '',
    runtime: m.runtime ?? 0,
    vote_average: m.vote_average ?? 0,
    genres: genres.length > 0 ? genres : genreNames(m.genres),
    genre_ids: m.genre_ids,
    original_language: m.original_language,
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
    release_date: resolveReleaseDate(m),
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
    genre_ids: t.genre_ids,
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
        genre_ids: t.genre_ids,
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
      genre_ids: r.genre_ids,
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
      genre_ids: r.genre_ids,
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
      genre_ids: r.genre_ids,
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
      genre_ids: r.genre_ids,
    });
  }
  return null;
}
