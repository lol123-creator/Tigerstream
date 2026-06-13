/** Lightweight skeleton shown while below-fold rows stream in. */
export function HomeMoreRowsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <section key={i} className="mb-10 px-4 sm:px-6">
          <div className="mb-4 h-5 w-40 rounded bg-white/5" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((__, j) => (
              <div key={j} className="h-48 w-32 shrink-0 rounded-lg bg-white/5" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}