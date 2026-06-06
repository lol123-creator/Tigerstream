import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Navbar } from '@/components/Navbar';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-white/5 py-8 text-center text-sm text-white/35">
          <p>{SITE_NAME}</p>
        </footer>
        <SpeedInsights />
      </body>
    </html>
  );
}
