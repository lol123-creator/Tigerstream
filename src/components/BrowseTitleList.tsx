import Link from 'next/link';
import { movieDetailHref, tvDetailHref } from '@/lib/routes';
import type { MediaItem } from '@/types/media';

interface BrowseTitleListProps {
  heading: string;
  items: MediaItem[];
}

export function BrowseTitleList({ heading, items }: BrowseTitleListProps) {
  if (items.length === 0) return null;

  const sortedItems = [...items].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );

  // Collapsed by default via <details> instead of always rendering as a
  // large boxy grid - this list exists mainly for text-based
  // crawlability alongside the visual poster grid below, and it was
  // taking up a lot of vertical space for something most visitors never
  // needed to see. The links are still present in the page's HTML
  // whether expanded or not, so nothing crawlable is lost by collapsing
  // the visual presentation.
  return (
    <details className="group mb-8 rounded-xl border border-white/10 bg-surface-card/50 open:bg-surface-card/70">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm text-white/60 transition hover:text-white/85 sm:px-5">
        <span className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-open:rotate-90"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          {heading}
        </span>
        <span className="text-xs text-white/35">{items.length} titles</span>
      </summary>
      <div className="max-h-72 overflow-y-auto border-t border-white/5 px-4 py-3 sm:px-5">
        <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedItems.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Link
                href={
                  item.type === 'movie'
                    ? movieDetailHref(item.id)
                    : tvDetailHref(item.id)
                }
                className="block truncate rounded px-2 py-1 text-sm text-white/55 transition hover:bg-accent/10 hover:text-accent"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
