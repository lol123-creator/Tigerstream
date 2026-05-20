import { BrowseTitleList } from '@/components/BrowseTitleList';
import { GenreChips } from '@/components/GenreChips';
import { MediaGrid } from '@/components/MediaGrid';
import { Pagination } from '@/components/Pagination';
import { getMovieGenreName } from '@/lib/tmdb/genres';
import { getMovieGenres, getMoviesByGenrePage } from '@/lib/tmdb/service';
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const genreId = Number(id);
  if (!Number.isFinite(genreId)) notFound();

  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [genres, result] = await Promise.all([
    getMovieGenres(),
    getMoviesByGenrePage(genreId, currentPage),
  ]);

  const { items: movies, totalPages } = result;
  const name = genres.find((g) => g.id === genreId)?.name ?? getMovieGenreName(genreId);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">{name} Movies</h1>
      <p className="mb-6 text-sm text-white/45">
        Page {currentPage} of {totalPages} · scroll down to browse
      </p>
      <div className="sticky top-[4.25rem] z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <p className="mb-2 text-sm font-medium text-white/60">Switch genre</p>
        <GenreChips type="movie" genres={genres} activeId={genreId} />
      </div>
      <BrowseTitleList heading={`${name} Movie Titles on This Page`} items={movies} />
      <MediaGrid items={movies} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={(p) => `/movies/genre/${genreId}?page=${p}`}
      />
    </div>
  );
}
