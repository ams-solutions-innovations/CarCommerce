import fs from 'fs';

const html = fs.readFileSync('dist-avto/views/advanced-search.avto.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('acc-engine') || l.includes('persistent-open') || l.includes('Osnovni podatki')) {
    console.log(`${i+1}: ${l}`);
  }
});
