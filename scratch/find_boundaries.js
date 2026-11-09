import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

function findBetween(str, startToken, endToken) {
  const s = str.indexOf(startToken);
  if (s === -1) return { found: false, s, e: -1 };
  const e = str.indexOf(endToken, s + startToken.length);
  return { found: true, s, e, length: e - s };
}

console.log('grid-motorbikes:', findBetween(base, '<div id="grid-motorbikes"', '<div id="grid-commercial"'));
console.log('moto engine:', findBetween(base, '<!-- ════ MOTORCYCLE ENGINE & DRIVETRAIN', '<!-- ═══ 3. BARVA'));
console.log('moto-equipment:', findBetween(base, 'id="moto-equipment"', '<!-- ═══ 5. PONUDNIK'));
console.log('acc-seller:', findBetween(base, '<!-- ═══ 5. PONUDNIK', '<!-- ═══ 6. GARANCIJA'));
console.log('acc-warranty:', findBetween(base, '<!-- ═══ 6. GARANCIJA', '<!-- Form Actions (Submit / Reset)'));
