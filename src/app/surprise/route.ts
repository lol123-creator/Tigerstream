import { NextResponse } from 'next/server';
import { getTrendingToday, getPopularMovies } from '@/lib/tmdb/service';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';

export async function GET(request: Request) {
  let items = await getTrendingToday();
  if (items.length === 0) {
    // Fallback if trending is empty for some reason (TMDB hiccup, etc.)
    items = await getPopularMovies(1);
  }
  if (items.length === 0) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const pick = items[Math.floor(Math.random() * items.length)];
  const href =
    pick.type === 'movie' ? movieDetailHref(pick.id) : tvDetailHref(pick.id);

  return NextResponse.redirect(new URL(href, request.url));
}
