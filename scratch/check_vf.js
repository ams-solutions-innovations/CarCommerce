import fs from 'fs';

const c = fs.readFileSync('scratch/autohub-references/09/VecFiltrov.dc.html', 'utf8');
console.log(c.slice(0, 1500));
