import { SportEventCard } from '@/components/sports/SportEventCard';
import { SportsCategoryNav } from '@/components/sports/SportsCategoryNav';
import {
  getPpvCategories,
  getPpvCategory,
  isStreamLive,
  isStreamUpcoming,
} from '@/lib/ppv/service';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = await getPpvCategory(Number(id));
  return { title: category ? category.category : 'Sports' };
}

export default async function SportsCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);
  const [categories, category] = await Promise.all([
    getPpvCategories(),
    getPpvCategory(categoryId),
  ]);

  if (!category) notFound();

  const streams = [...category.streams].sort((a, b) => {
    const score = (s: typeof a) => {
      if (isStreamLive(s)) return 0;
      if (isStreamUpcoming(s)) return 1;
      return 2;
    };
    const diff = score(a) - score(b);
    if (diff !== 0) return diff;
    return a.starts_at - b.starts_at;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">{category.category}</h1>
      <p className="mb-6 text-sm text-white/45">{streams.length} events</p>

      <div className="sticky top-[4.25rem] z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <SportsCategoryNav categories={categories} activeId={categoryId} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {streams.map((stream) => (
          <SportEventCard key={stream.id} stream={stream} variant="grid" />
        ))}
      </div>
    </div>
  );
}
