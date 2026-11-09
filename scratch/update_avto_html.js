import fs from 'fs';

// Read both files
const avtoOriginal = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');
const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

let avto = avtoOriginal;

// 1. Extract new grid-motorbikes from base
const gmStart = base.indexOf('<div id="grid-motorbikes"');
const gmEnd = base.indexOf('<!-- Gospodarska', gmStart);
if (gmStart === -1 || gmEnd === -1) {
  throw new Error('Could not find grid-motorbikes in base');
}
const newGridMotorbikes = base.slice(gmStart, gmEnd).trim();

// Replace grid-motorbikes in avto
const avtoGmStart = avto.indexOf('<div id="grid-motorbikes"');
const avtoGmEnd = avto.indexOf('<div id="grid-commercial"', avtoGmStart);
if (avtoGmStart === -1 || avtoGmEnd === -1) {
  throw new Error('Could not find grid-motorbikes in avto');
}
avto = avto.slice(0, avtoGmStart) + newGridMotorbikes + '\n\n                    ' + avto.slice(avtoGmEnd);
console.log('1. grid-motorbikes updated');

// 2. In acc-engine:
// Remove old stub moto-only-field in avto if present
avto = avto.replace(/<!-- Motorcycle Specific Fields -->[\s\S]*?<!-- Poraba goriva -->/gi, '<!-- Poraba goriva -->');

// Wrap car-only fields in acc-engine
// The body of acc-engine in avto starts right after `<div class="acc-b adv-acc-body" style="display:none;">`
const engBodyToken = '<div class="acc-b adv-acc-body" style="display:none;">';
const engBodyIdx = avto.indexOf(engBodyToken);
if (engBodyIdx === -1) {
  throw new Error('Could not find acc-b in acc-engine');
}
const engBodyStart = engBodyIdx + engBodyToken.length;
// Find the end of acc-engine section
const engSecEnd = avto.indexOf('</section>', engBodyStart);
// Currently car fields are from engBodyStart to the closing of acc-b
const engAccBEnd = avto.lastIndexOf('</div>', engSecEnd);

const carEngineContent = avto.slice(engBodyStart, engAccBEnd);

// Read the new moto engine snippet
const newMotoEngine = fs.readFileSync('scratch/moto_engine_snippet.html', 'utf8').trim();

// We wrap carEngineContent in <div class="car-only-field"> ... </div> and append newMotoEngine
const newEngineBodyContent = `
                <div class="car-only-field">
${carEngineContent.trim()}
                </div>
                ${newMotoEngine}
            `;

avto = avto.slice(0, engBodyStart) + newEngineBodyContent + avto.slice(engAccBEnd);
console.log('2. acc-engine updated with car-only-field and moto-only-field');

// 3. In acc-equipment:
// Find acc-equipment
const eqToken = 'id="acc-equipment"';
const eqIdx = avto.indexOf(eqToken);
const eqSecEnd = avto.indexOf('</section>', eqIdx);
const eqBodyToken = '<div class="acc-b adv-acc-body">';
const eqBodyIdx = avto.indexOf(eqBodyToken, eqIdx);
const eqBodyStart = eqBodyIdx + eqBodyToken.length;
const eqAccBEnd = avto.lastIndexOf('</div>', eqSecEnd);

const carEquipmentContent = avto.slice(eqBodyStart, eqAccBEnd)
  .replace(/<div class="moto-only-field" id="moto-equipment"[\s\S]*?<\/div>/gi, '');

// Read moto equipment snippet (only lines up to the start of acc-seller)
const fullMotoEq = fs.readFileSync('scratch/moto_equipment_snippet.html', 'utf8');
const motoEqCut = fullMotoEq.indexOf('<!-- ══ 7. SELLER & LOCATION');
const newMotoEqSnippet = (motoEqCut !== -1 ? fullMotoEq.slice(0, motoEqCut) : fullMotoEq).trim();

const newEquipmentBodyContent = `
                <div class="car-only-field">
${carEquipmentContent.trim()}
                </div>
                ${newMotoEqSnippet}
            `;

avto = avto.slice(0, eqBodyStart) + newEquipmentBodyContent + avto.slice(eqAccBEnd);
console.log('3. acc-equipment updated with car-only-field and moto-equipment');

