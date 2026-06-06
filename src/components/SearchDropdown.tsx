'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { tmdbImage } from '@/lib/tmdb-images';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';

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

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function submitFullSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      setOpen(false);
      router.push('/search?q=' + encodeURIComponent(trimmed));
    }
  }

  return (
    <div className="relative ml-auto flex max-w-xs flex-1 sm:max-w-sm">
      <form onSubmit={submitFullSearch} className="w-full">
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search titles, genres..."
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none ring-accent/50 focus:border-accent/50 focus:ring-2"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-autocomplete="list"
        />
      </form>

      {open && results.length > 0 && (
        <div
          ref={panelRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-surface/95 shadow-2xl backdrop-blur-md"
        >
          {results.map((r) => (
            <a
              key={r.type + '-' + r.id}
              href={href(r)}
              role="option"
              className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/8"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen(false)}
            >
              <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-white/10">
                <Image
                  src={tmdbImage(r.poster_path, 'w92')}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="32px"
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
            className="block border-t border-white/10 px-3 py-2.5 text-center text-sm font-medium text-accent transition hover:bg-white/8"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen(false)}
          >
            View all results for "{q.trim()}"
          </a>
        </div>
      )}
    </div>
  );
}
