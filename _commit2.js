const { execSync } = require('child_process');
const cwd = 'C:/Users/clare/Tigerstream';
execSync('git add -A', { cwd });
execSync('git commit -m "perf: lazy-load below-fold rows via Suspense for faster home page"', { cwd });
console.log(execSync('git push --force-with-lease origin feat/improve-season-dropdown', { cwd, encoding: 'utf8' }));