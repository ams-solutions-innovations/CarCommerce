import fs from 'fs';

const c = fs.readFileSync('public/views/home.avto.html', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('iskanje') || l.includes('filtri') || l.includes('filter')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
