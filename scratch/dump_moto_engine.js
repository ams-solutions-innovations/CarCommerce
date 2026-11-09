import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

const s = base.indexOf('<!-- ════ MOTORCYCLE ENGINE');
const e = base.indexOf('<!-- ══ 4. EXTERIOR', s);
const motoEngineHtml = base.slice(s, e);
fs.writeFileSync('scratch/moto_engine_snippet.html', motoEngineHtml, 'utf8');
console.log('Saved moto engine snippet, length:', motoEngineHtml.length);
