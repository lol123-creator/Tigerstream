'use client';

import { useState } from 'react';
import { getEmbedUrl } from '@/lib/ppv/service';
import type { PpvStream } from '@/types/sports';

interface PpvPlayerProps {
  stream: PpvStream;
}

export function PpvPlayer({ stream }: PpvPlayerProps) {
  const [substream, setSubstream] = useState<string | undefined>();
  const embedUrl = getEmbedUrl(stream, substream);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-surface-card text-white/50">
        Stream not available yet. Check back closer to start time.
      </div>
    );
  }

  const feeds = [
    { key: 'main', label: stream.tag || 'Main feed', uri: undefined as string | undefined },
    ...(stream.substreams?.map((s) => ({
      key: s.uri_name,
      label: s.source_tag || s.tag || 'Alt feed',
      uri: s.uri_name,
    })) ?? []),
  ];

  return (
    <div>
      {feeds.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {feeds.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setSubstream(f.uri)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                (substream ?? '') === (f.uri ?? '')
                  ? 'border-accent bg-accent/20 text-white'
                  : 'border-white/15 text-white/70 hover:border-white/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
        <iframe
          src={embedUrl}
          title={stream.name}
          className="aspect-video w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
