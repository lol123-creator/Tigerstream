import Image from 'next/image';
import Link from 'next/link';
import { PpvPlayer } from '@/components/sports/PpvPlayer';
import {
  formatStreamTime,
  getPpvStreamById,
  isStreamLive,
} from '@/lib/ppv/service';
import { sportsCategoryHref, sportsHref } from '@/lib/routes';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const stream = await getPpvStreamById(Number(id));
  return { title: stream ? stream.name : 'Watch Sports' };
}

export default async function SportsWatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stream = await getPpvStreamById(Number(id));
  if (!stream) notFound();

  const live = isStreamLive(stream);

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-4">
          <Link
            href={sportsCategoryHref(stream.category_id)}
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← {stream.category_name}
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-white md:text-2xl">
            {stream.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/50">
            {live && (
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
                Live
              </span>
            )}
            <span>{stream.tag}</span>
            <span className="text-accent">{formatStreamTime(stream)}</span>
            {stream.viewers && Number(stream.viewers) > 0 && (
              <span>{stream.viewers} watching</span>
            )}
          </p>
        </div>

        <PpvPlayer stream={stream} />

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={sportsHref()}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-accent/50 hover:text-white"
          >
            All sports
          </Link>
          <a
            href="https://ppv.st/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-accent/50 hover:text-white"
          >
            ppv.st
          </a>
        </div>

        {stream.poster && (
          <div className="mt-8 hidden md:block">
            <div className="relative aspect-video max-w-md overflow-hidden rounded-lg opacity-40">
              <Image
                src={stream.poster}
                alt=""
                fill
                className="object-cover"
                sizes="400px"
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
