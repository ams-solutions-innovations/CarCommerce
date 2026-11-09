import fs from 'fs';
const content = fs.readFileSync('scratch/autohub-references/10/VecFiltrovMoto.dc.html', 'utf8');

const regex = /<section class="card acc[^"]*"[^>]*>([\s\S]*?)<\/section>/g;
const sections = [...content.matchAll(regex)];

console.log('--- SECTION 1 (PART 3 - CENA, LETNIK, KM) ---');
console.log(sections[0][0].slice(5500));
