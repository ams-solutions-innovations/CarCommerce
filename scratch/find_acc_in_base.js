import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

const matches = [...base.matchAll(/id="acc-[^"]+"/g)];
matches.forEach(m => {
  const idx = m.index;
  console.log(m[0], 'at', idx, base.slice(idx - 60, idx + 80).replace(/\n/g, ' '));
});
