import { Inter, Fraunces } from 'next/font/google';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Navbar } from '@/components/Navbar';
import dynamic from 'next/dynamic';
import { SITE_NAME } from '@/lib/brand';
import { getSiteUrl } from '@/lib/site';
import './globals.css';

const ScrollToTop = dynamic(
  () => import('@/components/ScrollToTop').then((m) => ({ default: m.ScrollToTop }))
);

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — Movies & TV`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    'Stream movies, TV shows, and live sports. Pick up where you left off with Continue Watching.',
  openGraph: {
    title: `${SITE_NAME} — Movies & TV`,
    description:
      'Stream movies, TV shows, and live sports. Pick up where you left off with Continue Watching.',
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Movies & TV`,
    description:
      'Stream movies, TV shows, and live sports. Pick up where you left off with Continue Watching.',
  },
};

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

// Display face for hero titles and big headings (Tiger Editorial direction).
// Kept off the body font so it reads as a deliberate accent, not the
// default typeface for everything.
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
      </head>
      <body className={`min-h-screen font-sans ${inter.variable} ${fraunces.variable}`}>
        <Navbar />
        <main>{children}</main>
        <ScrollToTop />
        <footer className="border-t border-white/5 py-10 text-sm text-white/35">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="/" className="hover:text-white/60 transition">Home</a>
              <a href="/movies" className="hover:text-white/60 transition">Movies</a>
              <a href="/tv" className="hover:text-white/60 transition">TV Shows</a>
              <a href="/anime" className="hover:text-white/60 transition">Anime</a>
              <a href="/sports" className="hover:text-white/60 transition">Sports</a>
              <a href="/genres" className="hover:text-white/60 transition">Genres</a>
              <a href="/favorites" className="hover:text-white/60 transition">My List</a>
            </div>
            <p className="mt-4 text-center">{SITE_NAME}</p>
          </div>
          <div className="mt-8 mx-auto max-w-2xl rounded-xl border border-white/5 bg-white/[0.02] px-6 py-5 text-center backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="text-lg">🛡️</span>
              <p className="text-sm font-semibold text-white/50">Important Disclaimer</p>
            </div>
            <p className="text-xs leading-relaxed text-white/30">
              TigerStream operates as a content aggregator and does not host any media files on our servers. 
              All content is sourced from third-party providers and embedded services. For any copyright concerns 
              or DMCA takedown requests, please contact the respective content providers directly.
            </p>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
