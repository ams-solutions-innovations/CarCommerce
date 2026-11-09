import fs from 'fs';

const c = fs.readFileSync('src/pages/advanced-search.js', 'utf8');
const lines = c.split('\n');
lines.slice(1150).forEach((l, i) => {
  const lineNum = 1150 + i + 1;
  if (l.includes('acc-') || l.includes('accordion') || l.includes('persistent-open') || l.includes('display:flex') || l.includes("display = 'flex'")) {
    console.log(`${lineNum}: ${l}`);
  }
});
