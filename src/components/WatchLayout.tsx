'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { PeachifyPlayer } from '@/components/PeachifyPlayer';
import { PLAYER_ACCENT } from '@/lib/brand';
import { buildContinueWatching } from '@/lib/progress-client';
import type { PeachifyEmbedTarget } from '@/peachify';

interface WatchLayoutProps {
  title: string;
  backHref: string;
  target: PeachifyEmbedTarget;
  nextHref?: string;
  nextLabel?: string;
}

export function WatchLayout({
  title,
  backHref,
  target,
  nextHref,
  nextLabel = 'Next episode',
}: WatchLayoutProps) {
  const router = useRouter();
  const [progressSynced, setProgressSynced] = useState(false);

  const onMediaData = useCallback(() => {
    setProgressSynced(true);
  }, []);

  const continueCount = progressSynced ? buildContinueWatching().length : 0;

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href={backHref}
              className="text-sm text-white/50 transition hover:text-white"
            >
              ← Back
            </Link>
            <h1 className="mt-1 text-xl font-semibold text-white md:text-2xl">
              {title}
            </h1>
          </div>
          {nextHref && (
            <Link
              href={nextHref}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              {nextLabel} →
            </Link>
          )}
        </div>

        <PeachifyPlayer
          target={{
            ...target,
            options: {
              accent: PLAYER_ACCENT,
              sub: 'English',
              quality: '1080',
              autoNext: target.type === 'tv',
              showNextBtn: true,
              ...target.options,
            },
          }}
          autoResume
          onMediaData={onMediaData}
          onPlayerEvent={(e) => {
            if (e.event === 'ended' && nextHref) {
              router.push(nextHref);
            }
          }}
          className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
        />

        {progressSynced && (
          <p className="mt-4 text-center text-xs text-white/30">
            {continueCount > 0
              ? 'Saved to Continue Watching on home'
              : 'Watch progress saved'}
          </p>
        )}
      </div>
    </div>
  );
}
