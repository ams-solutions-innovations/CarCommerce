import fs from 'fs';

const c = fs.readFileSync('src/services/listingService.js', 'utf8');
const lines = c.split('\n');
console.log(lines.slice(200, 300).join('\n'));
