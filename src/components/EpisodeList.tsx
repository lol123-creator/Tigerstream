'use client';

import Link from 'next/link';
import { watchTvHref } from '@/lib/routes';
import type { Season, TvShow } from '@/types/media';

interface EpisodeListProps {
  show: TvShow;
  activeSeason?: number;
  activeEpisode?: number;
}

export function EpisodeList({
  show,
  activeSeason = 1,
  activeEpisode = 1,
}: EpisodeListProps) {
  return (
    <div className="space-y-8">
      {show.seasons.map((season: Season) => (
        <div key={season.season_number}>
          <h3 className="mb-3 text-lg font-semibold text-white">
            {season.name}
            <span className="ml-2 text-sm font-normal text-white/45">
              {season.episode_count} episodes
            </span>
          </h3>
          <ul className="space-y-2">
            {season.episodes.map((ep) => {
              const isActive =
                season.season_number === activeSeason &&
                ep.episode === activeEpisode;
              return (
                <li key={`${ep.season}-${ep.episode}`}>
                  <Link
                    href={watchTvHref(show.id, ep.season, ep.episode)}
                    className={`flex gap-4 rounded-lg border p-4 transition ${
                      isActive
                        ? 'border-accent/50 bg-accent/10'
                        : 'border-white/5 bg-surface-card hover:border-white/15 hover:bg-surface-raised'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isActive ? 'bg-accent text-white' : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {ep.episode}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{ep.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/50">
                        {ep.overview}
                      </p>
                      <p className="mt-1 text-xs text-white/35">{ep.runtime} min</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
