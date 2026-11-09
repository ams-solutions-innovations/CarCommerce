import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

console.log('--- MOTO GRID AREA (11900 to 12300) ---');
console.log(base.slice(11900, 12500));

console.log('--- SUBGRID AREA (20200 to 22000) ---');
console.log(base.slice(20200, 22200));

// Let's find where moto-only-field occurs in #acc-engine
const accEngineStart = base.indexOf('id="acc-engine"');
const accEngineEnd = base.indexOf('id="acc-exterior"');
console.log('--- ACC-ENGINE AREA ---');
const engineText = base.slice(accEngineStart, accEngineEnd);
const motoMatches = [...engineText.matchAll(/class="[^"]*moto-only-field[^"]*"/g)];
console.log('moto-only-field matches in acc-engine:', motoMatches.length);
if (motoMatches.length > 0) {
  const firstMoto = engineText.indexOf('moto-only-field');
  console.log(engineText.slice(firstMoto - 100, firstMoto + 800));
}
