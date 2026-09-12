import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { mediaId, mediaType, season, episode, player, title, note } = body ?? {};

  if (!mediaId || (mediaType !== 'movie' && mediaType !== 'tv') || !player) {
    return NextResponse.json({ error: 'invalid report' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('broken_stream_reports').insert({
    media_id: mediaId,
    media_type: mediaType,
    season: season ?? null,
    episode: episode ?? null,
    player,
    title: title ?? null,
    note: note ?? null,
    user_id: user?.id ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
