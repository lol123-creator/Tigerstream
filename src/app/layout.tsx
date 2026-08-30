import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Navbar } from '@/components/Navbar';
import { IntroSplash } from '@/components/IntroSplash';
import { ProfileGate } from '@/components/ProfileGate';
import { ToastProvider } from '@/components/ToastProvider';
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
  // Google Search Console site-ownership verification, needed to clear
  // the OAuth consent screen's "branding verification" issue for a
  // vercel.app URL (shared hosts can't be verified at the domain level,
  // only per-URL via this meta tag). Paste the `content` value Search
  // Console gives you under Add Property -> URL prefix -> HTML tag.
  verification: {
    google: 'google-site-verification: googlece7f594820bdf5e8.html',
  },
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

// Display face for headings (Frosted Minimal direction) - clean and
// geometric, used with tight tracking rather than a loud personality.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600'],
  variable: '--font-jakarta',
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
        {/* Sets data-lite on <html> synchronously, before first paint,
            so returning visitors who've enabled Lite Mode never see a
            flash of the full heavy UI before it switches off. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.lite=localStorage.getItem('tigerstream:lite-mode')==='1'?'true':'false';}catch(e){}`,
          }}
        />
      </head>
      <body className={`min-h-screen font-sans ${inter.variable} ${jakarta.variable}`}>
        {/* Ambient animated glow - sits behind everything (-z-10, fixed
            to viewport) and drifts slowly. Layered on top of the static
            base gradient defined in globals.css rather than animating
            that gradient itself, since that one is deliberately sized
            to the full document height to avoid an earlier seam bug.
            data-lite-hide - removed entirely in Lite Mode. */}
        <div aria-hidden="true" data-lite-hide="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute left-[10%] top-[-10%] h-[55vh] w-[55vh] rounded-full bg-accent/10 blur-3xl"
            style={{ animation: 'gradientDrift1 22s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-[-10%] right-[10%] h-[50vh] w-[50vh] rounded-full bg-[#003366]/50 blur-3xl"
            style={{ animation: 'gradientDrift2 26s ease-in-out infinite' }}
          />
        </div>

        <ToastProvider>
          <IntroSplash />
          <ProfileGate />
          <Navbar />
          <main>{children}</main>
          <ScrollToTop />
          <footer className="border-t border-glass-border py-10 text-sm text-ink-4">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <a href="/" className="hover:text-ink-2 transition">Home</a>
                <a href="/movies" className="hover:text-ink-2 transition">Movies</a>
                <a href="/tv" className="hover:text-ink-2 transition">TV Shows</a>
                <a href="/anime" className="hover:text-ink-2 transition">Anime</a>
                <a href="/sports" className="hover:text-ink-2 transition">Sports</a>
                <a href="/genres" className="hover:text-ink-2 transition">Genres</a>
                <a href="/history" className="hover:text-ink-2 transition">History</a>
                <a href="/favorites" className="hover:text-ink-2 transition">My List</a>
              </div>
              <p className="mt-4 text-center">{SITE_NAME}</p>
            </div>
            <div className="mt-8 mx-auto max-w-2xl rounded-xl border border-glass-border bg-white/[0.02] px-6 py-5 text-center backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="text-lg">🛡️</span>
                <p className="text-sm font-semibold text-ink-3">Important Disclaimer</p>
              </div>
              <p className="text-xs leading-relaxed text-ink-4">
                TigerStream operates as a content aggregator and does not host any media files on our servers. 
                All content is sourced from third-party providers and embedded services. For any copyright concerns 
                or DMCA takedown requests, please contact the respective content providers directly.
              </p>
            </div>
          </footer>
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
