import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <div className="mb-2 h-9 w-32 animate-pulse rounded bg-white/5" />
      <div className="mb-6 h-4 w-56 animate-pulse rounded bg-white/5" />
      <MediaGridSkeleton count={12} />
    </div>
  );
}
