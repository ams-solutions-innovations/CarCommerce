import fs from 'fs';

const files = ['public/views/oglasi.html', 'src/pages/oglasi.js', 'src/pages/home.js', 'public/views/home.avto.html'];
for (const f of files) {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.toLowerCase().includes('filter') || l.toLowerCase().includes('filtri') || l.includes('acc-') || l.includes('accordion')) {
        if (l.includes('motor') || l.includes('engine') || l.includes('open') || l.includes('pogon')) {
          console.log(`${f}:${i+1} ${l.trim()}`);
        }
      }
    });
  }
}
