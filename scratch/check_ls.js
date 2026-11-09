import fs from 'fs';

for (const f of ['src/pages/advanced-search.js', 'src/components/autohub/advancedSearch.js', 'src/pages/oglasi.js']) {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('localStorage')) {
      console.log(`${f}:${i+1} ${l.trim()}`);
    }
  });
}
