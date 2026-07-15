import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      'Stream movies, TV shows, and live sports. Pick up where you left off with Continue Watching.',
    start_url: '/',
    display: 'standalone',
    // Matches the Frosted Minimal theme tokens (tailwind.config.ts:
    // surface / accent).
    background_color: '#121316',
    theme_color: '#121316',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
