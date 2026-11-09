import fs from 'fs';

const c = fs.readFileSync('dist/assets/advanced-search-BPtpz7qh.js', 'utf8');
console.log(c.slice(0, 1500));
