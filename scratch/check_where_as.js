import fs from 'fs';

for (const f of ['src/pages/advanced-search.js', 'src/pages/advanced-search.navtika.js', 'src/pages/oglasi.js', 'src/pages/oglasi.navtika.js']) {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('advancedSearch') || c.includes('prepareAutoHub')) {
      console.log(`Found in ${f}`);
    }
  }
}
