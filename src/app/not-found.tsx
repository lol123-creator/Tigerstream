import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="mt-2 text-white/50">This title isn&apos;t in our catalog.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent px-6 py-2 font-medium text-white hover:bg-accent-hover"
      >
        Back to home
      </Link>
    </div>
  );
}
