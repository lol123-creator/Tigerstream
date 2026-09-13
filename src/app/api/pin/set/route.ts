import { NextResponse } from 'next/server';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function hashPin(pin: string, salt: string): string {
  return scryptSync(pin, salt, 64).toString('hex');
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { pin, currentPin } = await request.json();
  if (typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
  }

  // If a PIN already exists, changing it requires the current one -
  // otherwise anyone who grabs the device while already signed in
  // could just silently replace the PIN.
  const { data: existing } = await supabase
    .from('account_pins')
    .select('pin_hash')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    if (typeof currentPin !== 'string') {
      return NextResponse.json({ error: 'current PIN required' }, { status: 403 });
    }
    const [salt, hash] = existing.pin_hash.split(':');
    const candidate = hashPin(currentPin, salt);
    const matches =
      candidate.length === hash.length &&
      timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
    if (!matches) {
      return NextResponse.json({ error: 'incorrect current PIN' }, { status: 403 });
    }
  }

  const salt = randomBytes(16).toString('hex');
  const hash = hashPin(pin, salt);

  const { error } = await supabase
    .from('account_pins')
    .upsert({ user_id: user.id, pin_hash: `${salt}:${hash}` }, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
