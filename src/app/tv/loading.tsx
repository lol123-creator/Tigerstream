import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <div className="skeleton-shimmer mb-2 h-9 w-40 rounded" />
      <div className="skeleton-shimmer mb-6 h-4 w-64 rounded" />
      <div className="sticky top-16 z-40 -mx-4 mb-8 border-b border-white/5 bg-surface/35 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="skeleton-shimmer mb-3 h-3 w-32 rounded" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-8 w-20 shrink-0 rounded-full" />
          ))}
        </div>
      </div>
      <MediaGridSkeleton />
    </div>
  );
}
