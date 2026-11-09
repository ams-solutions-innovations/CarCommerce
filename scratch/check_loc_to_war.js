import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const locS = avto.indexOf('id="acc-location"');
const warS = avto.indexOf('id="acc-warranty"');
console.log('acc-location at:', locS);
console.log('acc-warranty at:', warS);
console.log('Text between acc-location and acc-warranty:');
console.log(avto.slice(locS + 500, warS + 100));
