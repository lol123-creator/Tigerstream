/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // TMDB already serves pre-sized images (w185/w342/w500/w780/original)
    // from its own CDN, and we pick the right size per component. Running
    // those through Vercel's Image Optimization API on top of that adds
    // little value and was blowing through the plan's monthly image
    // optimization quota - once that's hit, Vercel returns 402 for any
    // image it hasn't already cached, which is what was causing posters
    // to randomly fail to load. Serving the TMDB/placeholder URLs
    // directly (unoptimized) avoids that limit entirely.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.ppv.ts',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=120, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
