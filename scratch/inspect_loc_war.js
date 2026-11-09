import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const locS = avto.indexOf('id="acc-location"');
const locE = avto.indexOf('</section>', locS);
console.log('--- ACC-LOCATION IN AVTO ---');
console.log(avto.slice(locS, locE));

const warS = avto.indexOf('id="acc-warranty"');
const warE = avto.indexOf('</section>', warS);
console.log('--- ACC-WARRANTY IN AVTO ---');
console.log(avto.slice(warS, warE));
