import { GenreChips } from '@/components/GenreChips';
import { MediaGrid } from '@/components/MediaGrid';
import { getTvGenreName } from '@/lib/tmdb/genres';
import { BROWSE_PAGE_COUNT, getTvByGenre, getTvGenres } from '@/lib/tmdb/service';
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genreId = Number(id);
  if (!Number.isFinite(genreId)) notFound();

  const [genres, shows] = await Promise.all([
    getTvGenres(),
    getTvByGenre(genreId, BROWSE_PAGE_COUNT),
  ]);

  const name = genres.find((g) => g.id === genreId)?.name ?? getTvGenreName(genreId);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">{name}</h1>
      <p className="mb-6 text-sm text-white/45">
        {shows.length} series · scroll down to browse
      </p>
      <div className="sticky top-[4.25rem] z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <p className="mb-2 text-sm font-medium text-white/60">Switch genre</p>
        <GenreChips type="tv" genres={genres} activeId={genreId} />
      </div>
      <MediaGrid items={shows} />
    </div>
  );
}
