'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  /** Destination when there is no history to go back to. */
  fallbackHref?: string;
  className?: string;
}

export function BackButton({ fallbackHref = "/", className = "" }: BackButtonProps) {
  const router = useRouter();

  const onClick = () => {
    // window.history.length is 1 on a fresh tab, so fall back to home
    // when there is nothing to go back to.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className={
        "inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 " +
        "text-sm text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white " +
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