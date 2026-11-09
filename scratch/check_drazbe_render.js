import fs from 'fs';

const c = fs.readFileSync('src/pages/drazbe.js', 'utf8');
const lines = c.split('\n');
console.log(lines.slice(35, 120).join('\n'));
