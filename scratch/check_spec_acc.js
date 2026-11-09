import fs from 'fs';

const c = fs.readFileSync('tests/e2e/autohub-advanced-search.spec.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('acc') || l.includes('trigger') || l.includes('open') || l.includes('click')) {
    console.log(`${i+1}: ${l}`);
  }
});
