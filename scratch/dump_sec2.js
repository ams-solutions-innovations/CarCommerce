import fs from 'fs';
const content = fs.readFileSync('scratch/autohub-references/10/VecFiltrovMoto.dc.html', 'utf8');

const regex = /<section class="card acc[^"]*"[^>]*>([\s\S]*?)<\/section>/g;
const sections = [...content.matchAll(regex)];

console.log('--- SECTION 2 (MOTOR IN POGON) ---');
console.log(sections[1][0]);
