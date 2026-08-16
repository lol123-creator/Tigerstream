'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function AuthButton() {
  const [email, setEmail] = useState<string | null | undefined>(undefined); // undefined = not checked yet
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Not checked yet - render a stable-size placeholder to avoid layout shift
  if (email === undefined) {
    return <div className="h-9 w-9 shrink-0 rounded-full bg-white/5" />;
  }

  if (!email) {
    return (
      <Link
        href="/auth"
        className="flex h-9 shrink-0 items-center rounded-full border border-glass-border bg-white/[0.04] px-3.5 text-xs font-medium text-ink-2 transition-colors hover:bg-accent/15 hover:text-accent"
      >
        Sign In
      </Link>
    );
  }

  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent transition hover:bg-accent/30"
      >
        {initial}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-dropdown-in absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-glass-border bg-surface/95 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-glass-border px-4 py-3">
              <p className="truncate text-xs text-ink-3">Signed in as</p>
              <p className="truncate text-sm font-medium text-white">{email}</p>
            </div>
            <form action="/auth/sign-out" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-ink-2 transition hover:bg-white/[0.06] hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5M21 12H9" />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
