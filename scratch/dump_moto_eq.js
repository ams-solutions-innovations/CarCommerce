import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

const s = base.indexOf('<div class="moto-only-field" style="display:none;" id="moto-equipment">');
const e = base.indexOf('<!-- ═══ 5. PONUDNIK', s);
const motoEqHtml = base.slice(s, e);
fs.writeFileSync('scratch/moto_equipment_snippet.html', motoEqHtml, 'utf8');
console.log('Saved moto equipment snippet, length:', motoEqHtml.length);
