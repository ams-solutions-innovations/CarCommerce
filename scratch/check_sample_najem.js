import fs from 'fs';

for (const f of ['src/data/sampleListings.js', 'src/services/listingService.js']) {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('najem') || l.includes('rental') || l.includes('rent') || l.includes('price_per_day')) {
        console.log(`${f}:${i+1} ${l.trim()}`);
      }
    });
  }
}
