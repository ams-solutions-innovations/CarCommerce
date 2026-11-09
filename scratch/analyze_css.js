import fs from 'fs';
const css = fs.readFileSync('scratch/ref10_styles.css', 'utf8');

// List selectors
const selectors = [...css.matchAll(/([^{}]+)\{/g)].map(m => m[1].trim()).filter(s => !s.startsWith('@'));
console.log('Total rules:', selectors.length);
console.log('Sample selectors:', selectors.slice(0, 40).join(', '));
