import { MediaCard } from '@/components/MediaCard';
import { ScrollRow } from '@/components/ScrollRow';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import type { MediaItem } from '@/types/media';

interface MediaRowProps {
  title: string;
  items: MediaItem[];
}

export function MediaRow({ title, items }: MediaRowProps) {
  if (items.length === 0) return null;

  return (
    <RevealOnScroll>
      <ScrollRow title={title}>
        {items.map((item, i) => (
          <MediaCard
            key={`${title}-${item.type}-${item.id}-${i}`}
            item={item}
            priority={i < 4}
          />
        ))}
      </ScrollRow>
    </RevealOnScroll>
  );
}
