import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

// 1. Grid
const gridStart = base.indexOf('<div class="vgrid body-type-grid" id="motoMainGrid">');
const subGridEnd = base.indexOf('</div>', base.indexOf('id="motoSubGrid"')) + 6;
console.log('Grid extracted, length:', subGridEnd - gridStart);

// 2. Engine
const motoEngStart = base.indexOf('<!-- ════ MOTORCYCLE ENGINE & DRIVETRAIN');
const motoEngEnd = base.indexOf('</div>\n            </div>\n        </div>\n\n        <!-- ═══ 3. BARVA', motoEngStart);
console.log('Moto engine extracted, length:', motoEngEnd - motoEngStart);

// 3. Equipment
const motoEqStart = base.indexOf('<div id="moto-equipment"');
const motoEqEnd = base.indexOf('</div>\n            </div>\n        </div>\n\n        <!-- ═══ 5. PONUDNIK', motoEqStart);
console.log('Moto equipment extracted, length:', motoEqEnd - motoEqStart);

// 4. Seller
const sellerStart = base.indexOf('<!-- ═══ 5. PONUDNIK IN LOKACIJA');
const sellerEnd = base.indexOf('<!-- ═══ 6. GARANCIJA', sellerStart);
console.log('Seller extracted, length:', sellerEnd - sellerStart);

// 5. Warranty
const warStart = base.indexOf('<!-- ═══ 6. GARANCIJA IN SERVIS');
const warEnd = base.indexOf('<!-- Form Actions', warStart);
console.log('Warranty extracted, length:', warEnd - warStart);
