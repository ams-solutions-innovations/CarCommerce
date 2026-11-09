import fs from 'fs';

const c = fs.readFileSync('src/data/sampleListings.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('rental') || l.includes('listingType') || l.includes('isRental')) {
    console.log(`${i+1}: ${l}`);
  }
});
