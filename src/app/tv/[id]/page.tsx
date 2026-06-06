import { DetailHero } from '@/components/DetailHero';
import { CastSection } from '@/components/CastSection';
import { EpisodeList } from '@/components/EpisodeList';
import { QualityBadge } from '@/components/QualityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { getTvShowById } from '@/lib/tmdb/service';
import { watchTvHref } from '@/lib/routes';
import { isComingSoon } from '@/lib/release-checker';
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
  const comingSoon = isComingSoon(show);

  return (
    <>
      <DetailHero
        item={show}
        playLabel={
          comingSoon
            ? 'Coming Soon'
            : firstEp
              ? `Watch S${firstEp.season} E${firstEp.episode}`
              : 'Watch S1 E1'
        }
        playHref={
          comingSoon
            ? undefined
            : firstEp
              ? watchTvHref(show.id, firstEp.season, firstEp.episode)
              : watchTvHref(show.id, 1, 1)
        }
        disablePlay={comingSoon}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <StatusBadge media={show} />
          <QualityBadge media={show} />
        </div>

        <h2 className="mb-6 text-lg font-semibold">Episodes</h2>
        {show.seasons.length > 0 ? (
          <EpisodeList show={show} />
        ) : (
          <p className="text-white/50">
            Episode list loading failed - use Watch from the hero.
          </p>
        )}

        <CastSection cast={show.cast} />
      </div>
    </>
  );
}
