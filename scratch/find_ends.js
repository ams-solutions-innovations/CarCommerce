import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

const meStart = base.indexOf('<!-- ════ MOTORCYCLE ENGINE');
const meEnd = base.indexOf('</div>\n            </div>\n        </div>', meStart);
console.log('meEnd:', meEnd);
console.log('Snippet at meEnd:');
console.log(base.slice(meEnd - 200, meEnd + 100));

const eqStart = base.indexOf('<div class="moto-only-field" id="moto-equipment"');
if (eqStart === -1) {
  const alt = base.indexOf('id="moto-equipment"');
  console.log('alt eqStart:', alt, base.slice(alt - 50, alt + 100));
}
