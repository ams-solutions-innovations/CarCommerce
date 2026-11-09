import fs from 'fs';

let base = fs.readFileSync('public/views/advanced-search.html', 'utf8');

// Target 1: Transmission / Consumption / A2 grid
const oldBlock1 = `<div class="adv-grid-2">
                    <div class="adv-field-group">
                        <label class="adv-label">Menjalnik</label>
                        <select name="transmission" class="glass-select" data-no-search="true">
                            <option value="">Vsi menjalniki</option>
                            <option value="Ročni">Ročni</option>
                            <option value="Avtomatski">Avtomatski</option>
                            <option value="Polavtomatski">Polavtomatski</option>
                        </select>
                    </div>
                    <div class="adv-field-group car-only-field">
                        <label class="adv-label">Poraba goriva do (L/100 km)</label>
                        <input type="number" name="consumptionTo" placeholder="npr. 6.0" step="0.1"
                            class="adv-input">
                    </div>
                    <div class="adv-field-group moto-only-field adv-a2-cell" style="display:none;">
                        <label class="adv-label">A2 izpit</label>
                        <div class="adv-a2-pill-wrap">
                            <div class="unit-toggle-pill" id="advA2Toggle">
                                <button type="button" class="unit-btn active" data-a2="all">Vse</button>
                                <button type="button" class="unit-btn" data-a2="yes">Samo A2</button>
                            </div>
                            <input type="hidden" name="a2Eligible" id="a2EligibleInput" value="">
                        </div>
                    </div>
                </div>`;

const newBlock1 = `<div class="adv-grid-2 adv-engine-row">
                    <div class="adv-field-group">
                        <label class="adv-label">Menjalnik</label>
                        <select name="transmission" class="glass-select" data-no-search="true">
                            <option value="">Vsi menjalniki</option>
                            <option value="Ročni">Ročni</option>
                            <option value="Avtomatski">Avtomatski</option>
                            <option value="Polavtomatski">Polavtomatski</option>
                        </select>
                    </div>
                    <div class="adv-field-group car-only-field">
                        <label class="adv-label">Poraba goriva do (L/100 km)</label>
                        <input type="number" name="consumptionTo" placeholder="npr. 6.0" step="0.1"
                            class="adv-input">
                    </div>
                    <div class="adv-field-group moto-only-field" style="display:none;">
                        <label class="adv-label">Takt motorja</label>
                        <select name="stroke" class="glass-select" data-no-search="true">
                            <option value="">Vsi takti</option>
                            <option value="2T">2-taktni</option>
                            <option value="4T">4-taktni</option>
                        </select>
                    </div>
                    <div class="adv-field-group moto-only-field adv-a2-cell" style="display:none;">
                        <label class="adv-label">A2 izpit</label>
                        <div class="adv-a2-pill-wrap">
                            <div class="unit-toggle-pill" id="advA2Toggle">
                                <button type="button" class="unit-btn active" data-a2="all">Vse</button>
                                <button type="button" class="unit-btn" data-a2="yes">Samo A2</button>
                            </div>
                            <input type="hidden" name="a2Eligible" id="a2EligibleInput" value="">
                        </div>
                    </div>
                </div>`;

// Target 2: Motorcycle specific fields
const oldBlock2 = `<!-- Motorcycle Specific Engine Fields -->
                <div class="moto-only-field" style="display:none;">
                    <div class="adv-grid-2">
                        <div class="adv-field-group">
                            <label class="adv-label">Takt motorja</label>
                            <select name="stroke" class="glass-select" data-no-search="true">
                                <option value="">Vsi takti</option>
                                <option value="2T">2-taktni</option>
                                <option value="4T">4-taktni</option>
                            </select>
                        </div>
                        <div class="adv-field-group engine-cyl-field">
                            <label class="adv-label">Vrsta motorja / Valji</label>
                            <div class="cyl-row">
                                <div class="cyl-count">
                                    <select name="cylinders" id="moto-cylinders" class="glass-select" data-no-search="true">
                                        <option value="">Valji</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="6">6</option>
                                        <option value="Wankel">Wankel</option>
                                    </select>
                                </div>
                                <!-- Layout appears to the RIGHT when shown -->
                                <div id="cylinder-layout-group" class="cyl-layout" style="display:none;">
                                    <select name="cylinderLayout" id="moto-cylinder-layout" class="glass-select" data-no-search="true">
                                        <!-- Populated via JS -->
                                    </select>
                                </div>
                            </div>
                            <div class="cyl-btn-row" style="display:flex;gap:.5rem;justify-content:center;margin-top:.6rem;">
                                <button type="button" id="cylAddBtn" class="adv-btn-pill adv-btn-pill-add">+ Dodaj</button>
                                <button type="button" id="cylRemoveBtn" class="adv-btn-pill adv-btn-pill-remove">× Odstrani</button>
                            </div>
                            <div id="cylFilterChips" style="display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;margin-top:.5rem;"></div>
                        </div>
                    </div>

                    <!-- Prenos moči (drivetrain) -->
                    <div class="adv-field-group" style="margin-top:1.5rem;">
                        <label class="adv-label">Prenos moči</label>
                        <div class="adv-chip-group">
                            <label class="adv-chip"><input type="checkbox" name="motoDrivetrain" value="veriga"> Veriga</label>
                            <label class="adv-chip"><input type="checkbox" name="motoDrivetrain" value="zobati jermen"> Zobati jermen</label>
                            <label class="adv-chip"><input type="checkbox" name="motoDrivetrain" value="jekleni jermen"> Jekleni jermen</label>
                            <label class="adv-chip"><input type="checkbox" name="motoDrivetrain" value="kardan"> Kardan</label>
                        </div>
                    </div>
                </div>`;

