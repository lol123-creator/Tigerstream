import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Navbar } from '@/components/Navbar';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SITE_NAME } from '@/lib/brand';
import { getSiteUrl } from '@/lib/site';
import './globals.css';

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

const inter = Inter({ subsets: ['latin'], display: 'optional', variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen font-sans ${inter.variable}`}>
        <Navbar />
        <main>{children}</main>
        <ScrollToTop />
        <footer className="border-t border-white/5 py-10 text-sm text-white/35">
          <div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="flex flex-wrap justify-center gap-x-6 gap-y-2"><a href="/" className="hover:text-white/60 transition">Home</a><a href="/movies" className="hover:text-white/60 transition">Movies</a><a href="/tv" className="hover:text-white/60 transition">TV Shows</a><a href="/anime" className="hover:text-white/60 transition">Anime</a><a href="/sports" className="hover:text-white/60 transition">Sports</a><a href="/genres" className="hover:text-white/60 transition">Genres</a><a href="/favorites" className="hover:text-white/60 transition">My List</a></div><p className="mt-4 text-center">{SITE_NAME}</p></div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
