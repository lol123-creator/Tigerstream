import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

/**
 * Static top-level routes only. Movie/TV detail pages are deliberately
 * left out - there'd be tens of thousands of them (one per TMDB title
 * ever visited), Google doesn't need a manually maintained sitemap
 * entry for pages it can already reach by crawling links from these
 * pages, and generating that list would mean querying TMDB for every
 * build. This still gives Search Console something real to index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const routes = ['', '/movies', '/tv', '/anime', '/sports', '/genres', '/surprise'];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'hourly' : 'daily',
    priority: path === '' ? 1 : 0.7,
  }));
}
