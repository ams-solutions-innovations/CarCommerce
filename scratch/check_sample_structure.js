import fs from 'fs';

const c = fs.readFileSync('src/data/sampleListings.js', 'utf8');
const lines = c.split('\n');
console.log('Sample listings total lines:', lines.length);
console.log('Sample listings preview:', lines.slice(0, 50).join('\n'));
