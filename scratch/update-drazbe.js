import fs from 'fs';
let content = fs.readFileSync('public/views/drazbe.html', 'utf8');

const newSidebar = `<!-- ═══ SIDEBAR: Filtri ════════════════════════════════════ -->
    <aside class="oglasi-sidebar">
        <!-- Mobile-only: toggle replaced by bottom floating split pill -->
        <button type="button" id="mobileFilterToggle" class="mobile-filter-toggle" style="display: none !important;">
            <span class="mft-label"><i data-lucide="sliders-horizontal"></i> <span data-i18n-key="sidebar_filters_title">Filtri</span></span>
            <i data-lucide="chevron-down" class="mft-chevron"></i>
        </button>

        <!-- Mobile Bottom Sheet Handle & Header -->
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-header">
            <div class="mobile-sheet-title">
                <i data-lucide="sliders-horizontal"></i>
                <span data-i18n-key="sidebar_filters_title">Filtri</span>
                <span class="mobile-sheet-count-badge" id="mobileFilterHeaderBadge" style="display:none;">0</span>
            </div>
            <button type="button" class="mobile-sheet-close" id="mobileFilterCloseBtn" aria-label="Zapri">
                <i data-lucide="x"></i>
            </button>
        </div>

        <div class="oglasi-sidebar-card glass-card" id="filtersCard">
            <div class="filters-card-inner">
                <div class="sidebar-filters-header">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <i data-lucide="sliders-horizontal" style="width:16px; height:16px; flex-shrink:0;"></i>
                        <h3 style="margin:0; font-size:1.1rem; font-weight:700;" data-i18n-key="sidebar_filters_title">Filtri</h3>
                    </div>
                    <button type="button" id="sidebarCollapseAllBtn" class="ah-sidebar-collapse-all-btn" aria-label="Skrči vse" data-collapsed="false">
                        <span class="ah-collapse-label" data-i18n-key="collapse_all">Skrči vse</span>
                    </button>
                </div>

                <form id="sidebarFiltersForm">
                    <!-- Dražba Accordion -->
                    <div class="adv-accordion">
                        <div class="adv-acc-header">
                            <button class="adv-acc-trigger" type="button" aria-expanded="true">
                                <i data-lucide="gavel" style="width:16px; height:16px;"></i>
                                <span class="adv-acc-title" data-i18n-key="nav_auctions">Dražba</span>
                                <span class="acc-filter-summary" id="summaryDrazba" style="display:none;"></span>
                            </button>
                        </div>
                        <div class="adv-acc-body">
                            <div class="adv-acc-body-inner">
                                <div class="form-group">
                                    <label data-i18n-key="auction_type">Tip dražbe</label>
                                    <select id="sidebarAucType" name="aucType" class="glass-select">
                                        <option value="" data-i18n-key="all">Vse vrste</option>
                                        <option value="silent" data-i18n-key="cl_auction_type_silent">🔒 Tiha dražba</option>
                                        <option value="prebid" data-i18n-key="cl_auction_type_prebid">⏱ Pred-dražba</option>
                                        <option value="live" data-i18n-key="cl_auction_type_live">👁 Živa dražba</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Status dražbe</label>
                                    <select id="sidebarAucStatus" name="aucStatus" class="glass-select">
                                        <option value="active" data-i18n-key="auction_status_active">Aktivne dražbe</option>
                                        <option value="ending_soon">⏱ Kmalu se zaključi (&lt; 24h)</option>
                                        <option value="upcoming" data-i18n-key="upcoming">📅 Prihajajoče</option>
                                        <option value="ended">Končane dražbe</option>
                                        <option value="">Vse faze</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Rezervna cena</label>
                                    <select id="sidebarAucReserve" name="aucReserve" class="glass-select">
                                        <option value="">Vse (z ali brez)</option>
                                        <option value="no_reserve">Brez rezervne cene</option>
                                        <option value="reserve_met">Rezervna cena dosežena</option>
                                        <option value="with_reserve">Z rezervno ceno</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Obvezna prodaja</label>
                                    <select id="sidebarAucBinding" name="aucBinding" class="glass-select">
                                        <option value="">Vse</option>
                                        <option value="yes">✓ Samo obvezna prodaja</option>
                                        <option value="no">Brez obvezne prodaje</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Gotovinsko plačilo</label>
                                    <select id="sidebarAucCash" name="aucCash" class="glass-select">
                                        <option value="">Vse</option>
                                        <option value="yes">💵 Dovoljeno z gotovino</option>
                                        <option value="no">Brez gotovine</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Osnovni podatki Accordion -->
                    <div class="adv-accordion">
                        <div class="adv-acc-header">
                            <button class="adv-acc-trigger" type="button" aria-expanded="false">
                                <i data-lucide="car" style="width:16px; height:16px;"></i>
                                <span class="adv-acc-title" data-i18n-key="filter_basic_info">Osnovni podatki</span>
                                <span class="acc-filter-summary" id="summaryOsnovni" style="display:none;"></span>
                            </button>
                        </div>
                        <div class="adv-acc-body">
                            <div class="adv-acc-body-inner">
                                <div class="form-group">
                                    <label data-i18n-key="make">Znamka</label>
                                    <select id="sidebarMake" name="make" class="glass-select">
                                        <option value="" data-i18n-key="filter_all_makes">Vse znamke</option>
                                    </select>
                                    <div class="sidebar-active-pills" id="activeMake"></div>
                                </div>
                                <div class="form-group">
                                    <label data-i18n-key="model">Model</label>
                                    <select id="sidebarModel" name="model" class="glass-select" disabled>
                                        <option value="" data-i18n-key="filter_all_models">Vsi modeli</option>
                                    </select>
                                    <div class="sidebar-active-pills" id="activeModel"></div>
                                </div>
                                <div class="form-group">
                                    <label data-i18n-key="variant">Različica</label>
                                    <select id="sidebarVariant" name="variant" class="glass-select" disabled>
                                        <option value="" data-i18n-key="filter_all_variants">Vse različice</option>
                                    </select>
                                    <div class="sidebar-active-pills" id="activeVariant"></div>
                                </div>
                                <div class="form-group">
                                    <label data-i18n-key="filter_body_type">Oblika / Karoserija</label>
                                    <select id="sidebarBodyType" name="bodyType" class="glass-select">
                                        <option value="" data-i18n-key="filter_all_body_types">Vse oblike</option>
                                        <option value="Limuzina">Limuzina</option>
                                        <option value="Kombilimuzina">Kombilimuzina</option>
                                        <option value="Karavan">Karavan</option>
                                        <option value="Terensko">SUV</option>
                                        <option value="Enoprostorec">Enoprostorec</option>
                                        <option value="Kabriolet">Kabriolet</option>
                                        <option value="Coupe">Coupe</option>
                                        <option value="Sportni">Športni avto</option>
                                        <option value="Pick-up">Pick-up</option>
                                        <option value="Kombi">Kombi / Dostavnik</option>
                                        <option value="Drugo">Drugo</option>
                                    </select>
                                    <div class="sidebar-active-pills" id="activeBodyType"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cena in letnik Accordion -->
                    <div class="adv-accordion">
                        <div class="adv-acc-header">
                            <button class="adv-acc-trigger" type="button" aria-expanded="false">
                                <i data-lucide="tag" style="width:16px; height:16px;"></i>
                                <span class="adv-acc-title" data-i18n-key="filter_price_and_year">Cena in letnik</span>
                                <span class="acc-filter-summary" id="summaryCena" style="display:none;"></span>
                            </button>
                        </div>
                        <div class="adv-acc-body">
                            <div class="adv-acc-body-inner">
                                <div class="form-group">
                                    <label>Letnik</label>
                                    <div class="year-selects-wrapper" style="display:flex; gap:0.5rem; justify-content:center; width:100%;">
                                        <select id="sidebarYearFrom" name="yearFrom" class="glass-select"><option value="">Od</option></select>
                                        <select id="sidebarYearTo" name="yearTo" class="glass-select"><option value="">Do</option></select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Prevoženi km do</label>
                                    <select id="sidebarMileageTo" name="mileageTo" class="glass-select">
                                        <option value="">Brez omejitve</option>
                                        <option value="10000">do 10.000 km</option>
                                        <option value="25000">do 25.000 km</option>
                                        <option value="50000">do 50.000 km</option>
                                        <option value="100000">do 100.000 km</option>
                                        <option value="150000">do 150.000 km</option>
                                        <option value="200000">do 200.000 km</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Izhodiščna cena / ponudba do (€)</label>
                                    <input type="text" id="sidebarPriceTo" name="priceTo" placeholder="npr. 20.000 €" class="pill-input js-format-number" style="width:100%; box-sizing:border-box;" inputmode="numeric">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Motor in pogon Accordion -->
                    <div class="adv-accordion">
                        <div class="adv-acc-header">
                            <button class="adv-acc-trigger" type="button" aria-expanded="false">
                                <i data-lucide="cog" style="width:16px; height:16px;"></i>
                                <span class="adv-acc-title" data-i18n-key="filter_engine_and_drive">Motor in pogon</span>
                                <span class="acc-filter-summary" id="summaryMotor" style="display:none;"></span>
                            </button>
                        </div>
                        <div class="adv-acc-body">
                            <div class="adv-acc-body-inner">
                                <div class="form-group">
                                    <label data-i18n-key="filter_fuel">Gorivo</label>
                                    <div class="adv-chip-group" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                                        <label class="adv-chip"><input type="checkbox" name="fuel" value="Bencin"> Bencin</label>
                                        <label class="adv-chip"><input type="checkbox" name="fuel" value="Dizel"> Dizel</label>
                                        <label class="adv-chip"><input type="checkbox" name="fuel" value="Hibrid" id="sidebarFuelHibrid"> Hibrid</label>
                                        <label class="adv-chip"><input type="checkbox" name="fuel" value="Elektrika"> Elektrika</label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label data-i18n-key="filter_transmission">Menjalnik</label>
                                    <div class="adv-chip-group" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                                        <label class="adv-chip"><input type="checkbox" name="transmission" value="Ročni"> Ročni</label>
                                        <label class="adv-chip"><input type="checkbox" name="transmission" value="Avtomatski"> Avtomatski</label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Pogon</label>
                                    <select id="sidebarDriveType" name="driveType" class="glass-select">
                                        <option value="">Vsi pogoni</option>
                                        <option value="FWD">Sprednji pogon (FWD)</option>
                                        <option value="RWD">Zadnji pogon (RWD)</option>
                                        <option value="AWD">Štirikolesni pogon (AWD / 4x4)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Lokacija Accordion -->
                    <div class="adv-accordion">
                        <div class="adv-acc-header">
                            <button class="adv-acc-trigger" type="button" aria-expanded="false">
                                <i data-lucide="map-pin" style="width:16px; height:16px;"></i>
                                <span class="adv-acc-title">Lokacija</span>
                                <span class="acc-filter-summary" id="summaryProdajalec" style="display:none;"></span>
                            </button>
                        </div>
                        <div class="adv-acc-body">
                            <div class="adv-acc-body-inner">
                                <div class="form-group">
                                    <label>Država in regija</label>
                                    <div style="display:flex; gap:0.4rem; width:100%;">
                                        <select id="sidebarCountry" name="country" class="glass-select" style="flex:1; min-width:0;"><option value="">Vse države</option></select>
                                        <select id="sidebarRegion" name="region" class="glass-select" style="flex:1; min-width:0;"><option value="">Vse regije</option></select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="ah-sidebar-footer">
                        <a href="/iskanje-drazbe" id="drazbeSidebarAdvBtn" class="ah-sidebar-adv-btn">
                            <i data-lucide="sliders-horizontal" style="width:16px;height:16px;"></i>
                            <span>Napredno iskanje dražb</span>
                        </a>
                        <button type="button" id="sidebarResetBtn" class="pill-btn">
                            <i data-lucide="rotate-ccw" style="width:16px;height:16px;"></i>
                            <span>Ponastavi</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </aside>`;

const startMarker = '<!-- ═══ SIDEBAR: Filtri ════════════════════════════════════ -->';
const endMarker = '<!-- ═══ MAIN: Dražbe ══════════════════════════════════════ -->';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error('Markers not found!');
    process.exit(1);
}

const before = content.slice(0, startIdx);
const after = content.slice(endIdx);
fs.writeFileSync('public/views/drazbe.html', before + newSidebar + '\n\n    ' + after, 'utf8');
console.log('drazbe.html successfully patched!');
