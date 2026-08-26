'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { setSignedInUserId, mergeCloudDataOnSignIn } from '@/lib/cloud-sync';
import { useToast } from '@/components/ToastProvider';

interface AuthButtonProps {
  /** 'nav' - compact avatar with a popup dropdown, for the desktop top bar.
   *  'inline' - full-width rows with no popup, for use inside the mobile menu panel. */
  variant?: 'nav' | 'inline';
  onNavigate?: () => void;
}

export function AuthButton({ variant = 'nav', onNavigate }: AuthButtonProps) {
  const [email, setEmail] = useState<string | null | undefined>(undefined); // undefined = not checked yet
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setEmail(data.user?.email ?? null);
      setSignedInUserId(uid);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      setEmail(session?.user?.email ?? null);
      setSignedInUserId(uid);

      // Merge local (possibly Guest-accumulated) data into the account
      // exactly once per sign-in, not on every auth-state tick.
      if (event === 'SIGNED_IN' && uid && mergedFor.current !== uid) {
        mergedFor.current = uid;
        mergeCloudDataOnSignIn(uid).then(() => {
          showToast('Synced your list and progress to this account', 'success');
        });
      }
      if (event === 'SIGNED_OUT') {
        mergedFor.current = null;
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [showToast]);

  if (variant === 'inline') {
    if (email === undefined) {
      return <div className="mx-4 h-10 animate-pulse rounded-xl bg-white/5" />;
    }
    if (!email) {
      return (
        <Link
          href="/auth"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-2 transition hover:bg-white/[0.06] hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <path d="M10 17l5-5-5-5M15 12H3" />
          </svg>
          Sign In
        </Link>
      );
    }
    return (
      <div className="border-t border-glass-border px-4 pt-3">
        <p className="truncate text-xs text-ink-3">Signed in as</p>
        <p className="truncate text-sm font-medium text-white">{email}</p>
        <form action="/auth/sign-out" method="POST" className="mt-2">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-0 py-2 text-left text-sm text-ink-2 transition hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    );
  }

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
