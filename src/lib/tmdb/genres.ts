/** TMDB genre ids — https://developer.themoviedb.org/reference/genre-movie-list */

export interface Genre {
  id: number | string;
  name: string;
}

export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

/** Curated movie genre combinations (multi-genre IDs). */
export const MOVIE_CURATED_GENRES: Genre[] = [
  { id: '28,12', name: 'Superhero' },
  { id: '35,10749', name: 'Romantic Comedy' },
  { id: '28,27', name: 'Action Horror' },
  { id: '53,9648', name: 'Psychological Thriller' },
  { id: '878,53', name: 'Sci-Fi Thriller' },
  { id: '10752,18', name: 'War Drama' },
  { id: '14,12', name: 'Fantasy Adventure' },
  { id: '18,35', name: 'Coming of Age' },
  { id: '80,28', name: 'Heist' },
  { id: '35,80', name: 'Dark Comedy' },
  { id: '27,14', name: 'Monster' },
  { id: '18,80', name: 'Courtroom Drama' },
  { id: '27,53', name: 'Slasher' },
  { id: '27,878', name: 'Body Horror' },
  { id: '12,53', name: 'Survival' },
  { id: '12,36,18', name: 'Epic' },
  { id: '18,36', name: 'Biopic' },
  { id: '878,14', name: 'Space Opera' },
  { id: '28,53', name: 'Action Thriller' },
  { id: '14,27', name: 'Dark Fantasy' },
  { id: '35,16', name: 'Animated Comedy' },
  { id: '18,10749', name: 'Romantic Drama' },
  { id: '80,53', name: 'Crime Thriller' },
  { id: '12,14', name: 'Fairy Tale' },
  { id: '28,878', name: 'Sci-Fi Action' },
  { id: '16,10751', name: 'Family Animation' },
  { id: '18,9648', name: 'Mystery Drama' },
  { id: '10402,18', name: 'Musical Drama' },
];

export const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

/** Curated TV genre combinations (multi-genre IDs). */
export const TV_CURATED_GENRES: Genre[] = [
  /** NOTE: TMDB has no Horror (27) for TV - it's movie-only. Horror TV shows use Sci-Fi & Fantasy (10765), Mystery (9648), Drama (18), Crime (80), Action & Adventure (10759). */
  { id: '10765,9648', name: 'Horror TV' },
  { id: '80,9648', name: 'True Crime' },
  { id: '10765,18', name: 'Supernatural' },
  { id: '18,10768', name: 'Political Drama' },
  { id: '16,35', name: 'Animated Comedy' },
  { id: '10751,10759', name: 'Family Adventure' },
  { id: '18,80', name: 'Legal Drama' },
  { id: '10768,18', name: 'War Drama' },
  { id: '80,9648,18', name: 'Crime Mystery' },
  { id: '10765,10759', name: 'Sci-Fi Adventure' },
  { id: '9648,80', name: 'Mystery Thriller' },
  { id: '10765,16', name: 'Fantasy Quest' },
  { id: '10765,9648,18', name: 'Horror Mystery' },
  { id: '18,10751', name: 'Family Drama' },
  { id: '10759,9648', name: 'Horror Adventure' },
  { id: '35,9648', name: 'Horror Comedy' },
  { id: '10765,80', name: 'Sci-Fi Horror' },
  { id: '10759,80', name: 'Action Crime' },
  { id: '10759,35', name: 'Action Comedy' },
  { id: '35,18', name: 'Dramedy' },
  { id: '10765,35', name: 'Sci-Fi Comedy' },
  { id: '80,18', name: 'Crime Drama' },
  { id: '16,10751', name: 'Animated Family' },
  { id: '37,18', name: 'Western Drama' },
];

export function getMovieGenreName(id: number | string): string {
  const numId = Number(id);
  if (Number.isFinite(numId)) {
    return MOVIE_GENRES.find((g) => g.id === numId)?.name ?? 'Movies';
  }
  return MOVIE_CURATED_GENRES.find((g) => g.id === id)?.name ?? 'Movies';
}

export function getTvGenreName(id: number | string): string {
  const numId = Number(id);
  if (Number.isFinite(numId)) {
    return TV_GENRES.find((g) => g.id === numId)?.name ?? 'TV Shows';
  }
  return TV_CURATED_GENRES.find((g) => g.id === id)?.name ?? 'TV Shows';
}
