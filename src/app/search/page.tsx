import { MediaCard } from '@/components/MediaCard';
import { TmdbSetupBanner } from '@/components/TmdbSetupBanner';
import { searchMedia } from '@/lib/tmdb/service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = await searchMedia(query);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">Search</h1>
      <TmdbSetupBanner />
      {query ? (
        <p className="mb-8 text-white/50">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}
          &rdquo;
        </p>
      ) : (
        <p className="mb-8 text-white/50">Enter a search term in the navigation bar.</p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((item) => (
            <div key={`${item.type}-${item.id}`} className="w-full">
              <MediaCard item={item} variant="grid" />
            </div>
          ))}
        </div>
      ) : query ? (
        <p className="text-white/40">No titles matched your search.</p>
      ) : null}
    </div>
  );
}
