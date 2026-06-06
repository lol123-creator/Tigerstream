import { NextRequest, NextResponse } from 'next/server';
import { searchMedia } from '@/lib/tmdb/service';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);
  const results = await searchMedia(q);
  const items = results.slice(0, 8).map((m) => ({
    id: m.id, type: m.type, title: m.title,
    poster_path: m.poster_path,
    release_date: 'release_date' in m ? m.release_date : undefined,
    first_air_date: 'first_air_date' in m ? m.first_air_date : undefined,
  }));
  return NextResponse.json(items);
}