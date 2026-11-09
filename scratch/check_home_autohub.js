import fs from 'fs';

const c = fs.readFileSync('src/pages/home.autohub.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('iskanje') || l.includes('filter') || l.includes('filtri')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
