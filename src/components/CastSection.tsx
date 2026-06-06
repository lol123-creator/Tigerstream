'use client';

import Image from 'next/image';
import type { Cast } from '@/types/media';
import { tmdbImage } from '@/lib/tmdb-images';

interface CastSectionProps {
  cast: Cast[] | undefined;
}

export function CastSection({ cast }: CastSectionProps) {
  if (!cast || cast.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-lg font-semibold">Cast</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {cast.map((actor) => (
          <div
            key={`${actor.name}-${actor.character}`}
            className="overflow-hidden rounded-lg bg-white/5 transition hover:bg-white/10"
          >
            {actor.profile_path ? (
              <div className="relative h-40 w-full">
                <Image
                  src={tmdbImage(actor.profile_path, 'w185')}
                  alt={actor.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-white/5 text-white/40 text-center text-sm">
                No Image
              </div>
            )}
            <div className="p-3">
              <p className="truncate text-sm font-medium text-white">
                {actor.name}
              </p>
              <p className="truncate text-xs text-white/50">{actor.character}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
