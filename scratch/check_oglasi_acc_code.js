import fs from 'fs';

const c = fs.readFileSync('src/pages/oglasi.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('adv-acc') || l.includes('sidebarCollapseAllBtn')) {
    console.log(`${i + 1}: ${l}`);
  }
});
