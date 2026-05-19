import { GenreChips } from '@/components/GenreChips';
import { MediaGrid } from '@/components/MediaGrid';
import { getMovieGenreName } from '@/lib/tmdb/genres';
import { BROWSE_PAGE_COUNT, getMovieGenres, getMoviesByGenre } from '@/lib/tmdb/service';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const genreId = Number(id);
  return { title: `${getMovieGenreName(genreId)} Movies` };
}

export default async function MovieGenrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genreId = Number(id);
  if (!Number.isFinite(genreId)) notFound();

  const [genres, movies] = await Promise.all([
    getMovieGenres(),
    getMoviesByGenre(genreId, BROWSE_PAGE_COUNT),
  ]);

  const name = genres.find((g) => g.id === genreId)?.name ?? getMovieGenreName(genreId);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">{name} Movies</h1>
      <p className="mb-6 text-sm text-white/45">
        {movies.length} titles · scroll down to browse
      </p>
      <div className="sticky top-[4.25rem] z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <p className="mb-2 text-sm font-medium text-white/60">Switch genre</p>
        <GenreChips type="movie" genres={genres} activeId={genreId} />
      </div>
      <MediaGrid items={movies} />
    </div>
  );
}
