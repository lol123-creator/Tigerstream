import Link from 'next/link';
import { getMovieGenres, getTvGenres } from '@/lib/tmdb/service';
import { MOVIE_CURATED_GENRES, TV_CURATED_GENRES } from '@/lib/tmdb/genres';
import { getGenreIcon } from '@/lib/genreIcons';
import { ScrollReveal } from '@/components/ScrollReveal';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

export const metadata: Metadata = {
  title: 'Browse by Genre',
};

export const revalidate = 86400;

function GenreCard({
  href,
  name,
  index,
  curated = false,
}: {
  href: string;
  name: string;
  index: number;
  curated?: boolean;
}) {
  const icon = getGenreIcon(name);
  const style = { '--i': index } as CSSProperties;

  return (
    <Link
      href={href}
      style={style}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 sm:p-5 ${
        curated
          ? 'border-accent/20 bg-accent/[0.06] hover:border-accent/50 hover:bg-accent/[0.12] hover:shadow-glow'
          : 'border-white/10 bg-white/[0.03] hover:border-accent/40 hover:bg-white/[0.06] hover:shadow-glow'
      }`}
    >
      {/* faint glow that blooms in on hover, matches the ambient-glow used elsewhere */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/0 blur-2xl transition-all duration-300 group-hover:bg-accent/20"
      />
      <span className="relative text-2xl sm:text-3xl">{icon}</span>
      <span className="relative mt-4 text-sm font-medium leading-tight text-white/85 transition-colors group-hover:text-white sm:text-base">
        {name}
      </span>
    </Link>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{title}</h2>
      <span className="text-xs uppercase tracking-[0.2em] text-accent/70">{eyebrow}</span>
    </div>
  );
}

export default async function GenresPage() {
  const [movieGenres, tvGenres] = await Promise.all([
    getMovieGenres(),
    getTvGenres(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      {/* Hero */}
      <div className="relative mb-16 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center sm:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-ambient-glow opacity-80"
        />
        <p className="relative mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent/80">
          Explore
        </p>
        <h1 className="font-display relative bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
          Genres
        </h1>
        <p className="relative mx-auto mt-4 max-w-xl text-sm text-white/50 sm:text-base">
          Every mood, every world. Pick a genre and jump straight into movies or TV shows that fit it.
        </p>

        {/* quick jump */}
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2">
          <a
            href="#movie-genres"
            className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/70 transition hover:border-accent/50 hover:text-white"
          >
            🎬 Movies
          </a>
          <a
            href="#tv-genres"
            className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/70 transition hover:border-accent/50 hover:text-white"
          >
            📺 TV Shows
          </a>
        </div>
      </div>

      {/* Movie genres */}
      <section id="movie-genres" className="mb-20 scroll-mt-24">
        <SectionHeading eyebrow={`${movieGenres.length} genres`} title="Movie genres" />
        <ScrollReveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movieGenres.map((g, i) => (
            <GenreCard key={g.id} href={`/movies/genre/${g.id}`} name={g.name} index={i} />
          ))}
        </ScrollReveal>

        <div className="mb-4 mt-10 flex items-baseline gap-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-white/50">
            Curated collections
          </h3>
        </div>
        <ScrollReveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {MOVIE_CURATED_GENRES.map((g, i) => (
            <GenreCard key={g.id} href={`/movies/genre/${g.id}`} name={g.name} index={i} curated />
          ))}
        </ScrollReveal>
      </section>

      {/* TV genres */}
      <section id="tv-genres" className="scroll-mt-24">
        <SectionHeading eyebrow={`${tvGenres.length} genres`} title="TV genres" />
        <ScrollReveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {tvGenres.map((g, i) => (
            <GenreCard key={g.id} href={`/tv/genre/${g.id}`} name={g.name} index={i} />
          ))}
        </ScrollReveal>

        <div className="mb-4 mt-10 flex items-baseline gap-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-white/50">
            Curated collections
          </h3>
        </div>
        <ScrollReveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {TV_CURATED_GENRES.map((g, i) => (
            <GenreCard key={g.id} href={`/tv/genre/${g.id}`} name={g.name} index={i} curated />
          ))}
        </ScrollReveal>
      </section>
    </div>
  );
}
