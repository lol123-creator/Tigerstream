'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

type Mode = 'sign-in' | 'sign-up';

export default function AuthPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === 'sign-up') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setConfirmSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('Signed in', 'success');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success the browser navigates away to Google, so this only
    // runs if something went wrong before that redirect happened.
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  if (confirmSent) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" />
            <path d="m4 6 8 7 8-7" />
          </svg>
        </div>
        <h1 className="font-display mt-5 text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-ink-3">
          We sent a confirmation link to <span className="text-white">{email}</span>. Click it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="font-display text-3xl font-bold">
        {mode === 'sign-in' ? 'Welcome back' : 'Create an account'}
      </h1>
      <p className="mt-1 text-sm text-ink-3">
        {mode === 'sign-in'
          ? 'Sign in to sync your list and progress across devices.'
          : 'Your favorites and watch history will follow you anywhere.'}
      </p>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={googleLoading}
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-glass-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.5 0-14 4.1-17.7 10.2z" />
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5l-6.6-5.4c-2 1.4-4.6 2.3-7.6 2.3-5.3 0-9.7-3.4-11.3-8l-6.6 5C9.9 39.8 16.4 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.6 5.4C41.5 35.6 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z" />
        </svg>
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-4">
        <div className="h-px flex-1 bg-glass-border" />
        or
        <div className="h-px flex-1 bg-glass-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink-2">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-glass-border bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-accent/50 transition focus:border-accent/50 focus:ring-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ink-2">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-glass-border bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-accent/50 transition focus:border-accent/50 focus:ring-2"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#0A1F2B] transition hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? 'Please wait...' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-3">
        {mode === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(null); }}
          className="font-medium text-accent hover:underline"
        >
          {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
        </button>
      </p>

      <Link href="/" className="mt-8 text-center text-xs text-ink-4 hover:text-ink-2">
        ← Continue without an account
      </Link>
    </div>
  );
}
