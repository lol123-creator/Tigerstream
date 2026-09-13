import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hasPin: false });

  const { data } = await supabase
    .from('account_pins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({ hasPin: !!data });
}
