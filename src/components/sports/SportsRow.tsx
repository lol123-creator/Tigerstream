import { ScrollRow } from '@/components/ScrollRow';
import { SportEventCard } from '@/components/sports/SportEventCard';
import type { PpvStream } from '@/types/sports';

interface SportsRowProps {
  title: string;
  streams: PpvStream[];
}

export function SportsRow({ title, streams }: SportsRowProps) {
  if (streams.length === 0) return null;

  return (
    <ScrollRow title={title} className="mb-10">
      {streams.map((stream) => (
        <SportEventCard key={stream.id} stream={stream} />
      ))}
    </ScrollRow>
  );
}
