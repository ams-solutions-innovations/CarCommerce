import fs from 'fs';

const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

// Let's inspect all <section class="..." id="..."> in both
function getSections(html) {
  const matches = [...html.matchAll(/<section[^>]*id="([^"]+)"[^>]*>/g)];
  return matches.map(m => m[1]);
}

console.log('Sections in base:', getSections(base));
console.log('Sections in avto:', getSections(avto));
