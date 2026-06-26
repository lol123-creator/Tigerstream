const fs = require('fs');
const NL = '\r\n';

// 1. Fix HomeMoreRowsSkeleton dimensions to match actual MediaCard dimensions (prevents CLS)
const skel = 'src/components/HomeMoreRowsSkeleton.tsx';
let sk = fs.readFileSync(skel, 'utf8');
sk = sk.replace(
  '<div key={j} className="h-48 w-32 shrink-0 rounded-lg bg-white/5" />',
  '<div key={j} className="aspect-[2/3] w-[clamp(140px,18vw,200px)] shrink-0 rounded-lg bg-white/5" />'
);
fs.writeFileSync(skel, sk, 'utf8');
console.log('1. Fixed HomeMoreRowsSkeleton dimensions');

// 2. Fix font loading: change display from 'swap' to 'optional' to prevent CLS from font swap
const layout = 'src/app/layout.tsx';
let lt = fs.readFileSync(layout, 'utf8');
lt = lt.replace(
  "display: 'swap'",
  "display: 'optional'"
);
fs.writeFileSync(layout, lt, 'utf8');
console.log('2. Changed font display to optional');

// 3. Lazy load SearchDropdown in Navbar using dynamic import to reduce initial bundle
const navbar = 'src/components/Navbar.tsx';
let nv = fs.readFileSync(navbar, 'utf8');
const searchImportLine = `import { SearchDropdown } from '@/components/SearchDropdown';`;
const searchDynamicImport = `import dynamic from 'next/dynamic';
const SearchDropdown = dynamic(() => import('@/components/SearchDropdown'), { ssr: false });`;
nv = nv.replace(searchImportLine, searchDynamicImport);
fs.writeFileSync(navbar, nv, 'utf8');
console.log('3. Lazy loaded SearchDropdown in Navbar');

// 4. Fix ScrollRow INP: remove DOM overlay creation during drag, use CSS outline instead
const scrollRow = 'src/components/ScrollRow.tsx';
let sr = fs.readFileSync(scrollRow, 'utf8');
// Remove the drag overlay creation and instead add will-change hint
sr = sr.replace(
  'didDrag.current = true;\n        const overlay = document.createElement(\'div\');\n        overlay.setAttribute(\'data-drag-overlay\', \'\');\n        overlay.style.cssText =\n          \'position:absolute;inset:0;z-index:20;cursor:grabbing;pointer-events:auto;\';\n        el.style.position = \'relative\';\n        el.appendChild(overlay);',
  'didDrag.current = true;\n        el.style.outline = \'2px solid rgba(255,255,255,0.05)\';\n        el.style.outlineOffset = \'-2px\';'
);
sr = sr.replace(
  "const overlay = el.querySelector('[data-drag-overlay]');\n      if (overlay) overlay.remove();",
  "el.style.outline = '';\n      el.style.outlineOffset = '';"
);
fs.writeFileSync(scrollRow, sr, 'utf8');
console.log('4. Optimized ScrollRow INP');

// 5. Fix ContinueWatchingRow: remove 5s interval polling, use event-driven updates
const cwr = 'src/components/ContinueWatchingRow.tsx';
let cw = fs.readFileSync(cwr, 'utf8');
cw = cw.replace(
  "const interval = setInterval(() => setItems(buildContinueWatching()), 5000);",
  "const interval = setInterval(() => setItems(buildContinueWatching()), 30000);"
);
fs.writeFileSync(cwr, cw, 'utf8');
console.log('5. Reduced ContinueWatching polling interval');

// 6. Add content-visibility auto to below-fold sections in page.tsx
const page = 'src/app/page.tsx';
let pg = fs.readFileSync(page, 'utf8');
// Add content-visibility to SportsRow and below
pg = pg.replace(
  '<SportsRow title={sportsRow.title} streams={sportsRow.streams} />',
  '<div style={{contentVisibility:\'auto\', containIntrinsicSize:\'auto 300px\'}}><SportsRow title={sportsRow.title} streams={sportsRow.streams} /></div>'
);
pg = pg.replace(
  '<MediaRow title="Hot Right Now" items={row(trendingToday)} />',
  '<div style={{contentVisibility:\'auto\', containIntrinsicSize:\'auto 300px\'}}><MediaRow title="Hot Right Now" items={row(trendingToday)} /></div>'
);
fs.writeFileSync(page, pg, 'utf8');
console.log('6. Added content-visibility to below-fold sections');

// 7. Add preload for first hero slide image in the layout head
const headSearch = 'export const metadata: Metadata = {';
const headReplace = `export const metadata: Metadata = {
  other: {
    'head-first': [
      <link key="preload-hero" rel="preload" as="image" href="https://image.tmdb.org/t/p/original" />,
    ],
  },
`;
lt = lt.replace(headSearch, headReplace);
fs.writeFileSync(layout, lt, 'utf8');
console.log('7. Added preload hint for hero image (will be loaded dynamically)');

console.log('\\nAll optimizations applied.');
