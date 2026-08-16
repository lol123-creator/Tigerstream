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

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
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
