import { BrowseTitleList } from '@/components/BrowseTitleList';
import { GenreChips } from '@/components/GenreChips';
import { MediaGrid } from '@/components/MediaGrid';
import { Pagination } from '@/components/Pagination';
import { getTvGenreName } from '@/lib/tmdb/genres';
import { getTvByGenrePage, getTvGenres } from '@/lib/tmdb/service';
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
  return { title: `${getTvGenreName(genreId)} TV` };
}

export default async function TvGenrePage({
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
    getTvGenres(),
    getTvByGenrePage(genreId, currentPage),
  ]);

  const { items: shows, totalPages } = result;
  const name = genres.find((g) => g.id === genreId)?.name ?? getTvGenreName(genreId);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">{name}</h1>
      <p className="mb-6 text-sm text-white/45">
        Page {currentPage} of {totalPages} · scroll down to browse
      </p>
      <div className="sticky top-[4.25rem] z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <p className="mb-2 text-sm font-medium text-white/60">Switch genre</p>
        <GenreChips type="tv" genres={genres} activeId={genreId} />
      </div>
      <BrowseTitleList heading={`${name} TV Show Titles on This Page`} items={shows} />
      <MediaGrid items={shows} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={(p) => `/tv/genre/${genreId}?page=${p}`}
      />
    </div>
  );
}
