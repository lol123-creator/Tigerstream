import { WatchLayout } from '@/components/WatchLayout';
import { getMovieById } from '@/lib/tmdb/service';
import { movieDetailHref } from '@/lib/routes';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieById(Number(id));
  return { title: movie ? `Watch ${movie.title}` : 'Watch' };
}

export default async function WatchMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovieById(Number(id));
  if (!movie) notFound();

  return (
    <WatchLayout
      title={movie.title}
      backHref={movieDetailHref(movie.id)}
      posterPath={movie.poster_path}
      target={{
        type: 'movie',
        mediaId: movie.id,
      }}
    />
  );
}
