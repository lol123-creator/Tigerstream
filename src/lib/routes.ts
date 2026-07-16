export function watchMovieHref(id: number): string {
  return `/watch/movie/${id}`;
}

export function watchTvHref(id: number, season: number, episode: number): string {
  return `/watch/tv/${id}/${season}/${episode}`;
}

export function movieDetailHref(id: number): string {
  return `/movie/${id}`;
}

export function tvDetailHref(id: number): string {
  return `/tv/${id}`;
}

export function personDetailHref(id: number): string {
  return `/person/${id}`;
}

export function sportsHref(): string {
  return '/sports';
}

export function sportsCategoryHref(categoryId: number): string {
  return `/sports/category/${categoryId}`;
}

export function sportsWatchHref(streamId: number): string {
  return `/sports/watch/${streamId}`;
}
