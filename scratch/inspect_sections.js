import fs from 'fs';
const content = fs.readFileSync('scratch/autohub-references/10/VecFiltrovMoto.dc.html', 'utf8');

const regex = /<section class="card acc[^"]*"[^>]*>([\s\S]*?)<\/section>/g;
const sections = [...content.matchAll(regex)];

console.log('\n--- SECTION 4 (OPREMA) SECOND HALF ---');
console.log(sections[3][0].slice(1500));
