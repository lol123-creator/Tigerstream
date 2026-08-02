import { BrowseTitleList } from '@/components/BrowseTitleList';
import { GenreChips } from '@/components/GenreChips';
import { MediaGrid } from '@/components/MediaGrid';
import { Pagination } from '@/components/Pagination';
import { getMovieGenreName } from '@/lib/tmdb/genres';
import { MOVIE_CURATED_GENRES } from '@/lib/tmdb/genres';
import { getMovieGenres, getMoviesByGenrePage } from '@/lib/tmdb/service';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `${getMovieGenreName(id)} Movies` };
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

  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [genres, result] = await Promise.all([
    getMovieGenres(),
    getMoviesByGenrePage(id, currentPage),
  ]);

  const { items: movies, totalPages } = result;
  const allGenres = [...genres, ...MOVIE_CURATED_GENRES];
  const name = allGenres.find((g) => String(g.id) === id)?.name ?? getMovieGenreName(id);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">{name} Movies</h1>
      <p className="mb-6 text-sm text-ink-3">
        Page {currentPage} of {totalPages} · scroll down to browse
      </p>
      {/* top-16 matches the navbar's fixed h-16 exactly, and the
          lighter/blurred background reads as frosted glass instead of
          a solid bar - this page had never gotten the same fix applied
          to the main /movies "All" view, so switching to a specific
          genre reverted to the old gap + opaque bar. */}
      <div className="sticky top-16 z-40 -mx-4 mb-8 border-b border-glass-border bg-surface/35 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <p className="mb-2 text-sm font-medium text-ink-2">Switch genre</p>
        <GenreChips type="movie" genres={allGenres} activeId={id} />
      </div>
      <BrowseTitleList heading={`${name} Movie Titles on This Page`} items={movies} />
      <MediaGrid items={movies} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={(p) => `/movies/genre/${id}?page=${p}`}
      />
    </div>
  );
}