const newBlock2 = `<!-- Motorcycle Specific Engine Fields -->
                <div class="moto-only-field" style="display:none;">
                    <div class="adv-field-group engine-cyl-field" style="margin-bottom: 1.25rem;">
                        <label class="adv-label">Vrsta motorja / Valji</label>
                        <div class="cyl-controls-row">
                            <div class="cyl-count">
                                <select name="cylinders" id="moto-cylinders" class="glass-select" data-no-search="true">
                                    <option value="">Valji</option>
                                    <option value="1">1 valj</option>
                                    <option value="2">2 valja</option>
                                    <option value="3">3 valji</option>
                                    <option value="4">4 valji</option>
                                    <option value="6">6 valjev</option>
                                    <option value="Wankel">Wankel</option>
                                </select>
                            </div>
                            <!-- Layout appears to the RIGHT when shown -->
                            <div id="cylinder-layout-group" class="cyl-layout" style="display:none;">
                                <select name="cylinderLayout" id="moto-cylinder-layout" class="glass-select" data-no-search="true">
                                    <!-- Populated via JS -->
                                </select>
                            </div>
                            <div class="cyl-btn-group">
                                <button type="button" id="cylAddBtn" class="pill-btn primary cyl-action-btn">
                                    <i data-lucide="plus" style="width:14px;height:14px;"></i> Dodaj
                                </button>
                                <button type="button" id="cylRemoveBtn" class="pill-btn cyl-action-btn cyl-remove-btn">
                                    <i data-lucide="minus-circle" style="width:14px;height:14px;"></i> Odstrani
                                </button>
                            </div>
                        </div>
                        <div id="cylFilterChips" class="cyl-chips-container"></div>
                    </div>

                    <!-- Prenos moči (drivetrain) -->
                    <div class="adv-field-group" style="margin-top:1.25rem;">
                        <label class="adv-label">Prenos moči</label>
                        <div class="adv-chip-group">
                            <label class="adv-chip"><input type="checkbox" name="motoDrivetrain" value="veriga"> Veriga</label>
                            <label class="adv-chip"><input type="checkbox" name="motoDrivetrain" value="zobati jermen"> Zobati jermen</label>
                            <label class="adv-chip"><input type="checkbox" name="motoDrivetrain" value="jekleni jermen"> Jekleni jermen</label>
                            <label class="adv-chip"><input type="checkbox" name="motoDrivetrain" value="kardan"> Kardan</label>
                        </div>
                    </div>
                </div>`;

function normalize(str) {
  return str.replace(/\r\n/g, '\n');
}

const normBase = normalize(base);
const normOld1 = normalize(oldBlock1);
const normOld2 = normalize(oldBlock2);
const normNew1 = normalize(newBlock1);
const normNew2 = normalize(newBlock2);

console.log('Includes old1?', normBase.includes(normOld1));
console.log('Includes old2?', normBase.includes(normOld2));

if (normBase.includes(normOld1) && normBase.includes(normOld2)) {
  let updated = normBase.replace(normOld1, normNew1).replace(normOld2, normNew2);
  fs.writeFileSync('public/views/advanced-search.html', updated, 'utf8');
  console.log('Successfully updated public/views/advanced-search.html');
  
  // Also create public/views/advanced-search.avto.html
  const containerIdx = updated.indexOf('<div class="search-container"');
  if (containerIdx !== -1) {
    const avtoHtml = updated.slice(containerIdx);
    fs.writeFileSync('public/views/advanced-search.avto.html', avtoHtml, 'utf8');
    console.log('Successfully created public/views/advanced-search.avto.html');
  }
} else {
  console.error('Failed to match blocks in base file!');
}
