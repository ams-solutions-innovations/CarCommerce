import fs from 'fs';

const c = fs.readFileSync('src/pages/drazbe.js', 'utf8');
console.log(c.slice(0, 1500));
