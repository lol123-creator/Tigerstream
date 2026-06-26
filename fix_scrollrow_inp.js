const fs = require('fs');
const NL = '\r\n';
let c = fs.readFileSync('src/components/ScrollRow.tsx', 'utf8');

const oldOverlay = [
  'didDrag.current = true;',
  '        const overlay = document.createElement(\'div\');',
  '        overlay.setAttribute(\'data-drag-overlay\', \'\');',
  '        overlay.style.cssText =',
  '          \'position:absolute;inset:0;z-index:20;cursor:grabbing;pointer-events:auto;\';',
  '        el.style.position = \'relative\';',
  '        el.appendChild(overlay);',
].join(NL);

const newOverlay = [
  'didDrag.current = true;',
  '        el.style.outline = \'2px solid rgba(255,255,255,0.05)\';',
  '        el.style.outlineOffset = \'-2px\';',
].join(NL);

if (c.includes(oldOverlay)) {
  c = c.replace(oldOverlay, newOverlay);
  console.log('Replaced overlay creation with outline');
} else {
  console.log('Overlay pattern not found, trying alternatives');
  // try with \n only
  const altOld = oldOverlay.replace(/\r/g, '');
  if (c.includes(altOld)) {
    c = c.replace(altOld, newOverlay.replace(/\r/g, ''));
    console.log('Replaced using LF pattern');
  }
}

const oldRemove = [
  'const overlay = el.querySelector(\'[data-drag-overlay]\');',
  '      if (overlay) overlay.remove();',
].join(NL);

const newRemove = [
  'el.style.outline = \'\';',
  '      el.style.outlineOffset = \'\';',
].join(NL);

if (c.includes(oldRemove)) {
  c = c.replace(oldRemove, newRemove);
  console.log('Replaced overlay removal');
} else {
  const altOld = oldRemove.replace(/\r/g, '');
  if (c.includes(altOld)) {
    c = c.replace(altOld, newRemove.replace(/\r/g, ''));
    console.log('Replaced removal using LF pattern');
  }
}

fs.writeFileSync('src/components/ScrollRow.tsx', c, 'utf8');
console.log('ScrollRow INP fix applied');
