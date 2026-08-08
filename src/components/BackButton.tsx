'use client';

import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'tigerstream:returnTo';

/**
 * Read (and clear) the stored return path so the BackButton knows
 * where the user came from.
 *
 * Important: this is only ever called from the click handler, not on
 * mount. It used to run in a useEffect on mount, which meant simply
 * *visiting* a page silently consumed the stored return path - even if
 * the user then navigated away via some other link (e.g. a cast
 * member) instead of clicking Back. By the time Back actually got
 * clicked, the path was often already gone, so it fell through to a
 * generic browser-history back instead of the real origin page.
 */
export function getReturnPath(): string | null {
  if (typeof window === 'undefined') return null;
  const path = sessionStorage.getItem(STORAGE_KEY);
  if (path) sessionStorage.removeItem(STORAGE_KEY);
  return path;
}

/**
 * Call this before navigating *to* a detail page so we remember
 * which listing/search page the user was on.
 */
export function storeReturnPath() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname + window.location.search;
  sessionStorage.setItem(STORAGE_KEY, path);
}

interface BackButtonProps {
  /** Destination when there is no history to go back to. */
  fallbackHref?: string;
  className?: string;
}

export function BackButton({ fallbackHref = '/', className = '' }: BackButtonProps) {
  const router = useRouter();

  const onClick = () => {
    // Consumed here, at the moment of the actual click - not on mount.
    const returnTo = getReturnPath();
    if (returnTo) {
      // replace, not push: this is a "go back" action. Using push
      // added a new history entry on top of the stack instead of truly
      // going back - the browser history ended up with the movie page
      // duplicated (once from the original visit, once from this
      // push). Once the stored path was consumed and a later back
      // press fell through to router.back(), it popped that duplicate
      // and landed back on the actor page instead of moving past it,
      // requiring a second press. replace keeps the stack clean.
      router.replace(returnTo);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className={
        'inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 ' +
        'text-sm text-ink-1 backdrop-blur transition hover:bg-black/60 hover:text-white ' +
        className
      }
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
