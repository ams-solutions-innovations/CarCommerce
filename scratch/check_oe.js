import fs from 'fs';

const c = fs.readFileSync('dist/assets/advanced-search-BPtpz7qh.js', 'utf8');
// Find where oe (the function containing prepareAutoHubAdvancedSearch) is called
const idx = c.indexOf('function oe()');
if (idx !== -1) {
  console.log('Found function oe() at ' + idx);
  console.log(c.slice(idx, idx + 400));
}

// Find references to oe
const matches = [...c.matchAll(/\boe\b/g)];
console.log('Matches for oe:', matches.length);
matches.forEach(m => {
  const start = Math.max(0, m.index - 50);
  const end = Math.min(c.length, m.index + 50);
  console.log('Ref:', c.slice(start, end).replace(/\n/g, ' '));
});
