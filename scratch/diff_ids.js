import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

// What ids are in avto that are not in base?
const avtoIds = [...avto.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const baseIds = new Set([...base.matchAll(/id="([^"]+)"/g)].map(m => m[1]));

const onlyInAvto = avtoIds.filter(id => !baseIds.has(id));
console.log('IDs only in avto:', [...new Set(onlyInAvto)]);

// What ids are in base that are not in avto?
const baseIdsArray = [...base.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const avtoIdsSet = new Set(avtoIds);
const onlyInBase = baseIdsArray.filter(id => !avtoIdsSet.has(id));
console.log('IDs only in base:', [...new Set(onlyInBase)]);