// 4. In acc-location: Add quickCityChips if missing
if (!avto.includes('id="quickCityChips"')) {
  const cityInputToken = '<input type="text" name="city"';
  const cityInputIdx = avto.indexOf(cityInputToken);
  if (cityInputIdx !== -1) {
    const cityInputClose = avto.indexOf('>', cityInputIdx) + 1;
    const quickChipsHtml = `
                        <div class="fl" style="margin-top:8px;font-weight:600;color:#4a5b73;font-size:13px;">Hitra izbira mesta</div>
                        <div class="chips" id="quickCityChips">
                            <button type="button" class="chip on active sm" data-city="Ljubljana"><svg class="i" style="width:14px;height:14px"><use href="#i-check"></use></svg> Ljubljana</button>
                            <button type="button" class="chip sm" data-city="Maribor">Maribor</button>
                            <button type="button" class="chip sm" data-city="Celje">Celje</button>
                            <button type="button" class="chip sm" data-city="Koper">Koper</button>
                            <button type="button" class="chip sm" data-city="Kranj">Kranj</button>
                            <button type="button" class="chip sm" data-city="Novo mesto">Novo mesto</button>
                        </div>`;
    avto = avto.slice(0, cityInputClose) + quickChipsHtml + avto.slice(cityInputClose);
    console.log('4. quickCityChips added to acc-location');
  }
}

// 5. In acc-warranty: Add trow cards with switches
if (!avto.includes('class="trow"')) {
  const warBodyToken = 'id="acc-warranty"';
  const warIdx = avto.indexOf(warBodyToken);
  const warBodyStart = avto.indexOf('<div class="acc-b adv-acc-body">', warIdx);
  if (warBodyStart !== -1) {
    const warBodyInnerStart = warBodyStart + '<div class="acc-b adv-acc-body">'.length;
    const trowCardsHtml = `
                <div class="g3" style="width:100%;margin-bottom:14px;">
                    <div class="trow">
                        <span class="ti"><svg class="i"><use href="#i-book"></use></svg></span>
                        <b>Servisna knjiga potrjena</b>
                        <button type="button" class="sw on" role="switch" aria-checked="true" aria-label="Servisna knjiga potrjena" style="margin-left:auto">
                            <input type="checkbox" name="history" value="ServiceBook" class="remember-check" checked style="position:absolute;inset:0;opacity:0;cursor:pointer;">
                        </button>
                    </div>
                    <div class="trow">
                        <span class="ti"><svg class="i"><use href="#i-shield"></use></svg></span>
                        <b>Z garancijo</b>
                        <button type="button" class="sw" role="switch" aria-checked="false" aria-label="Z garancijo" style="margin-left:auto">
                            <input type="checkbox" name="warranty" value="Warranty" class="remember-check" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
                        </button>
                    </div>
                    <div class="trow">
                        <span class="ti"><svg class="i"><use href="#i-wind"></use></svg></span>
                        <b>Nekadilsko vozilo</b>
                        <button type="button" class="sw" role="switch" aria-checked="false" aria-label="Nekadilsko vozilo" style="margin-left:auto">
                            <input type="checkbox" name="history" value="NonSmoker" class="remember-check" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
                        </button>
                    </div>
                </div>`;
    avto = avto.slice(0, warBodyInnerStart) + trowCardsHtml + avto.slice(warBodyInnerStart);
    console.log('5. trow cards with switches added to acc-warranty');
  }
}

// 6. Sticky Mobile Action Bar
if (!avto.includes('id="advStickyBar"')) {
  const formEndIdx = avto.lastIndexOf('</form>');
  if (formEndIdx !== -1) {
    const stickyHtml = `
    <!-- Sticky Mobile Action Bar -->
    <div id="advStickyBar" class="sticky-mobile-bar">
        <button type="button" class="btn-sticky btn-cta" id="advStickySubmit">
            Prikaži oglase
        </button>
    </div>
`;
    avto = avto.slice(0, formEndIdx + 7) + stickyHtml + avto.slice(formEndIdx + 7);
    console.log('6. advStickyBar added after </form>');
  }
}

fs.writeFileSync('public/views/advanced-search.avto.html', avto, 'utf8');
console.log('Successfully updated public/views/advanced-search.avto.html!');
