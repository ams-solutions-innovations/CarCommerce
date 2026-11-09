import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');
const matches = [...base.matchAll(/<([a-z0-9]+)[^>]*id="(acc-[^"]+)"[^>]*>/gi)];
console.log('base acc matches:', matches.map(m => `<${m[1]} id="${m[2]}">`));
