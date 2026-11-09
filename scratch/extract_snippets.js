import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

// 1. motoMainGrid & motoSubGrid
const gStart = base.indexOf('id="motoMainGrid"');
const gSubStart = base.indexOf('id="motoSubGrid"');
console.log('gStart:', gStart, 'gSubStart:', gSubStart);

// Let's print from right before motoMainGrid to end of motoSubGrid
const gContainerStart = base.lastIndexOf('<div class="vgrid-wrap', gStart);
console.log('gContainerStart:', gContainerStart);

// Let's inspect motoEngineSection
const meStart = base.indexOf('id="motoEngineSection"');
console.log('motoEngineSection start:', meStart);

// Let's inspect moto-equipment
const eqStart = base.indexOf('id="moto-equipment"');
console.log('moto-equipment start:', eqStart);

// Let's inspect advStickyBar
const sbStart = base.indexOf('id="advStickyBar"');
console.log('advStickyBar start:', sbStart);
