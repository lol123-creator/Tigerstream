import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CheckResult {
  name: string;
  ok: boolean;
  ms: number;
  detail?: string;
}

async function check(name: string, url: string, init?: RequestInit): Promise<CheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    return { name, ok: res.ok, ms: Date.now() - start, detail: `HTTP ${res.status}` };
  } catch (err) {
    return {
      name,
      ok: false,
      ms: Date.now() - start,
      detail: err instanceof Error ? err.message : 'failed',
    };
  }
}

export async function GET() {
  const checks = await Promise.all([
    check('TMDB API', 'https://api.themoviedb.org/3/configuration', {
      headers: process.env.TMDB_API_KEY
        ? { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        : undefined,
    }),
    check('Supabase', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`),
    check('Peachify', 'https://peachify.top'),
    check('CinemaOS', 'https://cinemaos.tech'),
    check('Videasy', 'https://player.videasy.to'),
  ]);

  const allOk = checks.every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      checkedAt: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 207 },
  );
}
