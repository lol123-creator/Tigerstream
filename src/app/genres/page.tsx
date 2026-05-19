import Link from 'next/link';
import { getMovieGenres, getTvGenres } from '@/lib/tmdb/service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse by Genre',
};

export const revalidate = 86400;

export default async function GenresPage() {
  const [movieGenres, tvGenres] = await Promise.all([
    getMovieGenres(),
    getTvGenres(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="font-display mb-2 text-3xl font-bold">Genres</h1>
      <p className="mb-8 text-white/50">
        Pick a genre to browse movies or TV shows.
      </p>
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Movie genres</h2>
        <div className="flex flex-wrap gap-2">
          {movieGenres.map((g) => (
            <Link
              key={g.id}
              href={`/movies/genre/${g.id}`}
              className="rounded-full border border-white/15 bg-surface-card px-4 py-2 text-sm text-white/85 transition hover:border-accent/50 hover:bg-accent/10 hover:text-white"
            >
              {g.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">TV genres</h2>
        <div className="flex flex-wrap gap-2">
          {tvGenres.map((g) => (
            <Link
              key={g.id}
              href={`/tv/genre/${g.id}`}
              className="rounded-full border border-white/15 bg-surface-card px-4 py-2 text-sm text-white/85 transition hover:border-accent/50 hover:bg-accent/10 hover:text-white"
            >
              {g.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
