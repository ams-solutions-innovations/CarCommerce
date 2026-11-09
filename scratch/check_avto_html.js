import fs from 'fs';

const c = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('acc-engine') || (i >= 260 && i <= 320)) {
    console.log(`${i + 1}: ${l}`);
  }
});
