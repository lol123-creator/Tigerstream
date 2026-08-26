'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const SESSION_KEY = 'tigerstream:profile-selected';
const LITE_KEY = 'tigerstream:lite-mode';

type Status = 'checking' | 'hidden' | 'showing';

/**
 * A Netflix/Apple TV-style profile picker shown once per browser
 * session, after the intro. Two paths: continue as the signed-in
 * account (if any), or continue as Guest (today's default - browsing
 * with data kept locally in this browser only, same as before accounts
 * existed at all). Session-gated the same way IntroSplash is, so it
 * doesn't reappear on every internal page navigation - just once per
 * fresh visit.
 */
export function ProfileGate() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [email, setEmail] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const alreadyChosen = sessionStorage.getItem(SESSION_KEY);
    if (alreadyChosen) {
      setStatus('hidden');
      return;
    }

    let liteMode = false;
    try {
      liteMode = localStorage.getItem(LITE_KEY) === '1';
    } catch {
      // storage unavailable
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      // Lite Mode devices skip the picker entirely - one less screen,
      // one less thing for a weak device to render.
      if (liteMode) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setStatus('hidden');
      } else {
        setStatus('showing');
      }
    });
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // storage unavailable - the gate just won't remember for next time
      }
      setStatus('hidden');
    }, 250);
  };

  if (status !== 'showing') return null;

  const initial = email ? email.charAt(0).toUpperCase() : null;

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-surface px-4 transition-opacity duration-250"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-ambient-glow" />

      <h1 className="font-display relative text-2xl font-medium text-white sm:text-3xl">
        Who&apos;s watching?
      </h1>

      <div className="relative mt-10 flex flex-wrap items-start justify-center gap-6 sm:gap-8">
        {email && (
          <button
            type="button"
            onClick={dismiss}
            className="group flex flex-col items-center gap-3"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-accent/20 text-3xl font-semibold text-accent ring-2 ring-transparent transition group-hover:ring-accent sm:h-28 sm:w-28">
              {initial}
            </div>
            <span className="max-w-[7rem] truncate text-sm font-medium text-ink-1 group-hover:text-white">
              {email}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="group flex flex-col items-center gap-3"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/[0.06] text-ink-2 ring-2 ring-transparent transition group-hover:bg-white/[0.1] group-hover:text-white group-hover:ring-white/30 sm:h-28 sm:w-28">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="7" r="4" strokeDasharray="3 2" />
            </svg>
          </div>
          <span className="text-sm font-medium text-ink-2 group-hover:text-white">Guest</span>
        </button>

        {!email && (
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem(SESSION_KEY, '1');
              } catch {}
              router.push('/auth');
            }}
            className="group flex flex-col items-center gap-3"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-glass-border text-ink-3 transition group-hover:border-accent/40 group-hover:text-accent sm:h-28 sm:w-28">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-sm font-medium text-ink-2 group-hover:text-white">Sign In</span>
          </button>
        )}
      </div>

      {!email && (
        <p className="relative mt-10 max-w-xs text-center text-xs text-ink-4">
          Guest browsing keeps your list and progress on this device only.
          Sign in to sync across devices.
        </p>
      )}
    </div>
  );
}
