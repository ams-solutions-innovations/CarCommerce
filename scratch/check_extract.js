import fs from 'fs';
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

// Section 1: grid-motorbikes
const gmStart = base.indexOf('<div id="grid-motorbikes"');
const gmEnd = base.indexOf('<!-- Category Grid: Gospodarska vozila -->', gmStart);
console.log('grid-motorbikes length:', gmEnd - gmStart);

// Section 2: moto engine block inside acc-engine
const meStart = base.indexOf('<!-- ════ MOTORCYCLE ENGINE & DRIVETRAIN (1:1 with VecFiltrovMoto.dc.html) ════ -->');
const meEnd = base.indexOf('</div>\n            </div>\n        </div>\n\n        <!-- ═══ 3. BARVA IN ZUNANJOST', meStart);
console.log('moto engine block start:', meStart, 'end:', meEnd);

// Section 3: moto equipment block
const eqStart = base.indexOf('<div id="moto-equipment"');
const eqEnd = base.indexOf('</div>\n            </div>\n        </div>\n\n        <!-- ═══ 5. PONUDNIK', eqStart);
console.log('moto equipment block start:', eqStart, 'end:', eqEnd);

// Section 4: sticky bar
const sbStart = base.indexOf('<div id="advStickyBar"');
const sbEnd = base.indexOf('</div>\n</div>', sbStart);
console.log('sticky bar start:', sbStart, 'end:', sbEnd);
