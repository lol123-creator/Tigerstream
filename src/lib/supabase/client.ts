'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client, for use in client components. Reads
 * the public URL/anon key from env - these are safe to expose to the
 * browser (that's what "anon key" + Row Level Security is for; it
 * cannot read/write data it doesn't have RLS policy permission for).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
