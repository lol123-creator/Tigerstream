import { MediaCard } from '@/components/MediaCard';
import type { MediaItem } from '@/types/media';

interface MediaGridProps {
  items: MediaItem[];
  priorityCount?: number;
}

export function MediaGrid({ items, priorityCount = 12 }: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item, i) => (
        <div key={`${item.type}-${item.id}`} className="w-full">
          <MediaCard
            item={item}
            priority={i < priorityCount}
            variant="grid"
          />
        </div>
      ))}
    </div>
  );
}
