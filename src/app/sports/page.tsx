import { SportEventCard } from '@/components/sports/SportEventCard';
import { SportsCategoryNav } from '@/components/sports/SportsCategoryNav';
import { SportsHero } from '@/components/sports/SportsHero';
import {
  getAllPpvStreams,
  getFeaturedSport,
  getPpvCategories,
  isStreamLive,
  isStreamUpcoming,
} from '@/lib/ppv/service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sports',
  description: 'Watch live sports streams — football, basketball, MMA, and more.',
};

export const revalidate = 60;

function sortByStart<T extends { starts_at: number }>(streams: T[]): T[] {
  return [...streams].sort((a, b) => a.starts_at - b.starts_at);
}

export default async function SportsPage() {
  const [categories, allStreams, featured] = await Promise.all([
    getPpvCategories(),
    getAllPpvStreams(),
    getFeaturedSport(),
  ]);

  const live = sortByStart(allStreams.filter(isStreamLive));
  const upcoming = sortByStart(allStreams.filter(isStreamUpcoming));
  const ended = allStreams.filter((s) => !isStreamLive(s) && !isStreamUpcoming(s));

  return (
    <div className="pb-16">
      {featured && <SportsHero stream={featured} />}

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold">Sports</h1>
          {live.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              {live.length} live now
            </span>
          )}
        </div>
        <p className="mb-6 text-sm text-white/45">
          Live and upcoming events from ppv.is — schedules refresh every minute.
        </p>

        {/* top-16 matches the navbar's fixed h-16 exactly, and the
            lighter/blurred background reads as frosted glass instead of
            a solid bar. */}
        <div className="sticky top-16 z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/35 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <SportsCategoryNav categories={categories} />
        </div>

        {allStreams.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-surface-card p-8 text-center text-white/50">
            No sports streams available right now. Check back soon.
          </p>
        ) : (
          <div className="space-y-12">
            {live.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  Live Now
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {live.map((stream) => (
                    <SportEventCard key={stream.id} stream={stream} variant="grid" />
                  ))}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold text-white">Upcoming</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((stream) => (
                    <SportEventCard key={stream.id} stream={stream} variant="grid" />
                  ))}
                </div>
              </section>
            )}

            {ended.length > 0 && (
              <section className="opacity-60">
                <h2 className="mb-4 text-lg font-semibold text-white/60">Recently Ended</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ended.slice(0, 6).map((stream) => (
                    <SportEventCard key={stream.id} stream={stream} variant="grid" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
