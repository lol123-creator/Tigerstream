import { DetailHero } from '@/components/DetailHero';
import { CastSection } from '@/components/CastSection';
import { BackButton } from '@/components/BackButton';
import { QualityBadge } from '@/components/QualityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { getMovieById } from '@/lib/tmdb/service';
import { watchMovieHref } from '@/lib/routes';
import { isComingSoon } from '@/lib/release-checker';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieById(Number(id));
  return { title: movie?.title ?? 'Movie' };
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Use the shared TMDB service so we get the same fallback handling,
  // normalized `Movie` shape, and consistent error handling as the TV page.
  const movie = await getMovieById(Number(id));

  if (!movie) notFound();

  const comingSoon = isComingSoon(movie);

  // All of these fields are normalized by `mapMovieDetail` to safe defaults
  // (empty string / 0 / []), but we still guard the display values so a
  // partial response (e.g. a new title with no rating yet) never crashes
  // the page with "Cannot read properties of undefined".
  const rating =
    typeof movie.vote_average === 'number' && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : '—';
  const runtime =
    typeof movie.runtime === 'number' && movie.runtime > 0
      ? `${movie.runtime} min`
      : '—';
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString()
    : '—';
  const genresText = movie.genres?.length ? movie.genres.join(', ') : '—';

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <BackButton />
      </div>
      <DetailHero
        item={movie}
        playLabel={comingSoon ? 'Coming Soon' : 'Watch Movie'}
        playHref={comingSoon ? undefined : watchMovieHref(movie.id)}
        disablePlay={comingSoon}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <StatusBadge media={movie} />
          <QualityBadge media={movie} />
        </div>

        <h2 className="mb-3 text-lg font-semibold">About</h2>
        <p className="leading-relaxed text-white/70">
          {movie.overview || 'No overview available.'}
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-white/40">Released</dt>
            <dd>{releaseDate}</dd>
          </div>
          <div>
            <dt className="text-white/40">Runtime</dt>
            <dd>{runtime}</dd>
          </div>
          <div>
            <dt className="text-white/40">Rating</dt>
            <dd>{rating} / 10</dd>
          </div>
          <div>
            <dt className="text-white/40">Genres</dt>
            <dd>{genresText}</dd>
          </div>
        </dl>

        {/* CastSection already handles undefined / empty cast gracefully */}
        <CastSection cast={movie.cast} />
      </div>
    </>
  );
}
