import fs from 'fs';

const c = fs.readFileSync('src/pages/advanced-search.js', 'utf8');
const lines = c.split('\n');
console.log(lines.slice(600, 750).join('\n'));
