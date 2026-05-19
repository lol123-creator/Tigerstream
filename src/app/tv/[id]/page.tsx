import { DetailHero } from '@/components/DetailHero';
import { EpisodeList } from '@/components/EpisodeList';
import { getTvShowById } from '@/lib/tmdb/service';
import { watchTvHref } from '@/lib/routes';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const show = await getTvShowById(Number(id));
  return { title: show?.title ?? 'TV Show' };
}

export default async function TvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const show = await getTvShowById(Number(id));
  if (!show) notFound();

  const firstSeason = show.seasons[0];
  const firstEp = firstSeason?.episodes[0];

  return (
    <>
      <DetailHero
        item={show}
        playLabel={
          firstEp
            ? `Watch S${firstEp.season} E${firstEp.episode}`
            : 'Watch S1 E1'
        }
        playHref={
          firstEp
            ? watchTvHref(show.id, firstEp.season, firstEp.episode)
            : watchTvHref(show.id, 1, 1)
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-lg font-semibold">Episodes</h2>
        {show.seasons.length > 0 ? (
          <EpisodeList show={show} />
        ) : (
          <p className="text-white/50">Episode list loading failed — use Watch from the hero.</p>
        )}
      </div>
    </>
  );
}
