import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const s = avto.indexOf('id="grid-motorbikes"');
if (s !== -1) {
  console.log(avto.slice(s - 100, s + 1500));
} else {
  console.log('grid-motorbikes NOT found in avto');
}
