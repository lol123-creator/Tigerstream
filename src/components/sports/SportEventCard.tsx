import Image from 'next/image';
import Link from 'next/link';
import {
  formatStreamTime,
  isStreamLive,
} from '@/lib/ppv/service';
import { sportsWatchHref } from '@/lib/routes';
import type { PpvStream } from '@/types/sports';

interface SportEventCardProps {
  stream: PpvStream;
  variant?: 'row' | 'grid';
}

export function SportEventCard({ stream, variant = 'row' }: SportEventCardProps) {
  const live = isStreamLive(stream);
  const href = sportsWatchHref(stream.id);

  if (variant === 'grid') {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-lg bg-surface-card transition hover:ring-2 hover:ring-accent/40"
      >
        <div className="relative aspect-video">
          <Image
            src={stream.poster}
            alt={stream.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="320px"
            unoptimized
          />
          {live && (
            <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
              Live
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="line-clamp-2 font-medium text-white">{stream.name}</p>
          <p className="mt-1 text-xs text-white/50">{stream.category_name}</p>
          <p className="mt-1 text-xs text-accent">{formatStreamTime(stream)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex shrink-0 snap-start gap-4 overflow-hidden rounded-lg border border-white/10 bg-surface-card p-3 transition hover:border-accent/40 sm:w-[min(100%,420px)]"
    >
      <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-md">
        <Image
          src={stream.poster}
          alt={stream.name}
          fill
          className="object-cover"
          sizes="160px"
          unoptimized
        />
        {live && (
          <span className="absolute left-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase">
            Live
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 py-1">
        <p className="font-medium text-white group-hover:text-accent">{stream.name}</p>
        <p className="text-sm text-white/50">{stream.category_name}</p>
        <p className="mt-1 text-xs text-white/40">
          {stream.tag}
          {stream.viewers && Number(stream.viewers) > 0
            ? ` · ${stream.viewers} watching`
            : ''}
        </p>
        <p className="mt-1 text-xs text-accent">{formatStreamTime(stream)}</p>
      </div>
    </Link>
  );
}
