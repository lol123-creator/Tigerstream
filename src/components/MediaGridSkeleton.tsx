/**
 * Generic poster-grid pulse placeholder shared by every browse/listing
 * page's loading.tsx (movies, tv, anime, genres, sports). Column count
 * mirrors MediaGrid's own responsive breakpoints closely enough to
 * avoid a layout jump when real cards swap in; exact pixel match isn't
 * the goal, just "this doesn't jarringly reflow."
 */
export function MediaGridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] w-full rounded-xl bg-white/5" />
          <div className="mt-2 h-3 w-4/5 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}
