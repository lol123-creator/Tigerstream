'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tigerstream:lite-mode';

function applyLiteMode(on: boolean) {
  document.documentElement.dataset.lite = on ? 'true' : 'false';
}

export function LiteModeToggle() {
  const [on, setOn] = useState(false);

  // Sync with whatever the blocking inline script in <head> already set
  // before paint, so this button reflects the real current state
  // instead of flashing to "off" on first render.
  useEffect(() => {
    setOn(document.documentElement.dataset.lite === 'true');
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    applyLiteMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // storage unavailable - the toggle still works for this session
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title={
        on
          ? 'Lite mode is on - tap to restore full visuals'
          : 'Turn on Lite Mode for slow devices or old browsers (e.g. game console browsers)'
      }
      className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
        on
          ? 'border-accent/40 bg-accent/15 text-accent'
          : 'border-glass-border bg-white/[0.04] text-ink-2 hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
      <span className="hidden sm:inline">{on ? 'Lite Mode' : 'Lite Mode'}</span>
    </button>
  );
}
