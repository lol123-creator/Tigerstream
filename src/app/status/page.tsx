'use client';

import { useEffect, useState } from 'react';

interface CheckResult {
  name: string;
  ok: boolean;
  ms: number;
  detail?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded';
  checkedAt: string;
  checks: CheckResult[];
}

export default function StatusPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch('/api/health', { cache: 'no-store' })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-24 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Status</h1>
          <p className="mt-1 text-sm text-ink-3">
            Live checks against the services Tigerstream depends on. Refreshes every minute.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="shrink-0 rounded-full border border-glass-border bg-white/5 px-4 py-2 text-xs font-medium text-ink-2 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Couldn't reach the health check endpoint itself.
        </p>
      )}

      {data && (
        <>
          <div
            className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 ${
              data.status === 'ok'
                ? 'border-green-500/20 bg-green-500/10'
                : 'border-amber-500/20 bg-amber-500/10'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                data.status === 'ok' ? 'bg-green-400' : 'bg-amber-400'
              }`}
            />
            <p className={`text-sm font-medium ${data.status === 'ok' ? 'text-green-300' : 'text-amber-300'}`}>
              {data.status === 'ok' ? 'All systems operational' : 'Some services are having trouble'}
            </p>
          </div>

          <ul className="space-y-2">
            {data.checks.map((c) => (
              <li
                key={c.name}
                className="flex items-center justify-between rounded-xl border border-glass-border bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${c.ok ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-sm font-medium text-white">{c.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-3">{c.detail}</p>
                  <p className="text-[11px] text-ink-4">{c.ms}ms</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-xs text-ink-4">
            Last checked {new Date(data.checkedAt).toLocaleTimeString()}
          </p>
        </>
      )}

      <p className="mt-10 text-center text-xs text-ink-4">
        A red Peachify/CinemaOS/Videasy check means that source is down upstream, not
        something wrong with Tigerstream itself.
      </p>
    </div>
  );
}
