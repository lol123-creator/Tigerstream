'use client';

export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        <div className="flex gap-3">
          <div className="h-7 w-20 rounded-full bg-white/10" />
          <div className="h-7 w-24 rounded-full bg-white/10" />
        </div>
        <div className="h-6 w-32 rounded bg-white/10" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-3/4 rounded bg-white/5" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded bg-white/5" />
              <div className="h-4 w-24 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}