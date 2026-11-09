import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');
console.log('has id="make":', avto.includes('id="make"'));
console.log('has id="model":', avto.includes('id="model"'));
console.log('has id="variant":', avto.includes('id="variant"'));
console.log('has id="bodyTypeHidden":', avto.includes('id="bodyTypeHidden"'));
console.log('has id="searchBtn":', avto.includes('id="searchBtn"'));
console.log('has id="advStickySubmit":', avto.includes('id="advStickySubmit"'));
