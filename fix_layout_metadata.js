const fs = require('fs');
const p = 'src/app/layout.tsx';
let c = fs.readFileSync(p, 'utf8');

const oldText = `export const metadata: Metadata = {
  other: {
    'head-first': [
      <link key="preload-hero" rel="preload" as="image" href="https://image.tmdb.org/t/p/original" />,
    ],
  },

  metadataBase: new URL(getSiteUrl()),`;

const newText = `export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),`;

if (c.includes(oldText)) {
  c = c.replace(oldText, newText);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Fixed layout metadata');
} else {
  console.log('Pattern not found');
}
