import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const s = avto.indexOf('id="moto-cylinders"');
console.log(avto.slice(s - 50, s + 400));
