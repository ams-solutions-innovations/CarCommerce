import fs from 'fs';

const c = fs.readFileSync('public/views/oglasi.html', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('iskanje') || l.includes('Napredno')) {
    console.log(`${i+1}: ${l}`);
  }
});
