import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every real request. Without
 * this, sessions expire silently and server components/route handlers
 * start seeing the user as signed out even though their browser still
 * has a (now-stale) session cookie.
 *
 * Skips that refresh for Next.js's automatic Link prefetch requests
 * (fired for every link that scrolls into view or gets hovered, not
 * just ones someone actually clicks). Those don't need a validated
 * session - the real navigation right behind one still gets a full
 * check - and without this, prefetching alone was generating hundreds
 * of extra /auth/v1/user calls to Supabase per browsing session, most
 * of them for pages nobody ended up visiting.
 */
export async function updateSession(request: NextRequest) {
  const isPrefetch =
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose') === 'prefetch';

  if (isPrefetch) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: this call must not be removed - it's what actually
  // refreshes the session and syncs the cookie.
  await supabase.auth.getUser();

  return supabaseResponse;
}
