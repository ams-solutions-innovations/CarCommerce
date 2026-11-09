import fs from 'fs';

const content = fs.readFileSync('src/pageController.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('advanced-search') || l.includes('advancedSearch') || l.includes('iskanje')) {
    console.log(`${i + 1}: ${l}`);
  }
});
