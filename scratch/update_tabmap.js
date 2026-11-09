import fs from 'fs';

let code = fs.readFileSync('src/pages/advanced-search.js', 'utf8');

code = code.replace(
  "cat: params.get('cat') || '',",
  "cat: (params.get('cat') === 'motor' ? 'moto' : params.get('cat')) || '',"
);

code = code.replace(
  "const tabMap = { 'avto': 'avto', 'moto': 'moto', 'gospodarska': 'gospodarska', 'prosti-cas': 'prosti-cas' };",
  "const tabMap = { 'avto': 'avto', 'moto': 'moto', 'motor': 'moto', 'gospodarska': 'gospodarska', 'prosti-cas': 'prosti-cas' };"
);

fs.writeFileSync('src/pages/advanced-search.js', code, 'utf8');
console.log('Updated tabMap in src/pages/advanced-search.js');
