import Image from 'next/image';
import Link from 'next/link';
import { formatStreamTime, isStreamLive } from '@/lib/ppv/service';
import { sportsWatchHref } from '@/lib/routes';
import type { PpvStream } from '@/types/sports';

interface SportsHeroProps {
  stream: PpvStream;
}

export function SportsHero({ stream }: SportsHeroProps) {
  const live = isStreamLive(stream);

  return (
    <section className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-surface-card sm:h-[50vh] md:h-[56vh]">
      <div className="pointer-events-none absolute inset-0 bg-ambient-glow" />
      <Image
        src={stream.poster}
        alt=""
        fill
        priority
        unoptimized
        className="object-cover object-top"
        style={{
          filter: 'saturate(1.7) contrast(1.2) brightness(1.08)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
        }}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-hero-gradient" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, #242124 0%, rgba(36,33,36,0.6) 22%, rgba(36,33,36,0.15) 42%, transparent 58%)',
        }}
      />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6">
        {live ? (
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Live Now
          </span>
        ) : (
          <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            Up Next
          </span>
        )}

        <h1 className="font-display max-w-3xl text-3xl font-semibold leading-[1.1] text-white md:text-5xl">
          {stream.name}
        </h1>
        <p className="mt-2 text-sm text-white/60 md:text-base">
          {stream.category_name} · {formatStreamTime(stream)}
          {stream.viewers && Number(stream.viewers) > 0 && (
            <> · {stream.viewers} watching</>
          )}
        </p>

        <div className="mt-6">
          <Link
            href={sportsWatchHref(stream.id)}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-[#0A1F2B] shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:shadow-glow-lg hover:scale-[1.02] active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {live ? 'Watch Live' : 'View Event'}
          </Link>
        </div>
      </div>
    </section>
  );
}
