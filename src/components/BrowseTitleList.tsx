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

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-surface-card/70 p-4 shadow-2xl shadow-black/20 sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{heading}</h2>
          <p className="text-sm text-white/45">
            Browse every title currently loaded on this page.
          </p>
        </div>
        <span className="text-sm font-medium text-accent">
          {items.length} titles
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto pr-1">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedItems.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Link
                href={
                  item.type === 'movie'
                    ? movieDetailHref(item.id)
                    : tvDetailHref(item.id)
                }
                className="group flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white/75 transition hover:border-accent/40 hover:bg-accent/10 hover:text-white"
              >
                <span className="truncate">{item.title}</span>
                <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45 group-hover:bg-accent/20 group-hover:text-accent">
                  {item.type === 'movie' ? 'Movie' : 'TV'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
