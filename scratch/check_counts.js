import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');
const pTo = [...avto.matchAll(/name="powerTo"/g)];
const pFrom = [...avto.matchAll(/name="powerFrom"/g)];
console.log('powerTo matches:', pTo.length);
console.log('powerFrom matches:', pFrom.length);
