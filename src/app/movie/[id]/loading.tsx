'use client';

export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <div className="relative min-h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/30" />
        <div className="relative mx-auto flex max-w-7xl gap-6 px-4 pb-12 pt-28 sm:px-6 md:gap-10">
          <div className="hidden h-64 w-44 shrink-0 rounded-lg bg-white/10 sm:block md:h-80 md:w-52" />
          <div className="flex flex-col justify-end gap-3">
            <div className="h-10 w-24 rounded bg-white/10" />
            <div className="h-12 w-80 max-w-full rounded bg-white/10" />
            <div className="h-4 w-96 max-w-full rounded bg-white/5" />
            <div className="h-4 w-72 max-w-full rounded bg-white/5" />
            <div className="h-12 w-40 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>
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