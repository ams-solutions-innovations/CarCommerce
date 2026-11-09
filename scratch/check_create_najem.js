import fs from 'fs';

const c = fs.readFileSync('src/pages/create-listing.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('rental') || l.includes('najem')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
