import fs from 'fs';

const html = fs.readFileSync('dist-avto/views/advanced-search.avto.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(274, 290).join('\n'));
