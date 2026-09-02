import { NextResponse } from 'next/server';

/**
 * Lazy trailer-key lookup for MediaCard's hover preview. Deliberately
 * NOT baked into the list/grid endpoints in service.ts - those don't
 * request video data at all today, and adding it there would mean
 * every single browse/row response carries video data for items
 * almost nobody hovers long enough to trigger a preview for. This
 * fetches on demand, only for a card someone's actually hovering.
 */
export const revalidate = 86400; // trailers essentially never change once posted

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  const type = searchParams.get('type');

  if (!id || (type !== 'movie' && type !== 'tv')) {
    return NextResponse.json({ error: 'invalid params' }, { status: 400 });
  }

  const key = process.env.TMDB_API_KEY;
  if (!key) return NextResponse.json({ key: null });

  try {
    const url = `https://api.themoviedb.org/3/${type}/${id}/videos`;
    const res = await fetch(key.startsWith('eyJ') ? url : `${url}?api_key=${key}`, {
      headers: key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : undefined,
      next: { revalidate },
    });
    if (!res.ok) return NextResponse.json({ key: null });

    const data = await res.json();
    const trailer = (data.results ?? []).find(
      (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
    );
    return NextResponse.json({ key: trailer?.key ?? null });
  } catch {
    return NextResponse.json({ key: null });
  }
}
