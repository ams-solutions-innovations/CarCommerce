import fs from 'fs';

const c = fs.readFileSync('src/services/advancedSearchFilters.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('prepareAutoHub') || l.includes('open') || l.includes('accordion') || l.includes('acc-engine') || l.includes('1024')) {
    console.log(`${i + 1}: ${l}`);
  }
});
