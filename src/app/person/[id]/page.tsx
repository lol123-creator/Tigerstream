import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BackButton } from '@/components/BackButton';
import { MediaRow } from '@/components/MediaRow';
import { tmdbImage } from '@/lib/tmdb-images';
import { getPersonById, getPersonCredits } from '@/lib/tmdb/service';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = await getPersonById(Number(id));
  if (!person) return { title: 'Person' };
  return {
    title: person.name,
    description: person.biography
      ? person.biography.slice(0, 160)
      : `${person.name} on TigerStream`,
  };
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personId = Number(id);

  const [person, credits] = await Promise.all([
    getPersonById(personId),
    getPersonCredits(personId),
  ]);

  if (!person) notFound();

  const born = formatDate(person.birthday);
  const died = formatDate(person.deathday);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <BackButton />

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="relative mx-auto h-56 w-56 shrink-0 overflow-hidden rounded-2xl bg-surface-card ring-1 ring-white/10 sm:mx-0">
          {person.profile_path ? (
            <Image
              src={tmdbImage(person.profile_path, 'w500')}
              alt={person.name}
              fill
              className="object-cover"
              sizes="224px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-white/20">
              {person.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            {person.name}
          </h1>
          {person.known_for_department && (
            <p className="mt-1 text-sm text-accent">{person.known_for_department}</p>
          )}

          <dl className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm sm:justify-start">
            {born && (
              <div>
                <dt className="text-white/40">{died ? 'Born' : 'Birthday'}</dt>
                <dd className="text-white/80">{born}</dd>
              </div>
            )}
            {died && (
              <div>
                <dt className="text-white/40">Died</dt>
                <dd className="text-white/80">{died}</dd>
              </div>
            )}
            {person.place_of_birth && (
              <div>
                <dt className="text-white/40">Place of Birth</dt>
                <dd className="text-white/80">{person.place_of_birth}</dd>
              </div>
            )}
          </dl>

          {person.biography && (
            <div className="mt-5">
              <h2 className="mb-2 text-sm font-semibold text-white/60">Biography</h2>
              <p className="max-w-3xl text-sm leading-relaxed text-white/70 line-clamp-[10]">
                {person.biography}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 space-y-10">
        {credits.movies.length > 0 && (
          <MediaRow title="Movies" items={credits.movies.slice(0, 20)} />
        )}
        {credits.tvShows.length > 0 && (
          <MediaRow title="TV Shows" items={credits.tvShows.slice(0, 20)} />
        )}
        {credits.movies.length === 0 && credits.tvShows.length === 0 && (
          <p className="text-sm text-white/40">No filmography available.</p>
        )}
      </div>
    </div>
  );
}
