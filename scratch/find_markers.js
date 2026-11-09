import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

function logAround(query) {
  const i = base.indexOf(query);
  console.log(`=== Query: "${query}" === (index: ${i})`);
  if (i !== -1) {
    console.log(base.slice(i, i + 300));
  }
}

logAround('MOTORCYCLE ENGINE');
logAround('moto-equipment');
logAround('quickCityChips');
logAround('Nekadilsko');
