import fs from 'fs';

for (const f of ['public/views/home.avto.html', 'public/views/home.html', 'src/pages/home.js', 'src/components/header.js']) {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('iskanje') || l.includes('filtri') || l.includes('filter')) {
        console.log(`${f}:${i+1} ${l.trim()}`);
      }
    });
  }
}
