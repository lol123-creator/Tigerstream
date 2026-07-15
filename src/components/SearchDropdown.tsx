'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { tmdbImage } from '@/lib/tmdb-images';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';
import { storeReturnPath } from '@/components/BackButton';

interface SearchResult {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

export function SearchDropdown() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  const yearOf = (r: SearchResult) => {
    const d = r.release_date || r.first_air_date;
    return d ? '(' + new Date(d).getFullYear() + ')' : '';
  };

  const href = (r: SearchResult) =>
    r.type === 'movie' ? movieDetailHref(r.id) : tvDetailHref(r.id);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(trimmed), {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        // aborted or network error
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [q]);

  // Close via blur on the widget container + combined keyboard
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); return; }
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Lightweight outside-click – only active when panel is open, fires once
  useEffect(() => {
    if (!open) return;
    function handlePointer(e: PointerEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointer, { once: true });
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [open]);

  const [isMac, setIsMac] = useState<boolean | null>(null);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent));
  }, []);

  function submitFullSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      setOpen(false);
      router.push('/search?q=' + encodeURIComponent(trimmed));
    }
  }

  const trimmedQ = q.trim();
  const showEmpty = open && !loading && trimmedQ.length >= 2 && results.length === 0;

  return (
    <div className="relative ml-auto flex max-w-xs flex-1 sm:max-w-sm">
      <form onSubmit={submitFullSearch} className="relative w-full">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search titles, genres..."
          className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-sm text-white placeholder:text-white/40 outline-none ring-accent/50 transition focus:border-accent/50 focus:bg-white/[0.07] focus:ring-2"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-autocomplete="list"
        />
        {loading ? (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
          </span>
        ) : (
          isMac !== null &&
          !q && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-white/35 sm:inline-flex">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
          )
        )}
      </form>

      {open && results.length > 0 && (
        <div
          ref={panelRef}
          role="listbox"
          className="animate-dropdown-in absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface/95 shadow-2xl backdrop-blur-md"
        >
          {results.map((r) => (
            <a
              key={r.type + '-' + r.id}
              href={href(r)}
              role="option"
              className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-accent/10"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { storeReturnPath(); setOpen(false); }}
            >
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10">
                <Image
                  src={tmdbImage(r.poster_path, 'w92')}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{r.title}</p>
                <p className="text-xs text-white/45">{r.type === 'movie' ? 'Movie' : 'TV'} {yearOf(r)}</p>
              </div>
            </a>
          ))}
          <a
            href={'/search?q=' + encodeURIComponent(q.trim())}
            className="block border-t border-white/10 px-3 py-2.5 text-center text-sm font-medium text-accent transition hover:bg-accent/10"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen(false)}
          >
            View all results for &ldquo;{q.trim()}&rdquo;
          </a>
        </div>
      )}

      {showEmpty && (
        <div className="animate-dropdown-in absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-white/10 bg-surface/95 px-4 py-6 text-center shadow-2xl backdrop-blur-md">
          <p className="text-sm text-white/50">No results for &ldquo;{trimmedQ}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
