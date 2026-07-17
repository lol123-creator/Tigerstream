import Image from 'next/image';
import Link from 'next/link';
import { ScrollRow } from '@/components/ScrollRow';
import { tmdbImage } from '@/lib/tmdb-images';
import { personDetailHref } from '@/lib/routes';
import type { Cast } from '@/types/media';

interface CastSectionProps {
  cast?: Cast[];
}

export function CastSection({ cast }: CastSectionProps) {
  if (!cast || cast.length === 0) return null;

  return (
    // Reuses ScrollRow so cast scrolls the same way every other row on
    // the site does (click-drag + arrow buttons) instead of being a
    // plain overflow-x-auto div with no drag support, which just felt
    // broken next to everything else.
    <ScrollRow title="Cast" className="mt-10 mb-0">
      {cast.map((member) => (
        <Link
          key={member.id ?? member.name}
          href={member.id ? personDetailHref(member.id) : '#'}
          className={`group w-24 shrink-0 snap-start text-center sm:w-28 ${
            member.id ? '' : 'pointer-events-none'
          }`}
        >
          <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-surface-card ring-1 ring-white/10 transition group-hover:ring-accent/50 sm:h-28 sm:w-28">
            {member.profile_path ? (
              <Image
                src={tmdbImage(member.profile_path, 'w185')}
                alt={member.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white/20">
                {member.name.charAt(0)}
              </div>
            )}
          </div>
          <p className="mt-2 truncate text-xs font-medium text-white/85 transition group-hover:text-accent">
            {member.name}
          </p>
          <p className="truncate text-[11px] text-white/40">{member.character}</p>
        </Link>
      ))}
    </ScrollRow>
  );
}
