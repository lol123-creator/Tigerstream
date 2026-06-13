'use client';

import { useEffect, useState } from 'react';
import type { Movie, TvShow } from '@/types/media';
import { checkAndUpdateQuality, getQualityColor } from '@/lib/quality-checker';

interface QualityBadgeProps {
  media: Movie | TvShow;
}

export function QualityBadge({ media }: QualityBadgeProps) {
  const [quality, setQuality] = useState<string>('Coming Soon');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkQuality = async () => {
      try {
        setLoading(true);
        const result = await checkAndUpdateQuality(media);
        if (isMounted && result) {
          setQuality(result.quality);
        }
      } catch (error) {
        console.error('Error checking quality:', error);
        if (isMounted) {
          setQuality('Coming Soon');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkQuality();

    // Poll for quality updates every 5 minutes
    const interval = setInterval(checkQuality, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [media]);

  if (loading) {
    return (
      <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
        Checking...
      </span>
    );
  }

  const colorClass = getQualityColor(quality);

  return (
    <span
      className={`inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-medium ${colorClass}`}
    >
      {quality}
    </span>
  );
}
