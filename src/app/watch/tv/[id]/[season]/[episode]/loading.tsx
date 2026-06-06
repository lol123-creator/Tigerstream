'use client';

export default function Loading() {
  return (
    <div
      className="animate-pulse min-h-screen bg-black pt-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="h-4 w-20 rounded bg-white/10" />
            <div className="mt-1 h-8 w-64 rounded bg-white/10" />
          </div>
          <div className="h-8 w-32 rounded-lg bg-white/10" />
        </div>
        <div className="aspect-video w-full rounded-xl bg-white/5" />
      </div>
    </div>
  );
}