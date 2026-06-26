const fs = require('fs');

const NL = '\r\n';

// Fix 1: VideasyPlayer - add fullscreen compatibility attributes
const vp = 'src/components/VideasyPlayer.tsx';
let vc = fs.readFileSync(vp, 'utf8');

const search = `        allowFullScreen${NL}        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"`;
const replace = `        allowFullScreen${NL}        webkitAllowFullScreen${NL}        mozAllowFullScreen${NL}        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"`;

if (vc.includes(search)) {
  vc = vc.replace(search, replace);
  fs.writeFileSync(vp, vc, 'utf8');
  console.log('Fixed VideasyPlayer fullscreen');
} else {
  console.log('VideasyPlayer: pattern not found!');
}

// Fix 2: PeachifyPlayer - add animation and fadeIn styling
const pp = 'src/components/PeachifyPlayer.tsx';
let pc = fs.readFileSync(pp, 'utf8');

// Add fade-in animation to PeachifyPlayer container
const search2 = `  return (${NL}    <div className={className} data-peachify-player>${NL}      <iframe`;
const replace2 = `  return (${NL}    <div className={\`\${className} animate-fadeIn\`} data-peachify-player>${NL}      <iframe`;

if (pc.includes(search2)) {
  pc = pc.replace(search2, replace2);
  fs.writeFileSync(pp, pc, 'utf8');
  console.log('Added animation class to PeachifyPlayer');
} else {
  console.log('PeachifyPlayer: pattern not found!');
}

// Fix 3: Add fadeIn tailwind utility to globals.css
const gc = 'src/app/globals.css';
let gcc = fs.readFileSync(gc, 'utf8');
if (!gcc.includes('@keyframes fadeIn')) {
  gcc = gcc.replace('@tailwind utilities;', '@tailwind utilities;' + NL + NL + '@layer utilities {' + NL + '  .animate-fadeIn {' + NL + '    animation: fadeIn 0.3s ease-out both;' + NL + '  }' + NL + '}' + NL + NL + '@keyframes fadeIn {' + NL + '  from { opacity: 0; transform: translateY(8px); }' + NL + '  to { opacity: 1; transform: translateY(0); }' + NL + '}' + NL);
  fs.writeFileSync(gc, gcc, 'utf8');
  console.log('Added fadeIn keyframes and utility class to globals.css');
} else {
  console.log('fadeIn keyframes already exist');
}

