'use client';

import { useEffect, useState } from 'react';
import { MediaCard } from '@/components/MediaCard';
import { ScrollRow } from '@/components/ScrollRow';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { loadPeachifyProgress } from '@/lib/progress-client';
import { getFavorites } from '@/lib/favorites-client';
import type { MediaItem } from '@/types/media';

/**
 * Picks the single most recently-touched title (whichever is more
 * recent between watch progress and favorites), fetches TMDB
 * recommendations seeded from it, and shows them as "Because you
 * watched X". Client-only since the seed data lives in localStorage;
 * the actual TMDB call happens server-side via the API route.
 */
export function BecauseYouWatched() {
  const [sourceTitle, setSourceTitle] = useState<string | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const progress = loadPeachifyProgress();
      const favorites = getFavorites();

      type Candidate = { id: number; type: 'movie' | 'tv'; ts: number };
      const candidates: Candidate[] = [];

      for (const entry of Object.values(progress)) {
        if (!entry || (entry.type !== 'movie' && entry.type !== 'tv')) continue;
        candidates.push({ id: entry.id, type: entry.type, ts: entry.last_updated ?? 0 });
      }
      for (const fav of favorites) {
        candidates.push({ id: fav.id, type: fav.type, ts: fav.addedAt });
      }

      if (candidates.length === 0) {
        setLoading(false);
        return;
      }

      candidates.sort((a, b) => b.ts - a.ts);
      const seed = candidates[0];

      try {
        // NOTE: this route lives at /api-because-you-watched (a flat,
        // hyphenated top-level folder), NOT the nested
        // /api/because-you-watched it looks like it should be -
        // matches src/app/api-because-you-watched/route.ts exactly.
        const res = await fetch(`/api-because-you-watched?id=${seed.id}&type=${seed.type}`);
        if (!res.ok) throw new Error('bad response');
        const data = await res.json();
        if (!cancelled) {
          setSourceTitle(data.sourceTitle ?? null);
          setItems(data.items ?? []);
        }
      } catch {
        // Silently skip - this is a nice-to-have row, not core content
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || items.length === 0 || !sourceTitle) return null;

  return (
    <RevealOnScroll>
      <ScrollRow title={`Because you watched ${sourceTitle}`}>
        {items.map((item, i) => (
          <MediaCard
            key={`byw-${item.type}-${item.id}`}
            item={item}
            priority={i < 4}
          />
        ))}
      </ScrollRow>
    </RevealOnScroll>
  );
}
