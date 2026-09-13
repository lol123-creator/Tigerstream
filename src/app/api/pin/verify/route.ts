import { NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'crypto';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { pin } = await request.json();
  if (typeof pin !== 'string') {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data } = await supabase
    .from('account_pins')
    .select('pin_hash')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) return NextResponse.json({ ok: false, noPinSet: true });

  const [salt, hash] = data.pin_hash.split(':');
  const candidate = scryptSync(pin, salt, 64).toString('hex');
  const matches =
    candidate.length === hash.length &&
    timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));

  return NextResponse.json({ ok: matches });
}
