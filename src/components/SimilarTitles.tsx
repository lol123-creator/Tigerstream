import { MediaCard } from '@/components/MediaCard';
import { ScrollRow } from '@/components/ScrollRow';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import type { MediaItem } from '@/types/media';

interface SimilarTitlesProps {
  title?: string;
  items: MediaItem[];
}

export function SimilarTitles({ title = 'More Like This', items }: SimilarTitlesProps) {
  if (items.length === 0) return null;

  return (
    <RevealOnScroll>
      <ScrollRow title={title} className="mt-10 mb-0">
        {items.map((item, i) => (
          <MediaCard
            key={`similar-${item.type}-${item.id}`}
            item={item}
            priority={i < 4}
          />
        ))}
      </ScrollRow>
    </RevealOnScroll>
  );
}
