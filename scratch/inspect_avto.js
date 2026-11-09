import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

console.log('avto length:', avto.length);
console.log('avto first 500 chars:');
console.log(avto.slice(0, 500));
console.log('---');
console.log('avto last 500 chars:');
console.log(avto.slice(-500));
