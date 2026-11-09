import fs from 'fs';

const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

console.log('base has advStickyBar:', base.includes('id="advStickyBar"'));
console.log('avto has advStickyBar:', avto.includes('id="advStickyBar"'));
console.log('base has wltpSlider:', base.includes('wltpSlider'));
console.log('avto has wltpSlider:', avto.includes('wltpSlider'));
console.log('base has motoMainGrid:', base.includes('id="motoMainGrid"'));
console.log('avto has motoMainGrid:', avto.includes('id="motoMainGrid"'));
console.log('base has #motoCylChips:', base.includes('id="motoCylChips"'));
console.log('avto has #motoCylChips:', avto.includes('id="motoCylChips"'));
console.log('base has #motoSubGrid:', base.includes('id="motoSubGrid"'));
console.log('avto has #motoSubGrid:', avto.includes('id="motoSubGrid"'));
