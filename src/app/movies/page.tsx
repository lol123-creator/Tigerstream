import { BrowseTitleList } from '@/components/BrowseTitleList';
import { GenreChips } from '@/components/GenreChips';
import { MediaGrid } from '@/components/MediaGrid';
import { Pagination } from '@/components/Pagination';
import {
  getMovieGenres,
  getPopularMoviesPage,
} from '@/lib/tmdb/service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movies',
};

export const dynamic = 'force-dynamic';

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [genres, result] = await Promise.all([
    getMovieGenres(),
    getPopularMoviesPage(currentPage),
  ]);

  const { items: movies, totalPages } = result;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">Movies</h1>
      <p className="mb-6 text-sm text-white/45">
        Page {currentPage} of {totalPages} — browse all movies below
      </p>

      {/* top-16 matches the navbar's fixed h-16 exactly, so this sits
          flush underneath it with no gap and no overlap */}
      <div className="sticky top-16 z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <p className="mb-3 text-sm font-medium text-white/60">Browse by genre</p>
        <GenreChips type="movie" genres={genres} />
      </div>

      <BrowseTitleList heading="Movie Titles on This Page" items={movies} />
      <MediaGrid items={movies} priorityCount={18} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={(p) => `/movies?page=${p}`}
      />
    </div>
  );
}
