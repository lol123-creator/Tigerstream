import { WatchLayout } from '@/components/WatchLayout';
import { getWatchTvContext } from '@/lib/tmdb/service';
import { tvDetailHref, watchTvHref } from '@/lib/routes';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; season: string; episode: string }>;
}): Promise<Metadata> {
  const { id, season, episode } = await params;
  const ctx = await getWatchTvContext(Number(id), Number(season), Number(episode));
  if (!ctx) return { title: 'Watch' };
  return {
    title: `Watch ${ctx.showTitle} S${season}E${episode}`,
  };
}

export default async function WatchTvPage({
  params,
}: {
  params: Promise<{ id: string; season: string; episode: string }>;
}) {
  const { id, season: s, episode: e } = await params;
  const showId = Number(id);
  const season = Number(s);
  const episode = Number(e);

  if (!Number.isFinite(showId) || !Number.isFinite(season) || !Number.isFinite(episode)) {
    notFound();
  }

  const ctx = await getWatchTvContext(showId, season, episode);
  if (!ctx) notFound();

  const title = `${ctx.showTitle} · S${season}E${episode} — ${ctx.episodeTitle}`;

  return (
    <WatchLayout
      title={title}
      backHref={tvDetailHref(showId)}
      posterPath={ctx.posterPath}
      target={{
        type: 'tv',
        mediaId: showId,
        season,
        episode,
      }}
      nextHref={
        ctx.next
          ? watchTvHref(showId, ctx.next.season, ctx.next.episode)
          : undefined
      }
      nextLabel={ctx.next ? `Next: ${ctx.next.title}` : undefined}
    />
  );
}
