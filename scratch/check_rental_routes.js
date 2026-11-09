import fs from 'fs';

const routerContent = fs.readFileSync('src/router.js', 'utf8');
const lines = routerContent.split('\n');
lines.forEach((l, i) => {
  if (l.includes('najem') || l.includes('rent')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
