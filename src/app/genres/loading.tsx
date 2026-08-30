export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <div className="mb-2 h-9 w-32 animate-pulse rounded bg-white/5" />
      <div className="mb-8 h-4 w-72 animate-pulse rounded bg-white/5" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
