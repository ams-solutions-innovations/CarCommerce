import fs from 'fs';

const content = fs.readFileSync('src/pages/advanced-search.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('autohub') || l.includes('prepareAutoHub')) {
    console.log(`${i + 1}: ${l}`);
  }
});
