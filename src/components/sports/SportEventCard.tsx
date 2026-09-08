import Image from 'next/image';
import Link from 'next/link';
import {
  formatStreamTime,
  isStreamLive,
  isStreamUpcoming,
} from '@/lib/ppv/service';
import { sportsWatchHref } from '@/lib/routes';
import { EventCountdown } from '@/components/sports/EventCountdown';
import type { PpvStream } from '@/types/sports';

interface SportEventCardProps {
  stream: PpvStream;
  variant?: 'row' | 'grid';
}

function LiveBadge() {
  return (
    <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-sm">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      Live
    </span>
  );
}

function ViewerCount({ viewers }: { viewers?: string }) {
  if (!viewers || Number(viewers) <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {viewers}
    </span>
  );
}

/** Live-ticking countdown for an upcoming event, static text otherwise
 *  (live now, ended, or 24/7) - matching formatStreamTime's own
 *  fallback logic exactly so nothing regresses for those cases. */
function StreamTime({ stream }: { stream: PpvStream }) {
  const live = isStreamLive(stream);
  const upcoming = isStreamUpcoming(stream);

  if (upcoming && stream.starts_at && stream.always_live !== 1) {
    return (
      <p className="mt-1 text-xs font-medium text-accent">
        <EventCountdown startsAt={stream.starts_at} />
      </p>
    );
  }

  return (
    <p className={`mt-1 text-xs font-medium ${live ? 'text-red-400' : 'text-accent'}`}>
      {formatStreamTime(stream)}
    </p>
  );
}

export function SportEventCard({ stream, variant = 'row' }: SportEventCardProps) {
  const live = isStreamLive(stream);
  const href = sportsWatchHref(stream.id);

  if (variant === 'grid') {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-2xl bg-surface-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glow-lg hover:ring-1 hover:ring-accent/30"
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={stream.poster}
            alt={stream.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="320px"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {live && <LiveBadge />}
          {/* Play affordance, consistent with MediaCard's hover treatment */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="flex h-11 w-11 scale-75 items-center justify-center rounded-full bg-accent/90 shadow-glow transition-transform duration-300 group-hover:scale-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A1F2B" className="translate-x-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-medium text-white">{stream.name}</p>
          <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-white/45">
            <span className="truncate">{stream.category_name}</span>
            <ViewerCount viewers={stream.viewers} />
          </div>
          <StreamTime stream={stream} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex shrink-0 snap-start gap-4 overflow-hidden rounded-2xl border border-white/10 bg-surface-card p-3 transition-all duration-200 hover:border-accent/30 hover:bg-white/[0.02] sm:w-[min(100%,420px)]"
    >
      <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={stream.poster}
          alt={stream.name}
          fill
          className="object-cover"
          sizes="160px"
          unoptimized
        />
        {live && <LiveBadge />}
      </div>
      <div className="min-w-0 flex-1 py-1">
        <p className="font-medium text-white transition group-hover:text-accent">{stream.name}</p>
        <p className="text-sm text-white/50">{stream.category_name}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
          <span>{stream.tag}</span>
          <ViewerCount viewers={stream.viewers} />
        </div>
        <StreamTime stream={stream} />
      </div>
    </Link>
  );
}
