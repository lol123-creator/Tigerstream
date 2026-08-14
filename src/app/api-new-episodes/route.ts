import { NextResponse } from 'next/server';
import { getTvShowById } from '@/lib/tmdb/service';

interface ShowCheck {
  id: number;
  season: number;
  episode: number;
}

export async function POST(request: Request) {
  let body: { shows?: ShowCheck[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const shows = (body.shows ?? []).slice(0, 12); // bounded batch size

  const results = await Promise.all(
    shows.map(async (s) => {
      const show = await getTvShowById(s.id);
      if (!show) return { id: s.id, hasNew: false };

      const currentSeason = show.seasons.find((se) => se.season_number === s.season);
      const latestEpInCurrentSeason = currentSeason
        ? Math.max(0, ...currentSeason.episodes.map((e) => e.episode))
        : 0;
      const hasNewInSeason = latestEpInCurrentSeason > s.episode;
      const hasLaterSeason = show.seasons.some(
        (se) => se.season_number > s.season && se.episodes.length > 0,
      );

      return { id: s.id, hasNew: hasNewInSeason || hasLaterSeason };
    }),
  );

  return NextResponse.json({ results });
}
