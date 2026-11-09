import fs from 'fs';

const c = fs.readFileSync('src/pages/advanced-search.js', 'utf8');
const lines = c.split('\n');

console.log('Searching in src/pages/advanced-search.js...');
lines.forEach((l, i) => {
  if (
    l.includes('click()') ||
    l.includes('acc-engine') ||
    l.includes('trigger') ||
    l.includes('open') ||
    l.includes('expanded') ||
    l.includes('display')
  ) {
    if (
      l.includes('acc') ||
      l.includes('engine') ||
      l.includes('expand') ||
      l.includes('toggle') ||
      l.includes('click') ||
      l.includes('motor')
    ) {
      console.log(`${i + 1}: ${l.trim()}`);
    }
  }
});
