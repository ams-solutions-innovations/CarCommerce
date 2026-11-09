import fs from 'fs';

const c = fs.readFileSync('src/pages/home.autohub.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('searchParams') || l.includes('function searchParams') || l.includes('const searchParams')) {
    console.log(`${i+1}: ${l}`);
  }
});
