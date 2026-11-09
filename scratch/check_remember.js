import fs from 'fs';

const c = fs.readFileSync('src/pages/advanced-search.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('search_remember') || l.includes('wasRemembered')) {
    console.log(`${i+1}: ${l}`);
  }
});
