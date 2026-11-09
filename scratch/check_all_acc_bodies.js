import fs from 'fs';

const files = [
  'public/views/advanced-search.html',
  'public/views/advanced-search.avto.html',
  'public/views/advanced-search-auctions.html',
  'public/views/advanced-search-auctions.avto.html'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('adv-acc-body')) {
        console.log(`${f}:${i+1} ${l.trim()}`);
      }
    });
  }
}
