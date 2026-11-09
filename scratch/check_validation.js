import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const requiredMatches = [...avto.matchAll(/<[^>]*(required|min=|max=|pattern=)[^>]*>/gi)];
console.log('Validation attributes in avto.html:');
requiredMatches.forEach(m => console.log(m[0]));
