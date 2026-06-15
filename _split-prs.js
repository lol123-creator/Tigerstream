const { execSync } = require('child_process');
const fs = require('fs');
const cwd = 'C:/Users/clare/Tigerstream';
const PAT = fs.readFileSync('C:/Users/clare/Downloads/pat.txt', 'utf8').trim();
const REPO = 'lol123-creator/Tigerstream';

function run(cmd) {
  return execSync(cmd, { cwd, encoding: 'utf8' }).trim();
}

async function createPR(title, body, head, base) {
  const payload = JSON.stringify({ title, body, head, base });
  const cmd = `curl -s -X POST -H "Authorization: token ${PAT}" -H "Accept: application/vnd.github.v3+json" -d '${payload.replace(/'/g, "\\'")}' https://api.github.com/repos/${REPO}/pulls`;
  const result = run(cmd);
  const pr = JSON.parse(result);
  if (pr.html_url) return pr.html_url;
  return 'Error: ' + (pr.message || JSON.stringify(pr).slice(0, 200));
}

// Feature descriptions
const features = [
  {
    branch: 'fix/back-button-position',
    base: 'main',
    title: 'fix: push back button below the fixed navbar on detail pages',
    body: `## Problem\nThe Back button on movie and TV detail pages was positioned at \`pt-4\` (16px), which placed it behind the fixed navbar (~56px tall) on desktop and mobile.\n\n## Fix\nChanged the top padding from \`pt-4\` to \`pt-20\` (80px) on both \`/movie/[id]\` and \`/tv/[id]\` detail pages so the button sits below the navbar.`,
    files: ['src/app/movie/[id]/page.tsx', 'src/app/tv/[id]/page.tsx'],
    commit: '10756ca',
  },
  {
    branch: 'feat/return-path-navigation',
    base: 'main',
    title: 'feat: return-path navigation for the Back button',
    body: `## Why\nWhen navigating from the home page, search results, or browse pages to a movie/TV detail page, the Back button used \`router.back()\` which relies on browser history. This can be unreliable with Next.js App Router soft navigation.\n\n## What changed\n- **BackButton.tsx** — Added sessionStorage-based return path tracking\n- **MediaCard.tsx** — Cards save the originating page on click\n- **Hero.tsx** — "More Info" link saves the originating page\n- **SearchDropdown.tsx** — Search result links save the originating page`,
    files: ['src/components/BackButton.tsx', 'src/components/MediaCard.tsx', 'src/components/Hero.tsx', 'src/components/SearchDropdown.tsx'],
    commit: '1ab7520',
  },
  {
    branch: 'feat/favorites-and-ux',
    base: 'feat/return-path-navigation',
    title: 'feat: favorites, scroll-to-top, search shortcut, footer, quality fix',
    body: `## New Features\n\n### Favorites / Watchlist\n- Heart icon on every movie/TV card\n- "Save" button on detail pages\n- New /favorites page showing all saved titles\n- "My List" link in the navbar\n- All data stored in localStorage\n\n### Scroll to Top\n- Floating amber button appears after scrolling 400px\n\n### Keyboard Shortcut\n- Press / to focus the search bar\n\n### Better Footer\n- Navigation links for all sections\n\n### Quality Poll Fix\n- Reduced API polling from 5 min to 30 min`,
    files: [
      'src/lib/favorites-client.ts', 'src/components/FavoriteButton.tsx',
      'src/components/ScrollToTop.tsx', 'src/app/favorites/page.tsx',
      'src/app/layout.tsx', 'src/app/movie/[id]/page.tsx',
      'src/app/tv/[id]/page.tsx', 'src/components/MediaCard.tsx',
      'src/components/Navbar.tsx', 'src/components/QualityBadge.tsx',
      'src/components/SearchDropdown.tsx',
    ],
    commit: '7160e96',
  },
  {
    branch: 'perf/lazy-home-page',
    base: 'main',
    title: 'perf: lazy-load below-fold rows on home page',
    body: `## Problem\nThe home page fired 22 parallel API calls via Promise.all, meaning nothing rendered until ALL completed.\n\n## Fix\nSplit into two tiers:\n- **Above the fold** (5 calls): Hero, Continue Watching, Sports, Hot Right Now, New Movies, New TV Series\n- **Below the fold** (17 calls): Trending, Popular, Top Rated, genre rows, Anime — wrapped in Suspense with skeleton placeholders\n\nFaster perceived load time since users see content immediately.`,
    files: ['src/app/page.tsx', 'src/components/HomeMoreRows.tsx', 'src/components/HomeMoreRowsSkeleton.tsx'],
    commit: 'd757b8a',
  },
];

(async () => {
  for (const f of features) {
    console.log(`\n=== ${f.branch} ===`);

    // Create branch from base
    run(`git checkout ${f.base}`);
    try { run(`git branch -D ${f.branch}`); } catch(e) {}
    run(`git checkout -b ${f.branch}`);

    // Checkout files from the feature commit
    for (const file of f.files) {
      try {
        run(`git checkout ${f.commit} -- "${file}"`);
      } catch (e) {
        console.log(`  (new file) ${file}`);
        try {
          run(`git checkout ${f.commit}^:${file} 2>/dev/null || git show ${f.commit}:${file} > ${file}`);
        } catch (e2) {
          console.log(`  WARN: could not get ${file}`);
        }
      }
    }

    // Check if there are changes to commit
    const status = run('git status --porcelain');
    if (status) {
      run('git add -A');
      run(`git commit -m "${f.title}"`);
      run(`git push -u origin ${f.branch}`);
      console.log(`  pushed!`);

      // Create PR
      const url = await createPR(f.title, f.body, f.branch, f.base);
      console.log(`  PR: ${url}`);
    } else {
      console.log('  no changes, skipping');
    }
  }

  // Go back to original branch
  run('git checkout feat/improve-season-dropdown');
  console.log('\nAll done!');
})();
