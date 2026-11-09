import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const s = avto.indexOf('id="acc-engine"');
if (s !== -1) {
  console.log(avto.slice(s, s + 3500));
} else {
  console.log('acc-engine not found');
}
