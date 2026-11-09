import fs from 'fs';

console.log('=== public/views/drazbe.html ===');
const d = fs.readFileSync('public/views/drazbe.html', 'utf8');
console.log(d.slice(0, 800));

console.log('\n=== public/views/advanced-search-auctions.avto.html ===');
const a = fs.readFileSync('public/views/advanced-search-auctions.avto.html', 'utf8');
console.log(a.slice(0, 800));
