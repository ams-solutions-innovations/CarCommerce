import fs from 'fs';

// Let's assemble the new acc-engine content
const unifiedEngineContent = `
            <div class="acc-b adv-acc-body" style="display:none;">
                <!-- ── CAR-ONLY: Vrsta goriva & Hybrid & Electric ── -->
                <div class="car-only-field fg">
                    <div class="fl">
                        <svg class="i"><use href="#i-fuel"></use></svg>
                        <span>Vrsta goriva</span>
                        <small id="fuelSummary">2 izbrani</small>
                    </div>
                    <div class="chips">
                        <label class="chip"><input type="checkbox" name="fuel" value="Petrol" >Bencin<span class="ct">18.420</span></label>
                        <label class="chip"><input type="checkbox" name="fuel" value="Dizel" >Dizel<span class="ct">12.310</span></label>
                        <label class="chip"><input type="checkbox" name="fuel" value="Hibrid" id="fuelHibridCheck" >Hibrid<span class="ct">4.180</span></label>
                        <label class="chip"><input type="checkbox" name="fuel" value="Elektrika" >Elektrika<span class="ct">1.900</span></label>
                        <label class="chip"><input type="checkbox" name="fuel" value="EREV" >EREV<span class="ct">120</span></label>
                        <label class="chip"><input type="checkbox" name="fuel" value="LPG" >LPG / Plin<span class="ct">210</span></label>
                        <label class="chip"><input type="checkbox" name="fuel" value="CNG" >CNG<span class="ct">64</span></label>
                        <label class="chip"><input type="checkbox" name="fuel" value="Vodik" >Vodik<span class="ct">12</span></label>
                        <label class="chip"><input type="checkbox" name="fuel" value="Etanol" >Etanol<span class="ct">8</span></label>
                    </div>

                    <!-- Hybrid Sub-section -->
                    <div class="sub" id="hybridTypeGroup">
                        <div class="fl">
                            <svg class="i"><use href="#i-zap"></use></svg>
                            <span>Vrsta hibrida</span>
                        </div>
                        <div class="chips">
                            <label class="chip"><input type="checkbox" name="hybridType" value="Blagi hibrid" >Blagi hibrid</label>
                            <label class="chip"><input type="checkbox" name="hybridType" value="Plug-in hibrid" >Plug-in hibrid</label>
                        </div>

                        <div class="fl">
                            <svg class="i"><use href="#i-engine"></use></svg>
                            <span>Motor hibrida</span>
                        </div>
                        <div class="chips">
                            <label class="chip"><input type="checkbox" name="hybridEngine" value="Bencin hibrid" >Bencin hibrid</label>
                            <label class="chip"><input type="checkbox" name="hybridEngine" value="Dizel hibrid" >Dizel hibrid</label>
                        </div>
                    </div>

                    <!-- Electric Sub-section -->
                    <div class="sub ev ah-electric-filters" id="electricSubSection" style="display:none;">
                        <div class="sub-t">
                            <svg class="i"><use href="#i-zap"></use></svg>
                            <span>Električni pogon · vidno ob izbiri Elektrika ali Plug-in</span>
                        </div>
                        <div class="g2">
                            <div class="fg">
                                <div class="fl">
                                    <svg class="i"><use href="#i-gauge"></use></svg>
                                    <span>Domet (WLTP)</span>
                                    <small>od 400 km</small>
                                </div>
                                <div class="sl adv-slider" id="wltpSlider">
                                    <div class="sl-t"></div>
                                    <div class="sl-f" style="left:40%;right:0%"></div>
                                    <button type="button" class="handle" style="left:40%" aria-label="Najmanj"></button>
                                    <button type="button" class="handle" style="left:100%" aria-label="Največ"></button>
                                </div>
                                <div class="tk"><span>100</span><span>300</span><span>500</span><span>700+ km</span></div>
                                <div style="display:flex;gap:10px;margin-top:6px">
                                    <div style="flex:1">
                                        <div class="lbl">Domet od</div>
                                        <div class="fld num sm">
                                            <input type="number" name="rangeKmFrom" id="rangeKmFromInput" placeholder="0" value="" class="fld-raw">
                                            <span style="margin-left:auto;color:#5a6b83">km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="fg">
                                <div class="fl">
                                    <svg class="i"><use href="#i-battery"></use></svg>
                                    <span>Kapaciteta baterije</span>
                                    <small>od 60 kWh</small>
                                </div>
                                <div class="sl adv-slider" id="batterySlider">
                                    <div class="sl-t"></div>
                                    <div class="sl-f" style="left:30%;right:0%"></div>
                                    <button type="button" class="handle" style="left:30%" aria-label="Najmanj"></button>
                                    <button type="button" class="handle" style="left:100%" aria-label="Največ"></button>
                                </div>
                                <div class="tk"><span>20</span><span>60</span><span>100</span><span>130+ kWh</span></div>
                                <div style="display:flex;gap:10px;margin-top:6px">
                                    <div style="flex:1">
                                        <div class="lbl">Kapaciteta od</div>
                                        <div class="fld num sm">
                                            <input type="number" name="batteryKwhFrom" id="batteryKwhFromInput" placeholder="0" value="" class="fld-raw">
                                            <span style="margin-left:auto;color:#5a6b83">kWh</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="fg">
                            <div class="fl">
                                <svg class="i"><use href="#i-battery-charging"></use></svg>
                                <span>Polnjenje 0–80 %</span>
                                <small>do 30 min</small>
                            </div>
                            <div class="seg sm" role="group">
                                <button type="button">Vse</button>
                                <button type="button">do 20 min</button>
                                <button type="button" class="on">do 30 min</button>
                                <button type="button">do 45 min</button>
                            </div>
                        </div>

                        <div class="fg">
                            <div class="fl">
                                <svg class="i"><use href="#i-zap"></use></svg>
                                <span>Priključek</span>
                            </div>
                            <div class="chips">
                                <label class="chip sm"><input type="checkbox" name="chargingPlug" value="CCS2" >CCS2</label>
                                <label class="chip sm"><input type="checkbox" name="chargingPlug" value="Type 2" >Type 2</label>
                                <label class="chip sm"><input type="checkbox" name="chargingPlug" value="CHAdeMO" >CHAdeMO</label>
                                <label class="chip sm"><input type="checkbox" name="chargingPlug" value="Tesla" >Tesla (NACS)</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="car-only-field dv"></div>

                <!-- ── SHARED: Moč & Prostornina (1:1 with VecFiltrovMoto.dc.html styling) ── -->
                <div class="g2">
                    <!-- Moč motorja -->
                    <div class="fg">
                        <div class="fl">
                            <svg class="i"><use href="#i-zap"></use></svg>
                            <span>Moč motorja</span>
                            <div class="seg sm unit-toggle-pill" id="advPowerUnitToggle" role="group" style="margin-left:6px;">
                                <button type="button" class="unit-btn on active" data-unit="kw">kW</button>
                                <button type="button" class="unit-btn" data-unit="km">KM</button>
                            </div>
                            <small id="powerNote">od 35 kW (48 KM)</small>
                            <small id="powerSummary" style="display:none;">od 100 kW (136 KM)</small>
                        </div>
                        <div class="sl adv-slider" id="powerSlider">
                            <div class="sl-t"></div>
                            <div class="sl-f" id="powerSliderFill" style="left:17%;right:0%"></div>
                            <button type="button" class="handle" id="powerSliderHandleMin" style="left:17%" aria-label="Najmanj"></button>
                            <button type="button" class="handle" id="powerSliderHandleMax" style="left:100%" aria-label="Največ"></button>
                        </div>
                        <div class="tk"><span>0</span><span>50</span><span>100</span><span>150+ kW</span></div>
                        <div style="display:flex;gap:10px;margin-top:6px">
                            <div style="flex:1">
                                <div class="lbl">Od</div>
                                <div class="fld num sm" style="display:flex;align-items:center;padding:0 14px;height:44px;border-radius:9999px;border:1px solid #d5e0ee;background:#fff;">
                                    <input type="number" name="powerFrom" id="powerFromInput" value="" placeholder="0" class="adv-input fld-raw" style="border:0;background:transparent;width:100%;font-size:14px;font-weight:600;outline:none;">
                                    <span id="powerUnitSuffixFrom" style="margin-left:auto;color:#5a6b83;font-size:13px;font-weight:600;">kW</span>
                                </div>
                            </div>
                            <div style="flex:1">
                                <div class="lbl">Do</div>
                                <div class="fld num sm" style="display:flex;align-items:center;padding:0 14px;height:44px;border-radius:9999px;border:1px solid #d5e0ee;background:#fff;">
                                    <input type="number" name="powerTo" id="powerToInput" value="" placeholder="Brez omejitve" class="adv-input fld-raw" style="border:0;background:transparent;width:100%;font-size:14px;font-weight:600;outline:none;">
                                    <span id="powerUnitSuffixTo" style="margin-left:auto;color:#5a6b83;font-size:13px;font-weight:600;">kW</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prostornina motorja -->
                    <div class="fg">
                        <div class="fl tall">
                            <svg class="i"><use href="#i-engine"></use></svg>
                            <span>Prostornina motorja</span>
                            <small id="dispNote">Vse prostornine</small>
                            <small id="displacementSummary" style="display:none;">Vse prostornine</small>
                        </div>
                        <div class="sl adv-slider" id="dispSlider">
                            <div class="sl-t"></div>
                            <div class="sl-f" id="dispSliderFill" style="left:0%;right:0%"></div>
                            <button type="button" class="handle" id="dispSliderHandleMin" style="left:0%" aria-label="Najmanj"></button>
                            <button type="button" class="handle" id="dispSliderHandleMax" style="left:100%" aria-label="Največ"></button>
                        </div>
                        <div class="tk"><span>50</span><span>250</span><span>600</span><span>1.000</span><span>1.800+ ccm</span></div>
                        <div style="display:flex;gap:10px;margin-top:6px">
                            <div style="flex:1">
                                <div class="lbl">Od</div>
                                <div class="fld num sm" style="display:flex;align-items:center;padding:0 14px;height:44px;border-radius:9999px;border:1px solid #d5e0ee;background:#fff;">
                                    <input type="number" name="displacementFrom" id="dispFromInput" value="" placeholder="0" class="adv-input fld-raw" style="border:0;background:transparent;width:100%;font-size:14px;font-weight:600;outline:none;">
                                    <span style="margin-left:auto;color:#5a6b83;font-size:13px;font-weight:600;">ccm</span>
                                </div>
                            </div>
                            <div style="flex:1">
                                <div class="lbl">Do</div>
                                <div class="fld num sm" style="display:flex;align-items:center;padding:0 14px;height:44px;border-radius:9999px;border:1px solid #d5e0ee;background:#fff;">
                                    <input type="number" name="displacementTo" id="dispToInput" value="" placeholder="Brez omejitve" class="adv-input fld-raw" style="border:0;background:transparent;width:100%;font-size:14px;font-weight:600;outline:none;">
                                    <span style="margin-left:auto;color:#5a6b83;font-size:13px;font-weight:600;">ccm</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Menjalnik (Shared segmented control & select) -->
                    <div class="fg">
                        <div class="fl">
                            <svg class="i"><use href="#i-gear"></use></svg>
                            <span>Menjalnik</span>
                        </div>
                        <div class="seg" id="advTransmissionSeg" role="group">
                            <button type="button" class="on active" data-val="">Vsi</button>
                            <button type="button" data-val="Ročni">Ročni</button>
                            <button type="button" data-val="Avtomatski">Avtomatski</button>
                            <button type="button" data-val="Polavtomatski">Polavtomatski</button>
                        </div>
                        <select name="transmission" id="transmissionSelect" class="glass-select" style="display:none;" data-no-search="true">
                            <option value="" selected>Vsi menjalniki</option>
                            <option value="Ročni">Ročni</option>
                            <option value="Avtomatski">Avtomatski</option>
                            <option value="Polavtomatski">Polavtomatski</option>
                        </select>
                    </div>

                    <!-- ── MOTO-ONLY: A2 izpit ── -->
                    <div class="moto-only-field fg adv-a2-cell" style="display:none;">
                        <div class="fl">
                            <svg class="i"><use href="#nv-bike"></use></svg>
                            <span>A2 izpit</span>
                        </div>
                        <div class="seg unit-toggle-pill" id="advA2Toggle" role="group">
                            <button type="button" class="unit-btn on active" data-a2="all">Vse</button>
                            <button type="button" class="unit-btn" data-a2="yes">Samo A2</button>
                        </div>
                        <input type="hidden" name="a2Eligible" id="a2EligibleInput" value="">
                        <div style="font-size:12.5px;color:#5a6b83;display:flex;align-items:center;gap:6px;margin-top:2px;">
                            <svg class="i" style="width:14px;height:14px;flex-shrink:0;"><use href="#i-info"></use></svg>
                            <span>Motorji do 35 kW, primerni za kategorijo A2.</span>
                        </div>
                    </div>

                    <!-- ── CAR-ONLY: Poraba goriva ── -->
                    <div class="car-only-field fg">
                        <div class="fl">
                            <svg class="i"><use href="#i-droplet"></use></svg>
                            <span>Poraba goriva</span>
                            <small id="consumptionSummary">Brez omejitve</small>
                        </div>
                        <div class="sl adv-slider" id="consumptionSlider">
                            <div class="sl-t"></div>
                            <div class="sl-f" style="left:0;right:0%"></div>
                            <button type="button" class="handle" style="left:100%" aria-label="Vrednost"></button>
                        </div>
                        <div class="tk"><span>0</span><span>5</span><span>10</span><span>15+ L</span></div>
                        <div style="font-size:12.5px;color:#5a6b83;display:flex;align-items:center;gap:6px;margin-top:4px;">
                            <svg class="i" style="width:14px;height:14px"><use href="#i-info"></use></svg>
                            <span>Električni avtomobili so pri tem filtru vedno vključeni.</span>
                        </div>
                        <input type="hidden" name="consumptionTo" id="consumptionToInput" value="">
                    </div>
                </div>

                <!-- ── MOTO-ONLY: Takt motorja & Valji & Postavitev & Prenos moči ── -->
                <div class="moto-only-field" style="display:none; width:100%;">
                    <div class="dv" style="margin:20px 0;"></div>
                    <div class="g2">
                        <!-- Takt motorja -->
                        <div class="fg">
                            <div class="fl">
                                <svg class="i"><use href="#i-gauge"></use></svg>
                                <span>Takt motorja</span>
                            </div>
                            <div class="seg" id="advStrokeSeg" role="group">
                                <button type="button" class="on active" data-stroke="">Vsi takti</button>
                                <button type="button" data-stroke="2T">2-taktni</button>
                                <button type="button" data-stroke="4T">4-taktni</button>
                            </div>
                            <select name="stroke" id="strokeSelect" style="display:none;" data-no-search="true">
                                <option value="" selected>Vsi takti</option>
                                <option value="2T">2-taktni</option>
                                <option value="4T">4-taktni</option>
                            </select>
                        </div>

                        <!-- Število valjev -->
                        <div class="fg">
                            <div class="fl">
                                <svg class="i"><use href="#i-engine"></use></svg>
                                <span>Število valjev</span>
                                <small id="motoCylSummary">Vsi</small>
                            </div>
                            <div class="chips" id="motoCylChips">
                                <button type="button" class="chip" data-cyl="1">1</button>
                                <button type="button" class="chip" data-cyl="2">2</button>
                                <button type="button" class="chip" data-cyl="3">3</button>
                                <button type="button" class="chip" data-cyl="4">4</button>
                                <button type="button" class="chip" data-cyl="6">6</button>
                                <button type="button" class="chip" data-cyl="Wankel">Wankel</button>
                            </div>
                            <select name="cylinders" id="moto-cylinders" style="display:none;" data-no-search="true">
                                <option value="" selected>Valji</option>
                                <option value="1">1 valj</option>
                                <option value="2">2 valja</option>
                                <option value="3">3 valji</option>
                                <option value="4">4 valji</option>
                                <option value="6">6 valjev</option>
                                <option value="Wankel">Wankel</option>
                            </select>
                        </div>
                    </div>

                    <!-- Vrsta motorja · postavitev valjev -->
                    <div class="sub" id="motoLayoutSub" style="display:none; margin-top:16px;">
                        <div style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7b93">
                            Vrsta motorja · postavitev valjev (<span id="motoLayoutCylLabel">2 valja</span>)
                            <b id="motoLayoutChosenBadge" style="color:#1d4ed8;letter-spacing:0;text-transform:none;font-size:12.5px;margin-left:6px"></b>
                        </div>
                        <div class="chips" id="motoLayoutChips"></div>
                        <div id="cylinder-layout-group" style="display:none;">
                            <select name="cylinderLayout" id="moto-cylinder-layout" data-no-search="true"></select>
                        </div>
                        <div id="cylFilterChips" class="cyl-chips-container" style="display:none;"></div>
                    </div>

                    <div class="dv" style="margin:20px 0;"></div>

                    <!-- Prenos moči -->
                    <div class="fg">
                        <div class="fl">
                            <svg class="i"><use href="#i-gear"></use></svg>
                            <span>Prenos moči</span>
                        </div>
                        <div class="chips" id="motoDrivetrainGroup">
                            <label class="chip">
                                <input type="checkbox" name="motoDrivetrain" value="veriga">
                                <svg class="i chk-icon" style="width:14px;height:14px;display:none;"><use href="#i-check"></use></svg>
                                <span>Veriga</span>
                            </label>
                            <label class="chip">
                                <input type="checkbox" name="motoDrivetrain" value="zobati jermen">
                                <svg class="i chk-icon" style="width:14px;height:14px;display:none;"><use href="#i-check"></use></svg>
                                <span>Zobati jermen</span>
                            </label>
                            <label class="chip">
                                <input type="checkbox" name="motoDrivetrain" value="jekleni jermen">
                                <svg class="i chk-icon" style="width:14px;height:14px;display:none;"><use href="#i-check"></use></svg>
                                <span>Jekleni jermen</span>
                            </label>
                            <label class="chip">
                                <input type="checkbox" name="motoDrivetrain" value="kardan">
                                <svg class="i chk-icon" style="width:14px;height:14px;display:none;"><use href="#i-check"></use></svg>
                                <span>Kardan</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- ── CAR-ONLY: Konfiguracija motorja & Pogon ── -->
                <div class="car-only-field dv"></div>
                <div class="car-only-field fg">
                    <div class="fl">
                        <svg class="i"><use href="#i-engine"></use></svg>
                        <span>Konfiguracija motorja</span>
                    </div>
                    <div class="chips">
                        <label class="chip"><input type="checkbox" name="engineConfig" value="Inline" >Vrstni</label>
                        <label class="chip"><input type="checkbox" name="engineConfig" value="V-Engine" >V-motor</label>
                        <label class="chip"><input type="checkbox" name="engineConfig" value="Boxer" >Bokser</label>
                        <label class="chip"><input type="checkbox" name="engineConfig" value="W-Engine" >W-motor</label>
                        <label class="chip"><input type="checkbox" name="engineConfig" value="Rotary" >Rotacijski (Wankel)</label>
                        <label class="chip"><input type="checkbox" name="engineConfig" value="Electric" >Električni</label>
                    </div>
                </div>

                <div class="car-only-field fg" style="margin-top:12px;">
                    <div class="fl">
                        <svg class="i"><use href="#i-gear"></use></svg>
                        <span>Pogon</span>
                    </div>
                    <div class="chips">
                        <label class="chip"><input type="checkbox" name="drivetrain" value="FWD" >Sprednji pogon (FWD)</label>
                        <label class="chip"><input type="checkbox" name="drivetrain" value="RWD" >Zadnji pogon (RWD)</label>
                        <label class="chip"><input type="checkbox" name="drivetrain" value="AWD" >4×4 / Vsekolesni (AWD)</label>
                    </div>
                </div>
            </div>
`;

function replaceAccEngine(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const accEngineS = content.indexOf('id="acc-engine"');
  if (accEngineS === -1) throw new Error('acc-engine not found in ' + filePath);
  
  const bodyStartToken = '<div class="acc-b adv-acc-body"';
  const bodyS = content.indexOf(bodyStartToken, accEngineS);
  const secE = content.indexOf('</section>', bodyS);
  const bodyE = content.lastIndexOf('</div>', secE) + 6;

  content = content.slice(0, bodyS) + unifiedEngineContent.trim() + content.slice(bodyE);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced acc-engine in', filePath);
}

replaceAccEngine('public/views/advanced-search.avto.html');
replaceAccEngine('public/views/advanced-search.html');
