import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Nothing meaningful for a crawler to index behind these -
      // personal, account-specific, or pure-API routes.
      disallow: ['/api/', '/api-because-you-watched/', '/api-new-episodes/', '/favorites', '/history', '/auth'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
