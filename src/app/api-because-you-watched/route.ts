import { NextResponse } from 'next/server';
import { getSimilarMovies, getSimilarTv, getMovieById, getTvShowById } from '@/lib/tmdb/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  const type = searchParams.get('type');

  if (!id || (type !== 'movie' && type !== 'tv')) {
    return NextResponse.json({ error: 'invalid params' }, { status: 400 });
  }

  const [source, items] =
    type === 'movie'
      ? await Promise.all([getMovieById(id), getSimilarMovies(id, 14)])
      : await Promise.all([getTvShowById(id), getSimilarTv(id, 14)]);

  if (!source) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({
    sourceTitle: source.title,
    items,
  });
}
