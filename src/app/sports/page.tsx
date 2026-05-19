import { SportEventCard } from '@/components/sports/SportEventCard';
import { SportsCategoryNav } from '@/components/sports/SportsCategoryNav';
import {
  getAllPpvStreams,
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

function sortStreams<T extends { starts_at: number }>(
  streams: T[],
  live: (s: T) => boolean,
  upcoming: (s: T) => boolean,
): T[] {
  return [...streams].sort((a, b) => {
    const score = (s: T) => {
      if (live(s)) return 0;
      if (upcoming(s)) return 1;
      return 2;
    };
    const diff = score(a) - score(b);
    if (diff !== 0) return diff;
    return a.starts_at - b.starts_at;
  });
}

export default async function SportsPage() {
  const [categories, allStreams] = await Promise.all([
    getPpvCategories(),
    getAllPpvStreams(),
  ]);

  const streams = sortStreams(allStreams, isStreamLive, isStreamUpcoming);
  const liveCount = streams.filter(isStreamLive).length;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">Sports</h1>
      <p className="mb-2 text-sm text-white/45">
        Live and upcoming events from ppv.to — {streams.length} streams
        {liveCount > 0 ? ` · ${liveCount} live now` : ''}
      </p>
      <p className="mb-6 text-xs text-white/30">
        Schedules refresh every minute. Pick a category or event below to watch.
      </p>

      <div className="sticky top-[4.25rem] z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <SportsCategoryNav categories={categories} />
      </div>

      {streams.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-surface-card p-8 text-center text-white/50">
          No sports streams available right now. Check back soon.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream) => (
            <SportEventCard key={stream.id} stream={stream} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
