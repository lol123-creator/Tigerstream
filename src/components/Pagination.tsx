import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const pages: (number | 'ellipsis')[] = [];
  const windowSet = new Set<number>();
  windowSet.add(1);
  windowSet.add(totalPages);
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    windowSet.add(i);
  }
  const sorted = [...windowSet].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('ellipsis');
    pages.push(sorted[i]);
  }

  const btnBase =
    'flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border px-3.5 text-sm font-medium transition-all duration-200';
  const active = 'border-accent bg-accent text-[#0A1F2B] shadow-glow';
  const inactive = 'border-white/10 bg-white/[0.04] text-white/65 hover:border-accent/30 hover:bg-accent/10 hover:text-white';
  const disabled = 'border-white/5 bg-white/[0.02] text-white/15 cursor-not-allowed pointer-events-none';

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {hasPrev ? (
        <Link href={buildHref(currentPage - 1)} className={`${btnBase} ${inactive} gap-1.5`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </Link>
      ) : (
        <span className={`${btnBase} ${disabled} gap-1.5`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </span>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-white/25 select-none">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`${btnBase} ${p === currentPage ? active : inactive}`}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {hasNext ? (
        <Link href={buildHref(currentPage + 1)} className={`${btnBase} ${inactive} gap-1.5`}>
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      ) : (
        <span className={`${btnBase} ${disabled} gap-1.5`}>
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </nav>
  );
}
