'use client';

import type { Movie, TvShow } from '@/types/media';

export interface QualityInfo {
  quality: string;
  lastUpdated: number;
}

// Store quality info with timestamps
const qualityCache = new Map<string, QualityInfo>();

// Check if quality data is stale (older than 5 minutes)
const isStale = (timestamp: number) => Date.now() - timestamp > 5 * 60 * 1000;

export async function checkAndUpdateQuality(
  media: Movie | TvShow,
): Promise<QualityInfo | null> {
  const key = `${media.type}-${media.id}`;
  const cached = qualityCache.get(key);

  // Return cache if it's fresh
  if (cached && !isStale(cached.lastUpdated)) {
    return cached;
  }

  try {
    // Query ppv.to for available quality
    const title = media.type === 'movie' ? media.title : media.title;
    const response = await fetch(
      `https://api.ppv.to/api/streams?search=${encodeURIComponent(title)}`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as any;
    if (!data.success) return null;

    // Extract quality from available streams
    let quality = 'Availabe';
    let found = false;

    for (const category of data.streams || []) {
      for (const stream of category.streams || []) {
        if (stream.name?.toLowerCase().includes('cam')) {
          quality = 'CAM';
          found = true;
        } else if (
          stream.name?.toLowerCase().includes('hd') &&
          quality !== 'CAM'
        ) {
          quality = 'HD';
          found = true;
        } else if (
          stream.name?.toLowerCase().includes('4k') &&
          quality !== 'CAM' &&
          quality !== 'HD'
        ) {
          quality = '4K';
          found = true;
        } else if (
          !found &&
          stream.name &&
          quality === 'Coming Soon'
        ) {
          quality = 'Available';
        }
      }
    }

    const info: QualityInfo = {
      quality,
      lastUpdated: Date.now(),
    };

    qualityCache.set(key, info);
    return info;
  } catch (error) {
    console.error('Error checking quality:', error);
    return null;
  }
}

export function getQualityColor(
  quality: string,
): 'text-red-400' | 'text-yellow-400' | 'text-blue-400' | 'text-green-400' {
  switch (quality?.toUpperCase()) {
    case 'CAM':
      return 'text-red-400';
    case 'HD':
      return 'text-blue-400';
    case '4K':
      return 'text-green-400';
    default:
      return 'text-yellow-400';
  }
}
