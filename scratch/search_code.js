import fs from 'fs';
const content = fs.readFileSync('src/pages/advanced-search.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('moto-cylinders') || l.includes('cylinder') || l.includes('cylFilter') || l.includes('stroke') || l.includes('a2Eligible') || l.includes('motoDrivetrain')) {
    console.log(`${idx+1}: ${l}`);
  }
});
