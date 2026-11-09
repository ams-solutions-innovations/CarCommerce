import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

function findSnippet(str, startRegex, endRegex) {
  const s = str.search(startRegex);
  if (s === -1) return 'NOT FOUND';
  const sub = str.slice(s);
  const e = sub.search(endRegex);
  if (e === -1) return sub.slice(0, 1000);
  return sub.slice(0, e + 50);
}

console.log('--- MOTO GRID IN AVTO ---');
console.log(findSnippet(avto, /id="motoMainGrid"/, /<\/div>\s*<\/div>/));

console.log('--- MOTO ENGINE IN AVTO ---');
console.log(findSnippet(avto, /id="motoEngineSection"/, /<\/div>\s*<\/div>/));
