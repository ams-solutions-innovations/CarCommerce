// Advanced Search page — platform-aware (vehicles / vessels)
// Category-aware: reads ?cat=, ?sub=, ?searchType=, ?vtype=, ?najem= from URL
import { getListings } from '../services/listingService.js';
import { navigateTo } from '../router.js';
import { getApprovedProposalsForBrand } from '../services/adminService.js';
import { t } from '../core/i18n.js';
import { translateAdvancedSearchPage } from '../data/advancedSearchI18n.js';
import { resolveCategory, SEARCH_TYPE_OPTIONS } from '../data/categories.js';
import { PLATFORM } from '../config/platform.js';
import { brandsFileFor } from '../data/brandFiles.js';
import { popularBrandsFor } from '../data/popularBrands.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { initCustomSelects, createCustomSelect } from '../utils/customSelect.js';
import { getModelBodyType, getModelVariants } from '../utils/bodyType.js';
import { renderEquipmentChipsHtml, renderEquipmentGroupsHtml } from '../data/equipment.js';
import { repairAdvancedSearchView, layoutEquipment } from '../components/autohub/advancedSearchFixes.js';
import { COMMERCIAL_TAXONOMY, COMMERCIAL_BY_KEY } from '../data/commercialTaxonomy.js';
import { resolveFilterSpec, LEISURE_ENGINE_CONFIGS, LEISURE_FUELS, LEISURE_MOTORIZED } from '../data/categoryFilters.js';
import {
    MOTO_STROKE_OPTIONS,
    MOTO_CYLINDER_OPTIONS,
    MOTO_LAYOUTS,
    getMotoVariants,
    computeMotoFacets,
    codeMatchesLayout,
} from '../data/searchRelevance.js';
import { bindPaintworkColorDynamics } from '../utils/paintworkDynamics.js';

// Search target: 'oglasi' (normal listings) | 'drazbe' (auctions). Set by the
// search-mode pills; drives whether submit routes to /oglasi or /drazbe.
let searchMode = 'oglasi';

export function initAdvancedSearchPage(options = {}) {
    try {
        console.log('[AdvancedSearchPage] init');
        const isAuctionsRoute = !!(options.isAuctions || window.location.pathname.endsWith('/iskanje-drazbe'));
        const modeParam = parseHashParams().get('mode');

        // If user navigates to /iskanje?mode=drazbe, redirect to dedicated /iskanje-drazbe
        if (!isAuctionsRoute && modeParam === 'drazbe') {
            const cleanParams = parseHashParams();
            cleanParams.delete('mode');
            const qs = cleanParams.toString();
            navigateTo(`/iskanje-drazbe${qs ? '?' + qs : ''}`);
            return;
        }

        searchMode = isAuctionsRoute ? 'drazbe' : 'oglasi';

        // MojaNavtika uses a dedicated vessel/engine search controller + view.
        if (PLATFORM.id === 'navtika') {
            import('./advanced-search.navtika.js').then(m => m.initNavtikaSearchPage());
            return;
        }

        initCustomSelects();

        // Parse category params from current hash
        const params = parseHashParams();
        const catContext = {
            cat: (params.get('cat') === 'motor' ? 'moto' : params.get('cat')) || '',
            sub: params.get('sub') || '',
            searchType: params.get('searchType') || '',
            vtype: params.get('vtype') || params.get('bodyType') || params.get('bodyTypes') || '',
            najem: params.get('najem') || '',
        };
        console.log('[AdvancedSearchPage] vtype is ' + catContext.vtype);

        injectRentalToggle(catContext);
        populateEquipmentChips(catContext.cat || 'avto');
        repairAdvancedSearchView(document.querySelector('.search-container') || document);
        applyCategoryContext(catContext);
        console.log('[AdvancedSearchPage] after applyCategoryContext bodyTypeHidden: ' + document.getElementById('bodyTypeHidden')?.value);
        bindAccordions();
        bindSearchLogic(catContext);
        console.log('[AdvancedSearchPage] after bindSearchLogic bodyTypeHidden: ' + document.getElementById('bodyTypeHidden')?.value);
        bindHybridSubOptions();
        bindPaintworkColorDynamics();

        bindStickyMobileBar();
        
        // Setup numeric formatters
        document.querySelectorAll('.js-format-number').forEach(input => setupNumericFormatter(input));

        if (window.lucide) window.lucide.createIcons();
        translateAdvancedSearchPage(document.querySelector('.search-container') || document);
        if (!window.__advancedSearchI18nBound) {
            document.addEventListener('langChanged', () => translateAdvancedSearchPage(document.querySelector('.search-container') || document));
            window.__advancedSearchI18nBound = true;
        }
        document.getElementById('advancedSearchForm')?.setAttribute('data-ready', 'true');
    } catch (err) {
        console.error('[AdvancedSearchPage] init ERROR: ' + err.message + '\n' + err.stack);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Prodaja / Najem (sale / rental) toggle — styled like the home Oglasi/Dražbe pill.
// Rendered when rental is first-class for the platform (MojaNavtika charter) OR when
// the resolved category supports rental (e.g. recreation / prosti-čas campers).
// Sets the existing hiddenNajem field ('' = sale, '1' = rental) and re-runs search.
// ═══════════════════════════════════════════════════════════════════════════════
function injectRentalToggle(ctx) {
    const existing = document.getElementById('rentalModeToggle');
    // If on auctions search, or when rental is on dedicated /iskanje-najem, remove toggle
    if (searchMode === 'drazbe' || PLATFORM.id === 'avto') {
        if (existing) existing.remove();
        ctx.najem = '';
        const hiddenNajem = document.getElementById('hiddenNajem');
        if (hiddenNajem) hiddenNajem.value = '';
        return;
    }

    const container = document.querySelector('.search-container');
    if (!container || existing) return;

    const isRental = ctx.najem === '1';
    const bar = document.createElement('div');
    bar.id = 'rentalModeToggle';
    bar.className = 'home-search-mode';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'Prodaja ali najem');
    bar.innerHTML = `
        <button type="button" class="home-search-mode-pill ${isRental ? '' : 'active'}" data-mode="sale">
            <i data-lucide="tag"></i><span>Prodaja</span>
        </button>
        <button type="button" class="home-search-mode-pill ${isRental ? 'active' : ''}" data-mode="rental">
            <i data-lucide="calendar-clock"></i><span>Najem</span>
        </button>`;
    // Sits under the vehicle-type tabs, directly above "Osnovni podatki".
    const form = document.getElementById('advancedSearchForm');
    if (form) container.insertBefore(bar, form);
    else container.insertBefore(bar, container.firstChild);
    bar.style.marginBottom = '1.5rem';

    bar.querySelectorAll('.home-search-mode-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            bar.querySelectorAll('.home-search-mode-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const rental = btn.dataset.mode === 'rental';
            ctx.najem = rental ? '1' : '';
            const hiddenNajem = document.getElementById('hiddenNajem');
            if (hiddenNajem) hiddenNajem.value = ctx.najem;
        });
    });

    if (window.lucide) window.lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Parse query params from hash URL
// ═══════════════════════════════════════════════════════════════════════════════
function parseHashParams() {
    return new URLSearchParams(window.location.search);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Equipment chips — generated from equipment.js so the search filter and the
// create-listing form stay in lockstep. Fills the car + moto chip containers in
// the Oprema accordion. SportExhaust and the IMU sub-chips have bespoke UI in the
// HTML, so they're excluded from the auto-render to avoid duplicate checkboxes.
// ═══════════════════════════════════════════════════════════════════════════════
const MOTO_BESPOKE_FEATURES = new Set([
    'SportExhaust', 'IMU', 'TractionControl', 'AntiWheelie', 'CorneringABS', 'LinkedBraking',
]);

// The "car-only-field" equipment block is shown for every non-moto tab (avto,
// gospodarska, prosti-cas, mehanizacija), so its chips are re-rendered to match
// the active tab's category. Moto has its own block with bespoke controls.
function populateEquipmentChips(category = 'avto') {
    const carEl = document.getElementById('car-equipment-chips');
    if (carEl && carEl.dataset.cat !== category) {
        carEl.innerHTML = carEl.dataset.v2 ? renderEquipmentGroupsHtml(category, t) : renderEquipmentChipsHtml(category, t);
        carEl.dataset.cat = category;
        if (carEl.dataset.v2) layoutEquipment(carEl);
    }
    const motoEl = document.getElementById('moto-equipment-chips');
    if (motoEl && !motoEl.dataset.filled) {
        motoEl.innerHTML = renderEquipmentChipsHtml('moto', t, { exclude: MOTO_BESPOKE_FEATURES });
        motoEl.dataset.filled = '1';
    }
    if (window.lucide) window.lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Apply category context to the page UI
// ═══════════════════════════════════════════════════════════════════════════════
function applyCategoryContext(ctx) {
    const tabs = document.getElementById('vehicleTypeTabs');
    const searchTypePills = document.getElementById('searchTypePills');

    // Set hidden fields
    const hiddenCat = document.getElementById('hiddenCat');
    if (hiddenCat) hiddenCat.value = ctx.cat;
    
    const hiddenSub = document.getElementById('hiddenSub');
    if (hiddenSub) hiddenSub.value = ctx.sub;
    
    const hiddenSearchType = document.getElementById('hiddenSearchType');
    if (hiddenSearchType) hiddenSearchType.value = ctx.searchType;
    
    const hiddenVType = document.getElementById('hiddenVType');
    if (hiddenVType) hiddenVType.value = ctx.vtype;
    
    const hiddenNajem = document.getElementById('hiddenNajem');
    if (hiddenNajem) hiddenNajem.value = ctx.najem;

    const resolved = ctx.cat ? resolveCategory(ctx.cat, ctx.sub) : null;

    // Title is now removed in Phase 3 cleanup


    // ── Tab selection ──
    // Map category slugs to tab data-tab values
    const tabMap = { 'avto': 'avto', 'moto': 'moto', 'motor': 'moto', 'gospodarska': 'gospodarska', 'prosti-cas': 'prosti-cas' };
    const tabBtns = tabs ? tabs.querySelectorAll('.tab-btn') : [];

    if (tabs && ctx.cat && tabMap[ctx.cat]) {
        // Auto-select the right tab
        tabBtns.forEach(btn => {
            const isTarget = btn.dataset.tab === tabMap[ctx.cat];
            btn.classList.toggle('active', isTarget);
            btn.classList.toggle('on', isTarget);
        });
        // Show correct grid
        showGridForTab(tabMap[ctx.cat]);
    }

    // ── Search-mode pills: separated into /iskanje and /iskanje-drazbe ──
    if (searchTypePills) {
        searchTypePills.style.display = 'none';
        searchTypePills.innerHTML = '';
    }

    // ── Pre-select vehicle type if specified ──
    // Done synchronously (before bindSearchLogic runs) so the initial brand fetch
    // already sees the active card and filters the leisure list by vrsta vozila.
    if (ctx.vtype) {
        const types = ctx.vtype.split(',').map(s => s.trim()).filter(Boolean);
        types.forEach(val => {
            const card = document.querySelector(`.body-type-card[data-value="${val}"]`);
            if (card) {
                card.classList.add('active');
                card.classList.add('on');
            }
        });
        const bodyTypeHidden = document.getElementById('bodyTypeHidden');
        if (bodyTypeHidden) bodyTypeHidden.value = ctx.vtype;
    }

    const hashParamsInit = parseHashParams();
    const fuelParam = hashParamsInit.get('fuel');
    if (fuelParam) {
        const fuels = fuelParam.split(',').map(s => s.trim());
        fuels.forEach(f => {
            const cb = document.querySelector(`input[name="fuel"][value="${f}"]`);
            if (cb) {
                cb.checked = true;
                cb.closest('.chip')?.classList.add('on', 'active');
            }
        });
    }
    const rKm = hashParamsInit.get('rangeKmFrom');
    if (rKm) {
        const rInp = document.querySelector('input[name="rangeKmFrom"]');
        if (rInp) rInp.value = rKm;
    }
    const bKwh = hashParamsInit.get('batteryKwhFrom');
    if (bKwh) {
        const bInp = document.querySelector('input[name="batteryKwhFrom"]');
        if (bInp) bInp.value = bKwh;
    }

    // ── Restore remembered search state ──
    const rememberToggle = document.getElementById('rememberSearchToggle');
    const storageKey = `search_remember_${ctx.cat || 'all'}_${ctx.sub || 'all'}`;
    if (rememberToggle) {
        const wasRemembered = localStorage.getItem(storageKey) === 'true';
        rememberToggle.checked = wasRemembered;
        rememberToggle.addEventListener('change', () => {
            localStorage.setItem(storageKey, rememberToggle.checked);
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Show the correct body-type grid for a tab
// ═══════════════════════════════════════════════════════════════════════════════
function showGridForTab(tabKey) {
    const gridMap = {
        'avto': { id: 'grid-cars', display: 'flex' },
        'moto': { id: 'grid-motorbikes', display: 'block' },
        'gospodarska': { id: 'grid-commercial', display: 'block' },
        'prosti-cas': { id: 'grid-leisure', display: 'flex' },
    };
    Object.values(gridMap).forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = gridMap[tabKey];
    if (target) {
        const el = document.getElementById(target.id);
        if (el) el.style.display = target.display;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Accordions
// ═══════════════════════════════════════════════════════════════════════════════
function bindStickyMobileBar() {
    const searchForm = document.getElementById("advancedSearchForm");
    const stickyBar = document.getElementById("advStickyBar");
    const stickyBtn = document.getElementById("advStickySubmit");
    if (!searchForm || !stickyBar || !stickyBtn) return;
    const showSticky = () => stickyBar.classList.add('visible');
    searchForm.addEventListener('change', showSticky);
    searchForm.addEventListener('input', showSticky);
    stickyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchForm.requestSubmit();
    });
}

function bindAccordions() {
    const accordions = document.querySelectorAll('.adv-accordion');
    accordions.forEach(acc => {
        const trigger = acc.querySelector('.adv-acc-trigger');
        if (!trigger) return;

        // Prevent duplicate listener registration on HMR or re-initialization
        if (trigger.dataset.accordionBound) return;
        trigger.dataset.accordionBound = 'true';

        const isPersistent = acc.classList.contains('persistent-open');
        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
        // On desktop, sections matching VecFiltrovMoto.dc.html start open (Osnovni, Motor, Oprema, Ponudnik, Garancija)
        const startsOpen = isPersistent || (isDesktop && (
            acc.classList.contains('open') ||
            acc.classList.contains('initially-open')
        ));
        const body = acc.querySelector('.adv-acc-body');

        if (startsOpen) {
            trigger.setAttribute('aria-expanded', 'true');
            acc.setAttribute('aria-expanded', 'true');
            acc.classList.add('open');
            acc.classList.remove('closed');
            if (body) body.style.display = 'flex';
        } else {
            trigger.setAttribute('aria-expanded', 'false');
            acc.setAttribute('aria-expanded', 'false');
            acc.classList.remove('open');
            acc.classList.add('closed');
            if (body) body.style.display = 'none';
        }

        const toggleAccordion = () => {
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';
            const ns = !isOpen;
            trigger.setAttribute('aria-expanded', String(ns));
            acc.setAttribute('aria-expanded', String(ns));
            acc.classList.toggle('open', ns);
            acc.classList.toggle('closed', !ns);
            if (body) {
                body.style.display = ns ? 'flex' : 'none';
            }
            const chevronUse = acc.querySelector('.adv-acc-chevron use');
            if (chevronUse) {
                chevronUse.setAttribute('href', ns ? '#i-up2' : '#i-down');
            }
        };

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAccordion();
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                toggleAccordion();
            }
        });

        // Make the entire header row clickable (excluding remember toggle)
        const header = acc.querySelector('.adv-acc-header');
        if (header) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', (e) => {
                if (e.target.closest('.remember-toggle')) return;
                if (e.target.closest('.adv-acc-trigger')) return; // already handled by trigger
                toggleAccordion();
            });
        }
    });

    document.querySelectorAll('.remember-check').forEach(chk => {
        if (chk.dataset.rememberBound) return;
        chk.dataset.rememberBound = 'true';
        const cat = chk.getAttribute('data-category');
        if (cat && localStorage.getItem(`remember_${cat}`) === 'true') chk.checked = true;
        chk.addEventListener('change', () => {
            if (cat) localStorage.setItem(`remember_${cat}`, chk.checked);
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main search logic
// ═══════════════════════════════════════════════════════════════════════════════
function bindSearchLogic(catContext) {
    const searchForm = document.getElementById("advancedSearchForm");
    const makeSelect = document.getElementById("make");
    const modelSelect = document.getElementById("model");
    const variantSelect = document.getElementById("variant");
    const linijaSelect = document.getElementById("linija");
    const linijaGroup = document.getElementById("linijaGroup");
    const addVehicleBtn = document.getElementById("addVehicleBtn");
    const excludeVehicleBtn = document.getElementById("excludeVehicleBtn");
    const vehicleCardsEl = document.getElementById("vehicleCards");
    const excludedVehicleCardsEl = document.getElementById("excludedVehicleCards");
    const excludedVehiclesSection = document.getElementById("excludedVehiclesSection");
    const brandLimitNote = document.getElementById("brandLimitNote");
    const tabBtns = document.querySelectorAll('.tabs-glass .tab-btn, .tabs .tab-btn');
    const bodyTypeHidden = document.getElementById('bodyTypeHidden');
    const allBodyTypeCards = document.querySelectorAll('.body-type-card');
    const yearFromSelect = document.getElementById("year-from");
    const yearToSelect = document.getElementById("year-to");

    if (!searchForm || !makeSelect) return;

    let activeTab = catContext.cat || 'avto';
    let vehicles = [];
    let excludedVehicles = [];
    let activePowerUnit = 'kw';
    const MAX_VEHICLES = 5;

    // ── Category odometer (km vs operating hours) ──
    // Machinery is measured in hours, road vehicles in km, trailers in neither.
    // Driven by resolveFilterSpec() so it stays in lockstep with the create form.
    function currentVrsta() {
        const hv = document.getElementById('hiddenVType');
        return hv ? hv.value : '';
    }
    function applyOdometerUnit() {
        const spec = resolveFilterSpec(activeTab, currentVrsta());
        const kmBlock = document.getElementById('odometerKmBlock');
        const hoursBlock = document.getElementById('odometerHoursBlock');
        const showKm = spec.odometer === 'km';
        const showHours = spec.odometer === 'hours';
        if (kmBlock) kmBlock.style.display = showKm ? '' : 'none';
        if (hoursBlock) hoursBlock.style.display = showHours ? '' : 'none';
        // Clear the hidden unit's inputs so a stale value can't leak into the filter.
        if (!showKm) {
            const mf = document.querySelector('input[name="mileageFrom"]');
            const mt = document.querySelector('input[name="mileageTo"]');
            if (mf) mf.value = ''; if (mt) mt.value = '';
        }
        if (!showHours) {
            const hf = document.querySelector('input[name="engineHoursFrom"]');
            const ht = document.querySelector('input[name="engineHoursTo"]');
            if (hf) hf.value = ''; if (ht) ht.value = '';
        }
    }

    function applyLeisureFieldVisibility() {
        if (activeTab !== 'prosti-cas') return;
        const types = getSelectedLeisureTypes();
        // No card picked yet → assume a motorised vehicle so engine filters stay available.
        const hasMotor = types.length === 0 || types.some(t => LEISURE_MOTORIZED.includes(t));

        const engineAcc = document.getElementById('acc-engine');
        if (engineAcc) engineAcc.style.display = hasMotor ? 'block' : 'none';

        // Trim engine configs / fuels to what leisure vehicles actually use.
        applyChipGroup('engineConfig', LEISURE_ENGINE_CONFIGS);
        applyChipGroup('fuel', LEISURE_FUELS);

        // "Število vrat" (2/3, 4/5…) is a passenger-car facet — not meaningful here.
        const doorsField = document.getElementById('doorsField');
        if (doorsField) doorsField.style.display = 'none';
    }

    // ── Dynamic Field Visibility ──
    function toggleVehicleSpecificFields(tab) {
        const carFields = document.querySelectorAll('.car-only-field');
        const motoFields = document.querySelectorAll('.moto-only-field');
        const accInterior = document.getElementById('acc-interior');
        const engineAcc = document.getElementById('acc-engine');

        if (tab === 'moto') {
            if (engineAcc) engineAcc.classList.add('is-moto-engine');
            carFields.forEach(el => {
                el.style.display = 'none';
                el.querySelectorAll('input, select').forEach(i => i.disabled = true);
            });
            motoFields.forEach(el => {
                el.querySelectorAll('input, select').forEach(i => i.disabled = false);
                if (el.id === 'moto-equipment') el.style.display = 'block';
                else if (el.classList.contains('adv-grid-2') || el.classList.contains('g2')) el.style.display = 'grid';
                else el.style.display = 'block';
            });
            if (accInterior) accInterior.style.display = 'none';
        } else {
            if (engineAcc) engineAcc.classList.remove('is-moto-engine');
            carFields.forEach(el => {
                el.querySelectorAll('input, select').forEach(i => i.disabled = false);
                if (el.classList.contains('adv-accordion')) el.style.display = 'block';
                else if (el.classList.contains('adv-grid-2') || el.classList.contains('g2')) el.style.display = 'grid';
                else el.style.display = 'block';
            });
            motoFields.forEach(el => {
                el.style.display = 'none';
                el.querySelectorAll('input, select').forEach(i => i.disabled = true);
            });
            if (accInterior) accInterior.style.display = 'block';
        }

        // Category-driven odometer unit (km ↔ operating hours) for every tab.
        applyOdometerUnit();

        if (tab === 'prosti-cas') {
            applyLeisureFieldVisibility();
        } else {
            // Resolve engine-config / fuel visibility from the central schema.
            const spec = resolveFilterSpec(tab, currentVrsta());
            if (engineAcc) engineAcc.style.display = spec.showEngine ? 'block' : 'none';
            applyChipGroup('engineConfig', spec.engineConfigs === 'none' ? new Set() : spec.engineConfigs);
            // Hide the whole engine-config field group when the tab has no car-style config.
            const cfgGroup = document.querySelector('input[name="engineConfig"]')?.closest('.car-only-field');
            if (cfgGroup) cfgGroup.style.display = spec.engineConfigs === 'none' ? 'none' : '';
            // Fuel narrowing for non-moto tabs is handled in applyRelevance (byVrsta),
            // so only reset to "all" here when the spec asks for the full list.
            if (spec.fuels === null) applyChipGroup('fuel', null);
        }

        // The hybrid sub-groups are .car-only-field elements the loops above just
        // revealed, but they must stay collapsed until "Hibrid" (and a hybrid type)
        // is actually checked. Re-derive their state from the current selection.
        syncHybridSubGroups();
    }

    // Collapse/expand the hybrid sub-option groups to match the live selection.
    function syncHybridSubGroups() {
        const hibridCheck = document.getElementById('fuelHibridCheck');
        const typeGroup   = document.getElementById('hybridTypeGroup');
        const engineGroup = document.getElementById('hybridEngineGroup');
        if (typeGroup) typeGroup.style.display = (hibridCheck && hibridCheck.checked) ? 'block' : 'none';
        if (engineGroup) {
            const anyType = typeGroup
                ? [...typeGroup.querySelectorAll('.hybrid-type-check')].some(c => c.checked)
                : false;
            engineGroup.style.display = anyType ? 'block' : 'none';
        }
    }
    toggleVehicleSpecificFields(activeTab);
    showGridForTab(activeTab);

    // ── Cascading relevance ───────────────────────────────────────────────────
    // Narrows downstream filter options to what the upstream selection supports:
    //   • moto: brand/model → Takt, Valji, layout, Prenos moči (from JSON data)
    //   • gospodarska: vrsta → Vrsta goriva (from curated COMMERCIAL_FUEL_MAP)
    // Called on every selection change that can affect the available options.

    // Rebuild a <select>'s options to the allowed subset, preserving the current
    // value when it is still valid. The customSelect MutationObserver re-syncs the
    // visible dropdown automatically. Returns true if the selected value changed.
    function rebuildSelectOptions(selectEl, placeholder, optionDefs, allowedSet) {
        if (!selectEl) return false;
        const prev = selectEl.value;
        const shown = optionDefs.filter(o => !allowedSet || allowedSet.has(o.v));
        selectEl.innerHTML = `<option value="">${placeholder}</option>` +
            shown.map(o => `<option value="${o.v}">${o.l}</option>`).join('');
        const stillValid = prev && shown.some(o => o.v === prev);
        selectEl.value = stillValid ? prev : '';
        return prev !== selectEl.value;
    }

    // Show/hide the .adv-chip labels of a checkbox group based on allowed values.
    // Unchecks any chip that becomes hidden. allowedSet null = show all.
    function applyChipGroup(name, allowedSet) {
        let visibleCount = 0;
        document.querySelectorAll(`input[name="${name}"]`).forEach(inp => {
            const label = inp.closest('.adv-chip');
            if (!label) return;
            const ok = !allowedSet || allowedSet.has(inp.value);
            label.style.display = ok ? '' : 'none';
            if (ok) visibleCount++;
            else if (inp.checked) inp.checked = false;
        });
        return visibleCount;
    }

    // Rebuild the cylinder-layout <select> for the chosen cylinder count, narrowed
    // to the engine codes still possible given the other engine choices.
    function rebuildLayoutOptions(facets) {
        const cylSel = document.getElementById('moto-cylinders');
        const layoutSel = document.getElementById('moto-cylinder-layout');
        const layoutGroup = document.getElementById('cylinder-layout-group');
        if (!cylSel || !layoutSel || !layoutGroup) return;

        const base = MOTO_LAYOUTS[cylSel.value];
        if (!base) {
            layoutGroup.style.display = 'none';
            layoutSel.innerHTML = '';
            return;
        }
        const codes = facets && facets.engineCodes;
        let shown = (codes && codes.size)
            ? base.filter(o => [...codes].some(c => codeMatchesLayout(c, o.v)))
            : base;
        if (shown.length === 0) shown = base; // never strand the user with nothing

        const prev = layoutSel.value;
        layoutGroup.style.display = 'block';
        layoutSel.innerHTML = '<option value="">Vse konfiguracije</option>' +
            shown.map(o => `<option value="${o.v}">${o.l}</option>`).join('');
        layoutSel.value = (prev && shown.some(o => o.v === prev)) ? prev : '';
    }

    function applyRelevance() {
        // ── Moto engine cascade (faceted, data-driven) ──
        if (activeTab === 'moto') {
            const sels = [];
            if (makeSelect.value) sels.push({ make: makeSelect.value, model: modelSelect.value || '' });
            vehicles.forEach(v => sels.push({ make: v.make, model: v.model || '' }));
            const variants = getMotoVariants(window._brandModelData, sels);

            const strokeSel = document.querySelector('select[name="stroke"]');
            const cylSel = document.getElementById('moto-cylinders');
            const layoutSel = document.getElementById('moto-cylinder-layout');

            if (variants.length === 0) {
                // No brand/model picked → no constraint, show every option.
                rebuildSelectOptions(strokeSel, 'Vsi takti', MOTO_STROKE_OPTIONS, null);
                rebuildSelectOptions(cylSel, 'Valji', MOTO_CYLINDER_OPTIONS, null);
                rebuildLayoutOptions(null);
                applyChipGroup('motoDrivetrain', null);
            } else {
                // Current engine selections constrain each other (faceted).
                const cylVal = cylSel ? cylSel.value : '';
                // Only honour the layout if it belongs to the chosen cylinder count,
                // otherwise a stale value (e.g. V4 left over after switching to 2
                // cylinders) would wipe out every facet.
                const layoutVal = (layoutSel && cylVal && MOTO_LAYOUTS[cylVal]
                    && MOTO_LAYOUTS[cylVal].some(o => o.v === layoutSel.value))
                    ? layoutSel.value : '';
                const constraints = {
                    stroke: strokeSel ? strokeSel.value : '',
                    cylinders: cylVal,
                    layout: layoutVal,
                    drivetrains: Array.from(
                        document.querySelectorAll('input[name="motoDrivetrain"]:checked')
                    ).map(i => i.value),
                };
                const facets = computeMotoFacets(variants, constraints);
                rebuildSelectOptions(strokeSel, 'Vsi takti', MOTO_STROKE_OPTIONS, facets.strokes);
                rebuildSelectOptions(cylSel, 'Valji', MOTO_CYLINDER_OPTIONS, facets.cylinders);
                rebuildLayoutOptions(facets);
                applyChipGroup('motoDrivetrain', facets.drivetrains);
            }
        }

        // ── Commercial cascade (curated, per vrsta) ──
        if (activeTab === 'gospodarska') {
            const spec = resolveFilterSpec('gospodarska', currentVrsta());
            const allowed = spec.fuels instanceof Set ? spec.fuels : null;
            const visible = applyChipGroup('fuel', allowed);
            // Hide the whole "Vrsta goriva" group when the vrsta has no engine
            const fuelGroup = document.querySelector('input[name="fuel"]')?.closest('.adv-field-group');
            if (fuelGroup) fuelGroup.style.display = (allowed && visible === 0) ? 'none' : '';
            // Selecting a vrsta may switch km↔hours and toggle the engine accordion.
            applyOdometerUnit();
            const engineAcc = document.getElementById('acc-engine');
            if (engineAcc) engineAcc.style.display = spec.showEngine ? 'block' : 'none';
        } else if (activeTab === 'prosti-cas') {
            // Leisure vehicles: keep the trimmed fuel list (don't restore car-only fuels).
            applyChipGroup('fuel', LEISURE_FUELS);
            const fuelGroup = document.querySelector('input[name="fuel"]')?.closest('.adv-field-group');
            if (fuelGroup) fuelGroup.style.display = '';
        } else {
            // Any non-commercial tab: restore the full fuel list
            applyChipGroup('fuel', null);
            const fuelGroup = document.querySelector('input[name="fuel"]')?.closest('.adv-field-group');
            if (fuelGroup && activeTab !== 'moto') fuelGroup.style.display = '';
        }
    }

    // ── Vehicle Lines Data ──
    let _vehicleLinesData = null;
    function loadVehicleLines() {
        if (_vehicleLinesData) return Promise.resolve(_vehicleLinesData);
        return fetch('/json/vehicle_lines.json')
            .then(r => r.ok ? r.json() : {})
            .then(d => { _vehicleLinesData = d; return d; })
            .catch(() => { _vehicleLinesData = {}; return {}; });
    }

    function updateLinijaDropdown(make) {
        if (!linijaSelect || !linijaGroup) return;
        linijaSelect.innerHTML = '<option value="">Linija</option>';
        linijaSelect.value = '';
        const lines = (_vehicleLinesData || {})[make] || [];
        if (lines.length) {
            lines.forEach(l => {
                const o = document.createElement('option'); o.value = l; o.textContent = l;
                linijaSelect.appendChild(o);
            });
            linijaGroup.style.display = '';
        } else {
            linijaGroup.style.display = 'none';
        }
    }

    loadVehicleLines();

    // ── Approved custom equipment per brand ──
    let _customEquipCache = {};
    async function loadCustomEquipmentForBrand(brand) {
        if (!brand) { injectCustomEquipChips([]); return; }
        if (_customEquipCache[brand] !== undefined) { injectCustomEquipChips(_customEquipCache[brand]); return; }
        try {
            const proposals = await getApprovedProposalsForBrand(brand);
            const equipment = proposals.filter(p => p.type === 'equipment');
            _customEquipCache[brand] = equipment;
            injectCustomEquipChips(equipment);
        } catch { injectCustomEquipChips([]); }
    }

    function injectCustomEquipChips(proposals) {
        // Remove any previously injected custom chips
        document.querySelectorAll('.adv-chip--custom').forEach(el => el.remove());
        if (!proposals.length) return;
        // Group by category and append to matching adv-chip-group sections
        const byCat = {};
        proposals.forEach(p => { (byCat[p.category] = byCat[p.category] || []).push(p); });
        Object.entries(byCat).forEach(([cat, items]) => {
            // Find the section header whose text contains the category group id
            // Sections use data-eq-group attribute set during render, or we match by id
            const groupEl = document.querySelector(`.adv-chip-group[data-eq-group="${cat}"]`);
            if (!groupEl) return;
            items.forEach(item => {
                const escaped = item.value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
                const label = document.createElement('label');
                label.className = 'chip adv-chip--custom';
                label.title = 'Lastna oprema za to znamko';
                label.innerHTML = `<input type="checkbox" name="customEquipment" value="${escaped}" data-cat="${cat}"> ${escaped}`;
                groupEl.appendChild(label);
            });
        });
    }

    // ── Leisure (prosti-cas) type filtering ──
    // The prosti-cas taxonomy bundles all 5 vrsta-vozila types in one file; each
    // model carries a `type` matching the body-type-card data-value. Selecting a
    // card narrows the brand/model lists to that type (union if several selected).
    function getSelectedLeisureTypes() {
        const grid = document.getElementById('grid-leisure');
        if (!grid) return [];
        return Array.from(grid.querySelectorAll('.body-type-card.active'))
            .map(c => c.getAttribute('data-value'))
            .filter(Boolean);
    }

    function filterLeisureData(data, types) {
        if (!types || !types.length) return data;
        const out = {};
        for (const [brand, models] of Object.entries(data || {})) {
            const kept = {};
            for (const [model, info] of Object.entries(models || {})) {
                if (info && types.includes(info.type)) kept[model] = info;
            }
            if (Object.keys(kept).length) out[brand] = kept;
        }
        return out;
    }

    // Build the make dropdown from a (possibly filtered) brand→model map.
    function populateMakeSelect(data, category) {
        const prevMake = makeSelect.value;
        makeSelect.innerHTML = '<option value="">Znamka</option>';
        const sorted = Object.keys(data).sort();

        const popular = popularBrandsFor(category).filter(b => data[b]);
        if (popular.length) {
            const lbl = document.createElement('option');
            lbl.value = ''; lbl.textContent = '— Najbolj priljubljene —';
            lbl.disabled = true; lbl.dataset.popularLabel = 'true';
            makeSelect.appendChild(lbl);
            popular.forEach(brand => {
                const o = document.createElement('option');
                o.value = brand; o.textContent = brand;
                o.dataset.popular = 'true';
                if (brand === prevMake) o.selected = true;
                makeSelect.appendChild(o);
            });
            const sep = document.createElement('option');
            sep.value = ''; sep.textContent = '──────────────';
            sep.disabled = true; sep.dataset.popularLabel = 'true';
            makeSelect.appendChild(sep);
        }

        sorted.forEach(brand => {
            const o1 = document.createElement("option"); o1.value = brand; o1.textContent = brand;
            if (brand === prevMake) o1.selected = true;
            makeSelect.appendChild(o1);
        });
        if (!data[prevMake]) {
            modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
            variantSelect.innerHTML = '<option value="">Različica</option>'; variantSelect.disabled = true;
        }
        // The custom-select wrapper auto-syncs via its MutationObserver on <option> changes.
    }

    // Re-filter the already-loaded leisure brand data after a card toggle.
    function refreshLeisureBrandFilter() {
        if (activeTab !== 'prosti-cas') return;
        const raw = window._brandModelDataRaw || {};
        const view = filterLeisureData(raw, getSelectedLeisureTypes());
        window._brandModelData = view;
        populateMakeSelect(view, 'prosti-cas');
        makeSelect.dispatchEvent(new Event('change'));
        applyRelevance();
    }

    // ── Dynamic Brand Data Loading ──
    function fetchBrandData(category) {
        const jsonFile = brandsFileFor(category);

        return fetch(jsonFile)
            .then(r => r.ok ? r.json() : {})
            .then(data => {
                window._brandModelDataRaw = data;
                if (category === 'prosti-cas') {
                    data = filterLeisureData(data, getSelectedLeisureTypes());
                }
                window._brandModelData = data;
                populateMakeSelect(data, category);

                const savedOsnovni = localStorage.getItem(`avto_advanced_${activeTab}_osnovni`);
                if (savedOsnovni) {
                    const sp = new URLSearchParams(savedOsnovni);
                    const savedMake = sp.get('make');
                    if (savedMake && data[savedMake]) {
                        makeSelect.value = savedMake;
                        makeSelect._syncCustomSelect?.();
                        makeSelect.dispatchEvent(new Event('change', { bubbles: true }));

                        const savedModel = sp.get('model');
                        if (savedModel) {
                            setTimeout(() => {
                                modelSelect.value = savedModel;
                                modelSelect._syncCustomSelect?.();
                                modelSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            }, 50);
                        }
                    }
                }

                return data;
            });
    }

    function clearFormInputsForTab() {
        searchForm.querySelectorAll('input:not(.remember-check), select').forEach(el => {
            if (['cat', 'sub', 'searchType', 'najem', 'vtype'].includes(el.name)) return;
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = false;
                el.closest('.chip')?.classList.remove('on', 'active');
            } else {
                el.value = '';
            }
        });
        searchForm.querySelectorAll('.remember-check').forEach(chk => {
            chk.checked = false;
            chk.closest('.remember-toggle')?.classList.remove('on');
        });
        searchForm.querySelectorAll('.sw2').forEach(s => s.classList.remove('on'));
        allBodyTypeCards.forEach(c => {
            c.classList.remove('active');
            c.classList.remove('on');
        });
        sliderResetters.forEach(fn => fn());
        if (bodyTypeHidden) bodyTypeHidden.value = '';
        if (motoGroupSelector) motoGroupSelector.reset();
        if (commercialSelector) commercialSelector.reset();
        vehicles = [];
        excludedVehicles = [];
        renderVehicleCards();
        renderExcludedCards();
    }

    // ── Tabs ──
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.remove('on');
            });
            btn.classList.add('active');
            btn.classList.add('on');
            
            activeTab = btn.dataset.tab;
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('cat', activeTab);
                window.history.replaceState(null, '', url.toString());
            } catch {}

            showGridForTab(activeTab);
            toggleVehicleSpecificFields(activeTab);
    showGridForTab(activeTab);
            if (activeTab !== 'moto') populateEquipmentChips(activeTab);
            fetchBrandData(activeTab).then(applyRelevance);

            catContext.cat = activeTab;
            catContext.sub = '';
            injectRentalToggle(catContext);

            // Ensure non-persistent accordions (e.g. Motor in pogon) stay closed on tab switch
            document.querySelectorAll('.adv-accordion').forEach(a => {
                if (!a.classList.contains('persistent-open')) {
                    const trig = a.querySelector('.adv-acc-trigger');
                    const b = a.querySelector('.adv-acc-body');
                    if (trig) trig.setAttribute('aria-expanded', 'false');
                    a.setAttribute('aria-expanded', 'false');
                    a.classList.remove('open');
                    a.classList.add('closed');
                    if (b) b.style.display = 'none';
                    const chv = a.querySelector('.adv-acc-chevron use');
                    if (chv) chv.setAttribute('href', '#i-down');
                }
            });

            clearFormInputsForTab();
            syncAllRemember();
            updateLiveCount();
        });
    });

    // ── Exhaust Brand Tag Input ──
    const exhaustCheck      = document.getElementById('sport-exhaust-check');
    const exhaustTagsRow    = document.getElementById('exhaust-tags-row');
    const exhaustTagsList   = document.getElementById('exhaust-tags-list');
    const exhaustBrandSelect = document.getElementById('exhaust-brand-select');

    if (exhaustCheck && exhaustTagsRow && exhaustBrandSelect) {
        function addExhaustTag(brand) {
            if (!brand) return;
            if ([...exhaustTagsList.querySelectorAll('.exhaust-tag')].some(t => t.dataset.value === brand)) return;
            const tag = document.createElement('span');
            tag.className = 'adv-chip exhaust-tag';
            tag.dataset.value = brand;
            tag.style.cssText = 'display:inline-flex;align-items:center;gap:0.25rem;';
            const hidden = document.createElement('input');
            hidden.type = 'hidden'; hidden.name = 'exhaustBrand'; hidden.value = brand;
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button'; removeBtn.className = 'exhaust-tag-remove'; removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => { tag.remove(); updateLiveCount(); });
            tag.append(document.createTextNode(brand), removeBtn, hidden);
            exhaustTagsList.appendChild(tag);
            updateLiveCount();
        }

        fetch('/json/exhaust_brands.json')
            .then(r => r.json())
            .then(brands => {
                brands.forEach(b => {
                    const o = document.createElement('option');
                    o.value = b; o.textContent = b;
                    exhaustBrandSelect.appendChild(o);
                });
                createCustomSelect(exhaustBrandSelect);
                // Size the container to fit-content instead of full-width
                const csc = exhaustBrandSelect.previousElementSibling;
                if (csc && csc.classList.contains('custom-select-container')) {
                    csc.style.cssText = 'width:auto; min-width:160px; position:relative;';
                }
                exhaustBrandSelect.addEventListener('change', () => {
                    const val = exhaustBrandSelect.value;
                    if (!val) return;
                    addExhaustTag(val);
                    // Reset select back to placeholder
                    exhaustBrandSelect.selectedIndex = 0;
                    const valueSpan = csc?.querySelector('.custom-select-value');
                    if (valueSpan) valueSpan.textContent = 'Znamka izpuha';
                });
            })
            .catch(() => {});

        exhaustCheck.addEventListener('change', () => {
            exhaustTagsRow.style.display = exhaustCheck.checked ? 'inline-flex' : 'none';
            if (!exhaustCheck.checked) exhaustTagsList.innerHTML = '';
            updateLiveCount();
        });
    }

    const cylindersSelect = document.getElementById('moto-cylinders');
    const layoutGroup = document.getElementById('cylinder-layout-group');
    const layoutSelect = document.getElementById('moto-cylinder-layout');
    if (cylindersSelect) {
        // Cylinders / layout / drivetrain all cross-filter each other, so re-run the
        // faceted relevance pass on any engine change (it rebuilds the layout list).
        cylindersSelect.addEventListener('change', () => { applyRelevance(); updateLiveCount(); });
        if (layoutSelect) layoutSelect.addEventListener('change', () => { applyRelevance(); updateLiveCount(); });
        const strokeSelect = document.querySelector('select[name="stroke"]');
        if (strokeSelect) strokeSelect.addEventListener('change', () => { applyRelevance(); updateLiveCount(); });
        document.querySelectorAll('input[name="motoDrivetrain"]').forEach(chk =>
            chk.addEventListener('change', () => { applyRelevance(); updateLiveCount(); }));

        // ── Dodaj / Odstrani buttons for cylinder filters ──
        // cylFilters: [{ cylinders, layout, label, key, exclude: bool }]
        let cylFilters = [];
        const cylChipsEl   = document.getElementById('cylFilterChips');
        const cylAddBtn    = document.getElementById('cylAddBtn');
        const cylRemoveBtn = document.getElementById('cylRemoveBtn');

        function buildCylEntry(exclude) {
            const cyl = cylindersSelect.value;
            if (!cyl) return null;
            const layout = layoutSelect ? layoutSelect.value : '';
            const cylLabel = cylindersSelect.options[cylindersSelect.selectedIndex]?.text || cyl;
            const layoutLabel = layout ? (layoutSelect.options[layoutSelect.selectedIndex]?.text || layout) : '';
            const label = layoutLabel ? `${cylLabel} · ${layoutLabel}` : cylLabel;
            const key = (exclude ? 'x|' : 'i|') + cyl + '|' + layout;
            if (cylFilters.some(f => f.key === key)) return null;
            return { cylinders: cyl, layout, label, key, exclude };
        }

        function resetCylDropdowns() {
            cylindersSelect.value = '';
            cylindersSelect._syncCustomSelect?.();
            if (layoutGroup) layoutGroup.style.display = 'none';
            if (layoutSelect) {
                layoutSelect.innerHTML = '';
                layoutSelect._syncCustomSelect?.();
            }
        }

        function renderCylChips() {
            if (!cylChipsEl) return;
            cylChipsEl.innerHTML = '';
            cylFilters.forEach((f, i) => {
                const chip = document.createElement('span');
                chip.className = f.exclude ? 'cyl-filter-chip cyl-filter-chip-exclude' : 'cyl-filter-chip';
                const btn = document.createElement('button');
                btn.type = 'button'; btn.textContent = '×';
                btn.addEventListener('click', () => { cylFilters.splice(i, 1); renderCylChips(); updateLiveCount(); });
                chip.append(document.createTextNode(f.exclude ? '≠ ' + f.label : f.label), btn);
                cylChipsEl.appendChild(chip);
            });
        }

        if (cylAddBtn) {
            cylAddBtn.addEventListener('click', () => {
                const entry = buildCylEntry(false);
                if (!entry) return;
                cylFilters.push(entry);
                resetCylDropdowns();
                renderCylChips();
                updateLiveCount();
            });
        }

        if (cylRemoveBtn) {
            cylRemoveBtn.addEventListener('click', () => {
                const entry = buildCylEntry(true);
                if (!entry) return;
                cylFilters.push(entry);
                resetCylDropdowns();
                renderCylChips();
                updateLiveCount();
            });
        }

        // Expose cylFilters so matchesFilters can read them
        window._cylFilters = cylFilters;
    }

    // ── Bind Motorcycle Interactive Controls (VecFiltrovMoto 1:1) ──
    bindMotoInteractiveControls();

    function bindMotoInteractiveControls() {
        // 1. Moč motorja unit toggle & slider
        const powerUnitToggle = document.getElementById('advPowerUnitToggle');
        const powerFrom = document.getElementById('powerFromInput');
        const powerTo = document.getElementById('powerToInput');
        const powerNote = document.getElementById('powerNote');
        const powerSliderFill = document.getElementById('powerSliderFill');
        const powerMinHandle = document.getElementById('powerSliderHandleMin');
        const powerMaxHandle = document.getElementById('powerSliderHandleMax');
        const powerUnitSuffixFrom = document.getElementById('powerUnitSuffixFrom');
        const powerUnitSuffixTo = document.getElementById('powerUnitSuffixTo');

        const updatePowerUI = () => {
            const pFrom = parseFloat(powerFrom?.value) || 0;
            const pTo = parseFloat(powerTo?.value);
            const isKM = activePowerUnit === 'km';
            const unitStr = isKM ? 'KM' : 'kW';
            if (powerUnitSuffixFrom) powerUnitSuffixFrom.textContent = unitStr;
            if (powerUnitSuffixTo) powerUnitSuffixTo.textContent = unitStr;

            if (powerNote) {
                if (pFrom > 0 && !isNaN(pTo)) {
                    powerNote.textContent = isKM
                        ? `${pFrom} – ${pTo} KM (${Math.round(pFrom / 1.36)} – ${Math.round(pTo / 1.36)} kW)`
                        : `${pFrom} – ${pTo} kW (${Math.round(pFrom * 1.36)} – ${Math.round(pTo * 1.36)} KM)`;
                } else if (pFrom > 0) {
                    powerNote.textContent = isKM
                        ? `od ${pFrom} KM (${Math.round(pFrom / 1.36)} kW)`
                        : `od ${pFrom} kW (${Math.round(pFrom * 1.36)} KM)`;
                } else if (!isNaN(pTo)) {
                    powerNote.textContent = isKM
                        ? `do ${pTo} KM (${Math.round(pTo / 1.36)} kW)`
                        : `do ${pTo} kW (${Math.round(pTo * 1.36)} KM)`;
                } else {
                    powerNote.textContent = isKM ? 'od 48 KM (35 kW)' : 'od 35 kW (48 KM)';
                }
            }
            if (powerSliderFill && powerMinHandle && powerMaxHandle) {
                const maxVal = isKM ? 200 : 150;
                const minPct = Math.min(100, Math.max(0, (pFrom / maxVal) * 100));
                const maxPct = isNaN(pTo) ? 100 : Math.min(100, Math.max(0, (pTo / maxVal) * 100));
                powerMinHandle.style.left = `${minPct}%`;
                powerMaxHandle.style.left = `${maxPct}%`;
                powerSliderFill.style.left = `${minPct}%`;
                powerSliderFill.style.right = `${100 - maxPct}%`;
            }
        };

        if (powerUnitToggle) {
            powerUnitToggle.querySelectorAll('.unit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    powerUnitToggle.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('on', 'active'));
                    btn.classList.add('on', 'active');
                    activePowerUnit = btn.dataset.unit || 'kw';
                    updatePowerUI();
                    updateLiveCount();
                });
            });
        }
        if (powerFrom) powerFrom.addEventListener('input', () => { updatePowerUI(); updateLiveCount(); });
        if (powerTo) powerTo.addEventListener('input', () => { updatePowerUI(); updateLiveCount(); });
        updatePowerUI();

        // 2. Prostornina motorja slider & inputs
        const dispFrom = document.getElementById('dispFromInput');
        const dispTo = document.getElementById('dispToInput');
        const dispNote = document.getElementById('dispNote');
        const dispSliderFill = document.getElementById('dispSliderFill');
        const dispMinHandle = document.getElementById('dispSliderHandleMin');
        const dispMaxHandle = document.getElementById('dispSliderHandleMax');

        const updateDispUI = () => {
            const dFrom = parseFloat(dispFrom?.value) || 0;
            const dTo = parseFloat(dispTo?.value);
            if (dispNote) {
                if (dFrom > 0 && !isNaN(dTo)) {
                    dispNote.textContent = `${dFrom} – ${dTo} ccm`;
                } else if (dFrom > 0) {
                    dispNote.textContent = `od ${dFrom} ccm`;
                } else if (!isNaN(dTo)) {
                    dispNote.textContent = `do ${dTo} ccm`;
                } else {
                    dispNote.textContent = '600 – 1.300 ccm';
                }
            }
            if (dispSliderFill && dispMinHandle && dispMaxHandle) {
                const minPct = Math.min(100, Math.max(0, ((dFrom - 50) / 1750) * 100));
                const maxPct = isNaN(dTo) ? 100 : Math.min(100, Math.max(0, ((dTo - 50) / 1750) * 100));
                dispMinHandle.style.left = `${minPct}%`;
                dispMaxHandle.style.left = `${maxPct}%`;
                dispSliderFill.style.left = `${minPct}%`;
                dispSliderFill.style.right = `${100 - maxPct}%`;
            }
        };
        if (dispFrom) dispFrom.addEventListener('input', () => { updateDispUI(); updateLiveCount(); });
        if (dispTo) dispTo.addEventListener('input', () => { updateDispUI(); updateLiveCount(); });
        updateDispUI();

        // 3. Menjalnik segmented toggle
        const transSeg = document.getElementById('advTransmissionSeg');
        const transSelect = document.getElementById('transmissionSelect');
        if (transSeg) {
            transSeg.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    transSeg.querySelectorAll('button').forEach(b => b.classList.remove('on', 'active'));
                    btn.classList.add('on', 'active');
                    if (transSelect) transSelect.value = btn.dataset.val || '';
                    updateLiveCount();
                });
            });
        }

        // 4. A2 izpit segmented toggle
        const a2Toggle = document.getElementById('advA2Toggle');
        const a2Input = document.getElementById('a2EligibleInput');
        if (a2Toggle) {
            a2Toggle.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    a2Toggle.querySelectorAll('button').forEach(b => b.classList.remove('on', 'active'));
                    btn.classList.add('on', 'active');
                    if (a2Input) a2Input.value = btn.dataset.a2 === 'yes' ? 'yes' : '';
                    updateLiveCount();
                });
            });
        }

        // 5. Takt motorja segmented toggle
        const strokeSeg = document.getElementById('advStrokeSeg');
        const strokeSelect = document.getElementById('strokeSelect');
        if (strokeSeg) {
            strokeSeg.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    strokeSeg.querySelectorAll('button').forEach(b => b.classList.remove('on', 'active'));
                    btn.classList.add('on', 'active');
                    if (strokeSelect) {
                        strokeSelect.value = btn.dataset.stroke || '';
                        strokeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    applyRelevance();
                    updateLiveCount();
                });
            });
        }

        // 6. Število valjev chips & dynamic layout
        const cylChips = document.getElementById('motoCylChips');
        const cylSelect = document.getElementById('moto-cylinders');
        const cylSummary = document.getElementById('motoCylSummary');
        const layoutSub = document.getElementById('motoLayoutSub');
        const layoutChipsContainer = document.getElementById('motoLayoutChips');
        const layoutCylLabel = document.getElementById('motoLayoutCylLabel');
        const layoutBadge = document.getElementById('motoLayoutChosenBadge');

        const renderLayoutChipsForCyl = (cyl) => {
            if (!layoutChipsContainer || !layoutSub) return;
            const layouts = MOTO_LAYOUTS[cyl];
            if (!layouts || layouts.length === 0) {
                layoutSub.style.display = 'none';
                return;
            }
            layoutSub.style.display = 'flex';
            if (layoutCylLabel) layoutCylLabel.textContent = cyl === '1' ? '1 valj' : (cyl === '2' ? '2 valja' : (cyl === 'Wankel' ? 'Wankel' : `${cyl} valji`));
            
            layoutChipsContainer.innerHTML = layouts.map(l => {
                return `<button type="button" class="chip sm" data-layout="${l.v}"><span>${l.l}</span></button>`;
            }).join('');

            layoutChipsContainer.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    btn.classList.toggle('on');
                    btn.classList.toggle('active');
                    const selectedLayouts = Array.from(layoutChipsContainer.querySelectorAll('button.on')).map(b => b.dataset.layout);
                    if (layoutBadge) layoutBadge.textContent = selectedLayouts.length > 0 ? `${selectedLayouts.length} izbrani` : '';
                    window._cylFilters = selectedLayouts.map(lay => ({
                        cylinders: cyl,
                        layout: lay,
                        label: lay,
                        key: 'i|' + cyl + '|' + lay,
                        exclude: false
                    }));
                    const layoutSelect = document.getElementById('moto-cylinder-layout');
                    if (layoutSelect) layoutSelect.value = selectedLayouts[0] || '';
                    updateLiveCount();
                });
            });
        };

        if (cylChips) {
            cylChips.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    cylChips.querySelectorAll('button').forEach(b => b.classList.remove('on', 'active'));
                    btn.classList.add('on', 'active');
                    const cylVal = btn.dataset.cyl || '';
                    if (cylSelect) {
                        cylSelect.value = cylVal;
                        cylSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (cylSummary) cylSummary.textContent = cylVal ? (cylVal === '1' ? '1 valj' : (cylVal === '2' ? '2 valja' : (cylVal === 'Wankel' ? 'Wankel' : `${cylVal} valjev`))) : 'Vsi';
                    renderLayoutChipsForCyl(cylVal);
                    applyRelevance();
                    updateLiveCount();
                });
            });
        }

        // 7. Prenos moči chips
        const dtGroup = document.getElementById('motoDrivetrainGroup');
        if (dtGroup) {
            dtGroup.querySelectorAll('label.chip').forEach(label => {
                const chk = label.querySelector('input[type="checkbox"]');
                const icon = label.querySelector('.chk-icon');
                if (!chk) return;
                const sync = () => {
                    label.classList.toggle('on', chk.checked);
                    label.classList.toggle('active', chk.checked);
                    if (icon) icon.style.display = chk.checked ? 'inline-block' : 'none';
                };
                sync();
                chk.addEventListener('change', () => {
                    sync();
                    applyRelevance();
                    updateLiveCount();
                });
            });
        }

        // 8. 6-osni IMU switch
        const imuSwitchBtn = document.getElementById('imu-switch-btn');
        const imuTrigger = document.getElementById('imu-trigger-checkbox');
        const imuSubRow = document.getElementById('imuSubRow');
        const imuSubs = document.querySelectorAll('.imu-sub');
        if (imuSwitchBtn && imuTrigger) {
            const syncIMU = (checked) => {
                imuSwitchBtn.classList.toggle('on', checked);
                imuSwitchBtn.setAttribute('aria-checked', String(checked));
                if (imuSubRow) imuSubRow.style.display = checked ? 'flex' : 'none';
                imuSubs.forEach(cb => {
                    cb.checked = checked;
                    cb.closest('.chip')?.classList.toggle('on', checked);
                    cb.closest('.chip')?.classList.toggle('active', checked);
                });
            };
            imuTrigger.addEventListener('change', () => {
                syncIMU(imuTrigger.checked);
                updateLiveCount();
            });
            imuSwitchBtn.addEventListener('click', (e) => {
                if (e.target !== imuTrigger) {
                    imuTrigger.checked = !imuTrigger.checked;
                    imuTrigger.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            syncIMU(imuTrigger.checked);
        }

        // 9. Sport exhaust
        const exhaustLabel = document.getElementById('sport-exhaust-label');
        const exhaustCheck = document.getElementById('sport-exhaust-check');
        const exhaustRow = document.getElementById('exhaust-tags-row');
        if (exhaustLabel && exhaustCheck) {
            const syncEx = () => {
                exhaustLabel.classList.toggle('on', exhaustCheck.checked);
                exhaustLabel.classList.toggle('active', exhaustCheck.checked);
                if (exhaustRow) exhaustRow.style.display = exhaustCheck.checked ? 'flex' : 'none';
            };
            exhaustCheck.addEventListener('change', () => {
                syncEx();
                updateLiveCount();
            });
            syncEx();
        }

        // 10. Quick City chips
        const cityChips = document.getElementById('quickCityChips');
        const cityInput = document.getElementById('cityInput');
        if (cityChips && cityInput) {
            cityChips.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    cityChips.querySelectorAll('button').forEach(b => b.classList.remove('on', 'active'));
                    btn.classList.add('on', 'active');
                    cityInput.value = btn.dataset.city || '';
                    cityInput.dispatchEvent(new Event('input', { bubbles: true }));
                    updateLiveCount();
                });
            });
        }

        // 11. Garancija stikala (.trow .sw)
        document.querySelectorAll('#acc-warranty .trow .sw').forEach(swBtn => {
            const chk = swBtn.querySelector('input[type="checkbox"]');
            if (!chk) return;
            const syncSW = () => {
                swBtn.classList.toggle('on', chk.checked);
                swBtn.setAttribute('aria-checked', String(chk.checked));
            };
            chk.addEventListener('change', () => {
                syncSW();
                updateLiveCount();
            });
            swBtn.addEventListener('click', (e) => {
                if (e.target !== chk) {
                    chk.checked = !chk.checked;
                    chk.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            syncSW();
        });

        // 12. Equipment live search
        const eqSearch = document.getElementById('equipmentSearchInput');
        if (eqSearch) {
            eqSearch.addEventListener('input', () => {
                const q = eqSearch.value.trim().toLowerCase();
                document.querySelectorAll('#moto-equipment .chip').forEach(ch => {
                    if (!q) {
                        ch.style.display = '';
                    } else {
                        const txt = ch.textContent.toLowerCase();
                        ch.style.display = txt.includes(q) ? '' : 'none';
                    }
                });
            });
        }
    }

    // ── 6-axis IMU Logic ──
    const imuTrigger = document.getElementById('imu-trigger-checkbox');
    const imuSubs = document.querySelectorAll('.imu-sub');
    if (imuTrigger) {
        imuTrigger.addEventListener('change', () => {
            const isChecked = imuTrigger.checked;
            imuSubs.forEach(cb => {
                cb.checked = isChecked;
            });
            updateLiveCount();
        });
    }

    fetchBrandData(activeTab).then(applyRelevance);

    makeSelect.addEventListener("change", () => {
        const data = window._brandModelData;
        const val = makeSelect.value;
        const osnovniChk = document.querySelector(`.remember-check[data-category="osnovni"]`);
        if (osnovniChk && osnovniChk.checked) {
            saveRememberSection('osnovni');
        }
        modelSelect.innerHTML = '<option value="">Model</option>';
        variantSelect.innerHTML = '<option value="">Različica</option>';
        modelSelect.disabled = true; variantSelect.disabled = true;
        if (val && data && data[val]) {
            const models = data[val];
            const keys = typeof models === 'object' && !Array.isArray(models) ? Object.keys(models).sort() : (Array.isArray(models) ? models.sort() : []);
            keys.forEach(m => { const o = document.createElement("option"); o.value = m; o.textContent = m; modelSelect.appendChild(o); });
            if (keys.length) modelSelect.disabled = false;
        }
        loadVehicleLines().then(() => updateLinijaDropdown(val));
        loadCustomEquipmentForBrand(val);
        applyRelevance();
    });

    modelSelect.addEventListener("change", () => {
        const data = window._brandModelData;
        const mk = makeSelect.value, md = modelSelect.value;
        const osnovniChk = document.querySelector(`.remember-check[data-category="osnovni"]`);
        if (osnovniChk && osnovniChk.checked) {
            saveRememberSection('osnovni');
        }
        variantSelect.innerHTML = '<option value="">Različica</option>';
        variantSelect.disabled = true;
        variantSelect.closest('.form-group')?.classList.remove('adv-hidden');
        if (mk && md && data && data[mk]) {
            const variants = getModelVariants(data[mk][md]);
            const trimmed = variants.map(v => typeof v === 'string' ? v : (v && v.trim) ? v.trim : '').filter(Boolean);
            if (trimmed.length === 1) {
                // Only one variant — auto-select it and hide the dropdown
                variantSelect.innerHTML = `<option value="${trimmed[0]}">${trimmed[0]}</option>`;
                variantSelect.value = trimmed[0];
                variantSelect.closest('.form-group')?.classList.add('adv-hidden');
                variantSelect.dispatchEvent(new Event('change'));
            } else {
                trimmed.forEach(trim => {
                    const o = document.createElement("option"); o.value = trim; o.textContent = trim;
                    variantSelect.appendChild(o);
                });
                if (trimmed.length) variantSelect.disabled = false;
            }
        }
        // Auto-select the body-type card from the taxonomy (cars only)
        autoSelectBodyType(mk, md);
        // Model picked → narrow engine options to that model (moto)
        applyRelevance();
    });
    
    variantSelect.addEventListener("change", () => {
        const make = makeSelect.value;
        const model = modelSelect.value;
        const variant = variantSelect.value;
        if (make && model && variant) {
            const lines = (_vehicleLinesData || {})[make] || [];
            if (!lines.length && addVehicleBtn) {
                addVehicleBtn.click();
            }
        }
    });

    if (linijaSelect) {
        linijaSelect.addEventListener("change", () => {
            const make = makeSelect.value;
            const model = modelSelect.value;
            const variant = variantSelect.value;
            const linija = linijaSelect.value;
            if (make && linija && addVehicleBtn) {
                addVehicleBtn.click();
            }
        });
    }

    // ── Auto-select the matching VRSTA VOZILA card when a known model is chosen ──
    function autoSelectBodyType(mk, md) {
        const canonical = getModelBodyType(window._brandModelData, mk, md);
        if (!canonical) return; // unknown → leave the user's manual selection untouched

        let gridSelector = '#grid-cars';
        if (activeTab === 'moto') gridSelector = '#grid-motorbikes';
        else if (activeTab === 'prosti-cas') gridSelector = '#grid-leisure';
        else if (activeTab === 'gospodarska') gridSelector = '#grid-commercial';

        const target = document.querySelector(`${gridSelector} .body-type-card[data-value="${canonical}"]`);
        if (target) {
            document.querySelectorAll(`${gridSelector} .body-type-card`).forEach(c => {
                c.classList.remove('active');
                c.classList.remove('on');
            });
            target.classList.add('active');
            target.classList.add('on');
            if (bodyTypeHidden) bodyTypeHidden.value = canonical;
            if (activeTab === 'prosti-cas') {
                applyLeisureFieldVisibility();
            }
            updateLiveCount();
        } else if (activeTab === 'moto' && ['ATV', 'UTV', 'Trikolesnik', 'Gocart'].includes(canonical)) {
            if (motoGroupSelector) {
                motoGroupSelector.drillInto();
                const subTarget = document.querySelector(`#motoSubGrid .body-type-card[data-value="${canonical}"]`);
                if (subTarget && !subTarget.classList.contains('active')) {
                    subTarget.click();
                }
            }
        }
    }

    function resetSelectors() {
        makeSelect.value = '';
        modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
        variantSelect.innerHTML = '<option value="">Različica</option>'; variantSelect.disabled = true;
        if (linijaSelect) linijaSelect.innerHTML = '<option value="">Linija</option>';
        if (linijaGroup) linijaGroup.style.display = 'none';
        makeSelect.dispatchEvent(new Event('change'));
        modelSelect.dispatchEvent(new Event('change'));
        variantSelect.dispatchEvent(new Event('change'));
    }

    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            const make = makeSelect.value;
            if (!make) return;
            if (vehicles.length >= MAX_VEHICLES) return;
            const model = modelSelect.value || '';
            const variant = variantSelect.value || '';
            const linija = (linijaSelect && linijaSelect.value) || '';
            vehicles.push({ make, model, variant, linija });
            resetSelectors();
            renderVehicleCards();
            applyRelevance();
            updateLiveCount();
        });
    }

    if (excludeVehicleBtn) {
        excludeVehicleBtn.addEventListener('click', () => {
            const make = makeSelect.value;
            if (!make) return;
            if (excludedVehicles.length >= MAX_VEHICLES) return;
            const model = modelSelect.value || '';
            const variant = variantSelect.value || '';
            const linija = (linijaSelect && linijaSelect.value) || '';
            excludedVehicles.push({ make, model, variant, linija });
            resetSelectors();
            renderExcludedCards();
            updateLiveCount();
        });
    }

    function makeCardHTML(v, i, zone) {
        const parts = [v.make];
        if (v.model) parts.push(v.model);
        if (v.variant) parts.push(v.variant);
        if (v.linija) parts.push(v.linija);
        const cls = zone === 'exclude' ? 'vehicle-entry-card vec-excluded' : 'vehicle-entry-card';
        return `<div class="${cls}" draggable="true" data-idx="${i}" data-zone="${zone}">
            <div class="vec-info">${parts.map(p => `<span>${p}</span>`).join('<span class="vec-sep">›</span>')}</div>
            <button type="button" class="vec-remove" data-idx="${i}" data-zone="${zone}">&times;</button>
        </div>`;
    }

    // Touch-dragging variables
    let touchDragging = false;
    let touchStartTimeout = null;
    let touchDraggingCard = null;
    let touchStartData = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchClone = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;

    function handleTouchStart(e, card) {
        if (e.target.closest('.vec-remove')) return;

        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchDraggingCard = card;
        touchDragging = false;

        const cardRect = card.getBoundingClientRect();
        touchOffsetX = touch.clientX - cardRect.left;
        touchOffsetY = touch.clientY - cardRect.top;

        touchStartTimeout = setTimeout(() => {
            touchDragging = true;
            if (navigator.vibrate) navigator.vibrate(20);

            touchStartData = {
                idx: +card.dataset.idx,
                zone: card.dataset.zone
            };

            touchClone = card.cloneNode(true);
            touchClone.classList.add('vec-dragging-clone');
            Object.assign(touchClone.style, {
                position: 'fixed',
                left: `${cardRect.left}px`,
                top: `${cardRect.top}px`,
                width: `${cardRect.width}px`,
                height: `${cardRect.height}px`,
                opacity: '0.9',
                pointerEvents: 'none',
                zIndex: '9999',
                margin: '0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                transform: 'scale(1.05)',
                transition: 'transform 0.1s ease',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
            });
            document.body.appendChild(touchClone);
            card.classList.add('vec-dragging');
        }, 250);
    }

    function handleTouchMove(e) {
        if (!touchDraggingCard) return;
        const touch = e.touches[0];

        if (!touchDragging) {
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            if (Math.sqrt(dx * dx + dy * dy) > 10) {
                clearTimeout(touchStartTimeout);
                touchDraggingCard = null;
            }
            return;
        }

        e.preventDefault();

        const x = touch.clientX - touchOffsetX;
        const y = touch.clientY - touchOffsetY;
        if (touchClone) {
            touchClone.style.left = `${x}px`;
            touchClone.style.top = `${y}px`;
        }

        const rectInclude = vehicleCardsEl ? vehicleCardsEl.getBoundingClientRect() : null;
        const rectExclude = excludedVehicleCardsEl ? excludedVehicleCardsEl.getBoundingClientRect() : null;
        const cx = touch.clientX;
        const cy = touch.clientY;

        if (rectInclude && cx >= rectInclude.left && cx <= rectInclude.right && cy >= rectInclude.top && cy <= rectInclude.bottom) {
            vehicleCardsEl.classList.add('vec-drag-over');
            if (excludedVehicleCardsEl) excludedVehicleCardsEl.classList.remove('vec-drag-over');
        } else if (rectExclude && cx >= rectExclude.left && cx <= rectExclude.right && cy >= rectExclude.top && cy <= rectExclude.bottom) {
            excludedVehicleCardsEl.classList.add('vec-drag-over');
            if (vehicleCardsEl) vehicleCardsEl.classList.remove('vec-drag-over');
        } else {
            if (vehicleCardsEl) vehicleCardsEl.classList.remove('vec-drag-over');
            if (excludedVehicleCardsEl) excludedVehicleCardsEl.classList.remove('vec-drag-over');
        }
    }

    function handleTouchEnd(e) {
        clearTimeout(touchStartTimeout);

        if (!touchDraggingCard) return;

        if (touchDragging) {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const cx = touch.clientX;
            const cy = touch.clientY;

            const rectInclude = vehicleCardsEl ? vehicleCardsEl.getBoundingClientRect() : null;
            const rectExclude = excludedVehicleCardsEl ? excludedVehicleCardsEl.getBoundingClientRect() : null;

            let targetZone = null;
            if (rectInclude && cx >= rectInclude.left && cx <= rectInclude.right && cy >= rectInclude.top && cy <= rectInclude.bottom) {
                targetZone = 'include';
            } else if (rectExclude && cx >= rectExclude.left && cx <= rectExclude.right && cy >= rectExclude.top && cy <= rectExclude.bottom) {
                targetZone = 'exclude';
            }

            if (touchClone) {
                touchClone.remove();
                touchClone = null;
            }
            touchDraggingCard.classList.remove('vec-dragging');

            if (vehicleCardsEl) vehicleCardsEl.classList.remove('vec-drag-over');
            if (excludedVehicleCardsEl) excludedVehicleCardsEl.classList.remove('vec-drag-over');

            if (targetZone && targetZone !== touchStartData.zone) {
                const { idx, zone: fromZone } = touchStartData;
                const srcArr = fromZone === 'include' ? vehicles : excludedVehicles;
                const dstArr = targetZone === 'include' ? vehicles : excludedVehicles;
                if (dstArr.length < MAX_VEHICLES) {
                    const [item] = srcArr.splice(idx, 1);
                    dstArr.push(item);
                    renderVehicleCards();
                    renderExcludedCards();
                    updateLiveCount();
                }
            }
        }

        touchDraggingCard = null;
        touchDragging = false;
        touchStartData = null;
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    function bindCardDrag(el) {
        el.querySelectorAll('[draggable]').forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ idx: +card.dataset.idx, zone: card.dataset.zone }));
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => card.classList.add('vec-dragging'), 0);
            });
            card.addEventListener('dragend', () => card.classList.remove('vec-dragging'));

            card.addEventListener('touchstart', (e) => handleTouchStart(e, card), { passive: false });
        });
    }

    function setupDropZone(el, zone) {
        el.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; el.classList.add('vec-drag-over'); });
        el.addEventListener('dragleave', e => { if (!el.contains(e.relatedTarget)) el.classList.remove('vec-drag-over'); });
        el.addEventListener('drop', e => {
            e.preventDefault();
            el.classList.remove('vec-drag-over');
            let data;
            try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
            const { idx, zone: fromZone } = data;
            if (fromZone === zone) return;
            const srcArr = fromZone === 'include' ? vehicles : excludedVehicles;
            const dstArr = zone === 'include' ? vehicles : excludedVehicles;
            if (dstArr.length >= MAX_VEHICLES) return;
            const [item] = srcArr.splice(idx, 1);
            dstArr.push(item);
            renderVehicleCards();
            renderExcludedCards();
            updateLiveCount();
        });
    }

    if (vehicleCardsEl) setupDropZone(vehicleCardsEl, 'include');
    if (excludedVehicleCardsEl) setupDropZone(excludedVehicleCardsEl, 'exclude');

    function renderVehicleCards() {
        if (!vehicleCardsEl) return;
        vehicleCardsEl.innerHTML = vehicles.map((v, i) => makeCardHTML(v, i, 'include')).join('');
        vehicleCardsEl.querySelectorAll('.vec-remove').forEach(btn => btn.addEventListener('click', () => {
            vehicles.splice(+btn.dataset.idx, 1);
            renderVehicleCards();
            updateLiveCount();
        }));
        bindCardDrag(vehicleCardsEl);
        const atLimit = vehicles.length >= MAX_VEHICLES;
        if (addVehicleBtn) addVehicleBtn.style.display = atLimit ? 'none' : 'flex';
        if (brandLimitNote) brandLimitNote.textContent = atLimit ? 'Omejitev dosežena (3).' : vehicles.length > 0 ? `Dodano: ${vehicles.length}/${MAX_VEHICLES}` : '';
        updateExcludedSectionVisibility();
    }

    function updateExcludedSectionVisibility() {
        if (excludedVehiclesSection) {
            excludedVehiclesSection.style.display = (vehicles.length > 0 || excludedVehicles.length > 0) ? 'block' : 'none';
        }
        if (vehicleCardsEl) {
            vehicleCardsEl.classList.toggle('vec-drop-target-visible', vehicles.length === 0 && excludedVehicles.length > 0);
        }
    }

    function renderExcludedCards() {
        if (!excludedVehicleCardsEl) return;
        excludedVehicleCardsEl.innerHTML = excludedVehicles.map((v, i) => makeCardHTML(v, i, 'exclude')).join('');
        excludedVehicleCardsEl.querySelectorAll('.vec-remove').forEach(btn => btn.addEventListener('click', () => {
            excludedVehicles.splice(+btn.dataset.idx, 1);
            renderExcludedCards();
            updateLiveCount();
        }));
bindCardDrag(excludedVehicleCardsEl);
        updateExcludedSectionVisibility();
        if (window.lucide) window.lucide.createIcons();
    }

    const standardBodyCards = document.querySelectorAll(
        '#grid-cars .body-type-card, #motoMainGrid .body-type-card:not([data-group]), #grid-leisure .body-type-card'
    );

    function getActiveBodyTypes() {
        if (activeTab === 'moto') {
            const mainActive = Array.from(document.querySelectorAll('#motoMainGrid .body-type-card.active:not([data-group])'))
                .map(c => c.getAttribute('data-value'))
                .filter(Boolean);
            const subActive = Array.from(document.querySelectorAll('#motoSubGrid .body-type-card.active'))
                .map(c => c.getAttribute('data-value'))
                .filter(Boolean);
            return [...mainActive, ...subActive];
        }
        if (activeTab === 'gospodarska') {
            return bodyTypeHidden ? bodyTypeHidden.value.split(',').filter(Boolean) : [];
        }
        if (activeTab === 'prosti-cas') {
            return Array.from(document.querySelectorAll('#grid-leisure .body-type-card.active'))
                .map(c => c.getAttribute('data-value'))
                .filter(Boolean);
        }
        // Default 'avto'
        return Array.from(document.querySelectorAll('#grid-cars .body-type-card.active'))
            .map(c => c.getAttribute('data-value'))
            .filter(Boolean);
    }

    // Sync bodyTypeHidden on init
    if (bodyTypeHidden) {
        const activeTypes = getActiveBodyTypes();
        if (activeTypes.length > 0) {
            bodyTypeHidden.value = activeTypes.join(',');
        } else if (catContext.vtype) {
            bodyTypeHidden.value = catContext.vtype;
        }
    }

    standardBodyCards.forEach(card => card.addEventListener('click', () => {
        if (card.dataset.group) return; // group cards are handled by their own selector
        card.classList.toggle('active');
        card.classList.toggle('on', card.classList.contains('active'));
        if (bodyTypeHidden) bodyTypeHidden.value = getActiveBodyTypes().join(',');
        // Prosti-čas: the vrsta-vozila cards also narrow the brand/model lists by type
        // and toggle engine-related fields (towed/static types have no motor).
        if (activeTab === 'prosti-cas') {
            refreshLeisureBrandFilter();
            applyLeisureFieldVisibility();
        }
        updateLiveCount();
    }));

    // ── Moto 4/3-wheel group drill-down ──
    const motoGroupSelector = setupMotoGroupSelector({ bodyTypeHidden, getActiveTab: () => activeTab, onChange: () => updateLiveCount() });

    // ── Commercial (Gospodarska) two-level drill-down: Vrsta → Kategorije ──
    const hiddenVType = document.getElementById('hiddenVType');
    const commercialSelector = setupCommercialSelector({
        bodyTypeHidden,
        hiddenVType,
        getActiveTab: () => activeTab,
        onChange: () => { applyRelevance(); updateLiveCount(); },
    });
    // Pre-select a vrsta or category if the URL carried one (e.g. ?vtype=Kmetijska or ?vtype=Dostavna)
    if (activeTab === 'gospodarska' && catContext.vtype) {
        const rawTypes = catContext.vtype.split(',').map(s => s.trim()).filter(Boolean);
        for (const raw of rawTypes) {
            if (COMMERCIAL_BY_KEY[raw]) {
                commercialSelector.drillInto(raw);
                break;
            }
            const matchingVrsta = COMMERCIAL_TAXONOMY.find(v =>
                v.categories.some(c => (typeof c === 'object' ? c.value : c) === raw)
            );
            if (matchingVrsta) {
                commercialSelector.drillInto(matchingVrsta.key);
                const catCard = document.querySelector(`.commercial-cat-card[data-value="${raw}"]`);
                if (catCard && !catCard.classList.contains('active')) {
                    catCard.click();
                }
                break;
            }
        }
    }
    if (activeTab === 'moto' && catContext.vtype) {
        const rawTypes = catContext.vtype.split(',').map(s => s.trim()).filter(Boolean);
        if (rawTypes.some(t => ['ATV', 'UTV', 'Trikolesnik', 'Gocart'].includes(t))) {
            motoGroupSelector.drillInto();
        }
    }

    // ── Power Unit Toggle Logic ──
    const powerUnitToggle = document.getElementById('advPowerUnitToggle');
    const powerFromInput = document.getElementById('powerFromInput');
    const powerToInput = document.getElementById('powerToInput');
    const powerFromLabel = document.getElementById('powerFromLabel');
    const powerToLabel = document.getElementById('powerToLabel');

    if (powerUnitToggle && powerFromInput && powerToInput) {
        const btns = powerUnitToggle.querySelectorAll('.unit-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const newUnit = btn.dataset.unit;
                if (newUnit === activePowerUnit) return;

                btns.forEach(b => b.classList.remove('active', 'on'));
                btn.classList.add('active', 'on');

                // Convert current values
                const valFrom = parseFloat(powerFromInput.value);
                const valTo = parseFloat(powerToInput.value);

                if (newUnit === 'km') {
                    // kW -> KM (multiply by 1.35962)
                    if (!isNaN(valFrom)) powerFromInput.value = Math.round(valFrom * 1.35962);
                    if (!isNaN(valTo)) powerToInput.value = Math.round(valTo * 1.35962);
                    
                    // Update Labels and placeholders
                    if (powerFromLabel) powerFromLabel.textContent = 'Moč motorja od (KM)';
                    if (powerToLabel) powerToLabel.textContent = 'Moč motorja do (KM)';
                    powerFromInput.placeholder = '0 KM';
                    powerToInput.placeholder = 'Brez omejitve';
                } else {
                    // KM -> kW (divide by 1.35962)
                    if (!isNaN(valFrom)) powerFromInput.value = Math.round(valFrom / 1.35962);
                    if (!isNaN(valTo)) powerToInput.value = Math.round(valTo / 1.35962);

                    // Update Labels and placeholders
                    if (powerFromLabel) powerFromLabel.textContent = 'Moč motorja od (kW)';
                    if (powerToLabel) powerToLabel.textContent = 'Moč motorja do (kW)';
                    powerFromInput.placeholder = '0 kW';
                    powerToInput.placeholder = 'Brez omejitve';
                }

                activePowerUnit = newUnit;
                updateLiveCount();
            });
        });
    }

    // ── A2 Izpit Toggle Logic ──
    const a2Toggle = document.getElementById('advA2Toggle');
    const a2Input = document.getElementById('a2EligibleInput');
    if (a2Toggle && a2Input) {
        a2Toggle.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                a2Toggle.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                a2Input.value = btn.dataset.a2 === 'yes' ? 'yes' : '';
                updateLiveCount();
            });
        });
    }

    const pFrom = document.querySelector('input[name="priceFrom"]');
    const pTo = document.querySelector('input[name="priceTo"]');
    function validatePriceRange() {
        if (!pFrom || !pTo) return;
        const vFrom = parseFormattedNumber(pFrom.value);
        const vTo = parseFormattedNumber(pTo.value);
        if (vFrom && vTo && vFrom > vTo) {
            pFrom.setCustomValidity('Cena od ne more biti višja od cene do');
        } else {
            pFrom.setCustomValidity('');
        }
    }
    pFrom?.addEventListener('input', validatePriceRange);
    pFrom?.addEventListener('change', validatePriceRange);
    pTo?.addEventListener('input', validatePriceRange);
    pTo?.addEventListener('change', validatePriceRange);

    function saveRememberSection(category) {
        const key = `avto_advanced_${activeTab}_${category}`;
        const chk = document.querySelector(`.remember-check[data-category="${category}"]`);
        if (!chk || !chk.checked) {
            localStorage.removeItem(key);
            return;
        }
        const section = chk.closest('.adv-accordion') || chk.closest('.card') || document;
        const params = new URLSearchParams();
        section.querySelectorAll('input:not(.remember-check), select').forEach(el => {
            if (!el.name) return;
            if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
            if (el.value) {
                if (['priceFrom', 'priceTo', 'mileageFrom', 'mileageTo'].includes(el.name)) {
                    params.set(el.name, String(parseFormattedNumber(el.value)));
                } else {
                    params.set(el.name, el.value);
                }
            }
        });
        if (category === 'osnovni') {
            if (makeSelect.value) params.set('make', makeSelect.value);
            if (modelSelect.value) params.set('model', modelSelect.value);
            if (vehicles.length > 0) params.set('vehicles', JSON.stringify(vehicles));
        }
        localStorage.setItem(key, params.toString());
    }

    function restoreRememberSection(category) {
        const key = `avto_advanced_${activeTab}_${category}`;
        const saved = localStorage.getItem(key);
        const chk = document.querySelector(`.remember-check[data-category="${category}"]`);
        if (!chk) return;
        if (!saved) {
            chk.checked = false;
            chk.closest('.remember-toggle')?.classList.remove('on');
            return;
        }
        chk.checked = true;
        chk.closest('.remember-toggle')?.classList.add('on');
        const params = new URLSearchParams(saved);
        const section = chk.closest('.adv-accordion') || chk.closest('.card') || document;
        params.forEach((val, name) => {
            if (name === 'make') {
                if (makeSelect.querySelector(`option[value="${val}"]`)) {
                    makeSelect.value = val;
                    makeSelect._syncCustomSelect?.();
                    makeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                return;
            }
            if (name === 'model') {
                if (modelSelect.querySelector(`option[value="${val}"]`)) {
                    modelSelect.value = val;
                    modelSelect._syncCustomSelect?.();
                    modelSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                return;
            }
            if (name === 'vehicles') {
                try {
                    vehicles = JSON.parse(val);
                    renderVehicleCards();
                } catch {}
                return;
            }
            const inputs = section.querySelectorAll(`[name="${name}"]`);
            inputs.forEach(inp => {
                if (inp.type === 'checkbox' || inp.type === 'radio') {
                    if (inp.value === val) {
                        inp.checked = true;
                        inp.closest('.chip')?.classList.add('on', 'active');
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    inp.value = val;
                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    }

    function syncAllRemember() {
        ['osnovni', 'motor', 'barva', 'oprema', 'prodajalec', 'stanje'].forEach(cat => {
            restoreRememberSection(cat);
        });
    }

    syncAllRemember();

    document.querySelectorAll('.remember-check').forEach(chk => {
        const cat = chk.getAttribute('data-category');
        if (!cat) return;
        chk.addEventListener('change', () => {
            chk.closest('.remember-toggle')?.classList.toggle('on', chk.checked);
            saveRememberSection(cat);
        });
        const section = chk.closest('.adv-accordion') || chk.closest('.card');
        if (section) {
            section.addEventListener('change', () => {
                if (chk.checked) saveRememberSection(cat);
            });
            section.addEventListener('input', () => {
                if (chk.checked) saveRememberSection(cat);
            });
        }
    });

    searchForm.addEventListener('reset', () => {
        ['osnovni', 'motor', 'barva', 'oprema', 'prodajalec', 'stanje'].forEach(cat => {
            localStorage.removeItem(`avto_advanced_${activeTab}_${cat}`);
            localStorage.removeItem(`avto_advanced_avto_${cat}`);
            localStorage.removeItem(`avto_advanced_moto_${cat}`);
            const chk = document.querySelector(`.remember-check[data-category="${cat}"]`);
            if (chk) {
                chk.checked = false;
                chk.closest('.remember-toggle')?.classList.remove('on');
            }
        });
    });

    const curYear = new Date().getFullYear();
    for (let y = curYear; y >= 1980; y--) {
        const o1 = document.createElement("option"); o1.value = y; o1.textContent = y; yearFromSelect.appendChild(o1);
        const o2 = document.createElement("option"); o2.value = y; o2.textContent = y; yearToSelect.appendChild(o2);
    }

    async function updateLiveCount() {
        try {
            const fd = new FormData(searchForm);
            const selectedBodyTypes = bodyTypeHidden ? (bodyTypeHidden.value ? bodyTypeHidden.value.split(',') : []) : [];
            
            let powerFromVal = parseFloat(fd.get('powerFrom')) || 0;
            let powerToVal = parseFloat(fd.get('powerTo')) || Infinity;
            if (activePowerUnit === 'km') {
                if (powerFromVal > 0) powerFromVal = Math.round(powerFromVal / 1.35962);
                if (powerToVal !== Infinity) powerToVal = Math.round(powerToVal / 1.35962);
            }

            const hashParams = parseHashParams();
            const cityVal = hashParams.get('city') || fd.get('city') || '';
            const radiusVal = hashParams.get('radius') || fd.get('radius') || '';

            const filters = {
                vehicles,
                excludedVehicles,
                city: cityVal,
                radius: radiusVal,
                make: fd.get('make') || '',
                model: fd.get('model') || '',
                variant: fd.get('variant') || '',
                linija: fd.get('linija') || '',
                bodyTypes: selectedBodyTypes,
                conditions: fd.getAll('condition'), damaged: fd.get('damaged'),
                fuels: fd.getAll('fuel').filter(Boolean), gears: fd.getAll('transmission').filter(Boolean), drivetrain: fd.getAll('drivetrain'),
                engineConfigs: fd.getAll('engineConfig').filter(Boolean),
                stroke: fd.get('stroke'), cylinders: fd.get('cylinders'), cylinderLayout: fd.get('cylinderLayout'),
                cylFilters: window._cylFilters || [],
                motoDrivetrain: fd.getAll('motoDrivetrain'),
                a2Eligible: fd.get('a2Eligible') || '',
                features: fd.getAll('features'),
                customEquipment: fd.getAll('customEquipment'),
                exhaustBrands: fd.getAll('exhaustBrand'),
                exhaustTypes: fd.getAll('exhaustType'),
                priceFrom: parseFormattedNumber(fd.get('priceFrom')), priceTo: parseFormattedNumber(fd.get('priceTo')) || Infinity,
                includeCallForPrice: fd.get('includeCallForPrice') === '1',
                yearFrom: Number(fd.get('yearFrom')) || 0, yearTo: Number(fd.get('yearTo')) || Infinity,
                mileageFrom: parseFormattedNumber(fd.get('mileageFrom')), mileageTo: parseFormattedNumber(fd.get('mileageTo')) || Infinity,
                engineHoursFrom: parseFormattedNumber(fd.get('engineHoursFrom')), engineHoursTo: parseFormattedNumber(fd.get('engineHoursTo')) || Infinity,
                powerFrom: powerFromVal, powerTo: powerToVal,
                rangeKmFrom: fd.get('rangeKmFrom') || '',
                batteryKwhFrom: fd.get('batteryKwhFrom') || '',
                aucType: fd.get('aucType') || '',
                aucStatus: fd.get('aucStatus') || '',
                aucReserve: fd.get('aucReserve') || '',
                startPriceFrom: parseFormattedNumber(fd.get('startPriceFrom')),
                startPriceTo: parseFormattedNumber(fd.get('startPriceTo')),
                bidPriceFrom: parseFormattedNumber(fd.get('bidPriceFrom')),
                bidPriceTo: parseFormattedNumber(fd.get('bidPriceTo')),
                aucBinding: fd.get('aucBinding') || '',
                aucCash: fd.get('aucCash') || '',
                aucTimeframe: fd.get('aucTimeframe') || '',
                searchMode,
                cat: catContext.cat, sub: catContext.sub, searchType: catContext.searchType, vtype: catContext.vtype, najem: catContext.najem, activeTab
            };

            const evSection = document.getElementById('electricSubSection');
            if (evSection) {
                const elektrikaChecked = document.querySelector('input[name="fuel"][value="Elektrika"]')?.checked;
                const pluginChecked = document.querySelector('input[name="fuel"][value="Plug-in Hibrid"]')?.checked;
                const showEv = !!(elektrikaChecked || pluginChecked);
                evSection.style.display = showEv ? 'block' : 'none';
                if (!showEv) {
                    const rInput = document.getElementById('rangeKmFromInput');
                    const bInput = document.getElementById('batteryKwhFromInput');
                    if (rInput) rInput.value = '';
                    if (bInput) bInput.value = '';
                }
            }

            let all = await getListings();
            let count = 0;
            const currentLang = localStorage.getItem('avto_lang') || 'sl';
            if (searchMode === 'drazbe') {
                const auctionListings = all.filter(l => l.entryType === 'auction');
                count = auctionListings.filter(l => matchesFilters(l, filters)).length;
                const badge = document.getElementById("auctionCountBadge");
                if (badge) badge.textContent = `${auctionListings.length} aktivnih`;
                const btn = document.getElementById("searchBtnText");
                const label = currentLang === 'en' ? 'Show auctions · ' : 'Prikaži dražbe · ';
                if (btn) btn.textContent = `${label}${count}`;
                const stickyBtn = document.getElementById("advStickySubmit");
                if (stickyBtn) stickyBtn.textContent = `${label}${count}`;
            } else {
                const regularListings = all.filter(l => l.entryType !== 'auction');
                count = regularListings.filter(l => matchesFilters(l, filters)).length;
                const btn = document.getElementById("searchBtnText");
                const label = currentLang === 'en' ? 'Show results · ' : 'Prikaži rezultate · ';
                if (btn) btn.textContent = `${label}${count}`;
                const stickyBtn = document.getElementById("advStickySubmit");
                if (stickyBtn) stickyBtn.textContent = `${label}${count}`;
            }
            updateAccordionBadges();
        } catch (e) { console.warn("Live count error:", e); }
    }

    function updateAccordionBadges() {
        document.querySelectorAll('.adv-accordion').forEach(acc => {
            const badge = acc.querySelector('.acc-t .cnt');
            if (!badge) return;
            const body = acc.querySelector('.adv-acc-body');
            if (!body) return;
            let count = 0;
            count += body.querySelectorAll('.body-type-card.active, .body-type-card.on').length;
            body.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked').forEach(inp => {
                if (!inp.classList.contains('remember-check') && inp.value && inp.value !== 'exclude') {
                    count++;
                }
            });
            body.querySelectorAll('input[type="text"], input[type="number"], select').forEach(inp => {
                if (inp.value && inp.value !== '' && inp.name !== 'bodyType' && inp.name !== 'cat' && inp.name !== 'sub' && inp.name !== 'searchType' && inp.name !== 'najem' && inp.name !== 'vtype') {
                    count++;
                }
            });
            count += body.querySelectorAll('.sw2.on').length;
            badge.textContent = String(count);
        });
    }

    // ── Bind Chips & Swatches ──
    searchForm.querySelectorAll('.chip').forEach(chip => {
        const inp = chip.querySelector('input');
        if (!inp) return;
        const syncChip = () => {
            chip.classList.toggle('on', inp.checked);
            chip.classList.toggle('active', inp.checked);
        };
        inp.addEventListener('change', () => {
            syncChip();
            updateLiveCount();
        });
        syncChip();
    });

    searchForm.querySelectorAll('.swt').forEach(swt => {
        const btn = swt.querySelector('.sw2');
        const inp = swt.querySelector('input[name="color"]');
        if (!btn || !inp) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            inp.checked = !inp.checked;
            btn.classList.toggle('on', inp.checked);
            inp.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    searchForm.querySelectorAll('.seg').forEach(seg => {
        seg.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                seg.querySelectorAll('button').forEach(b => b.classList.remove('on'));
                btn.classList.add('on');
                const inp = btn.closest('.seg-btn')?.querySelector('input') || btn.parentElement.querySelector('input');
                if (inp) {
                    inp.checked = true;
                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    });

    // ── Setup Dual Sliders ──
    const sliderResetters = [];
    function setupDualSlider({ sliderId, inputFromId, inputToId, min, max, step = 1, unit = '', formatNum = false, summaryId }) {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        const inputFrom = document.getElementById(inputFromId);
        const inputTo = document.getElementById(inputToId);
        const summary = summaryId ? document.getElementById(summaryId) : null;
        const fill = slider.querySelector('.sl-f');
        const handles = slider.querySelectorAll('.handle');
        if (handles.length < 2 || !fill) return;

        const handleMin = handles[0];
        const handleMax = handles[1];

        function valToPct(val) {
            if (val == null || isNaN(val) || val === '') return null;
            const clamped = Math.max(min, Math.min(max, Number(val)));
            return ((clamped - min) / (max - min)) * 100;
        }

        function pctToVal(pct) {
            const raw = min + (pct / 100) * (max - min);
            const stepped = Math.round(raw / step) * step;
            return Math.max(min, Math.min(max, stepped));
        }

        function updateVisuals(pctMin, pctMax) {
            pctMin = Math.max(0, Math.min(100, pctMin));
            pctMax = Math.max(0, Math.min(100, pctMax));
            if (pctMin > pctMax) {
                const tmp = pctMin; pctMin = pctMax; pctMax = tmp;
            }
            handleMin.style.left = `${pctMin}%`;
            handleMax.style.left = `${pctMax}%`;
            fill.style.left = `${pctMin}%`;
            fill.style.right = `${100 - pctMax}%`;

            if (summary) {
                const vMin = pctToVal(pctMin);
                const vMax = pctToVal(pctMax);
                if (pctMin <= 0 && pctMax >= 100) {
                    summary.textContent = 'Vse';
                } else if (pctMin <= 0) {
                    summary.textContent = `do ${formatNum ? vMax.toLocaleString('sl-SI') : vMax} ${unit}`.trim();
                } else if (pctMax >= 100) {
                    summary.textContent = `od ${formatNum ? vMin.toLocaleString('sl-SI') : vMin} ${unit}`.trim();
                } else {
                    summary.textContent = `${formatNum ? vMin.toLocaleString('sl-SI') : vMin} – ${formatNum ? vMax.toLocaleString('sl-SI') : vMax} ${unit}`.trim();
                }
            }
        }

        function syncFromInputs() {
            const vMin = inputFrom ? (formatNum ? parseFormattedNumber(inputFrom.value) : Number(inputFrom.value)) : null;
            const vMax = inputTo ? (formatNum ? parseFormattedNumber(inputTo.value) : Number(inputTo.value)) : null;

            const pMin = vMin ? valToPct(vMin) : 0;
            const pMax = vMax ? valToPct(vMax) : 100;
            updateVisuals(pMin != null ? pMin : 0, pMax != null ? pMax : 100);
        }

        let activeDragHandle = null;

        function onPointerDown(e, handle) {
            e.preventDefault();
            activeDragHandle = handle;
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        }

        function onPointerMove(e) {
            if (!activeDragHandle) return;
            const rect = slider.getBoundingClientRect();
            const clientX = e.clientX;
            const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
            const val = pctToVal(pct);

            const currentPMin = parseFloat(handleMin.style.left) || 0;
            const currentPMax = 100 - (parseFloat(fill.style.right) || 0);

            if (activeDragHandle === handleMin) {
                const newPMin = Math.min(pct, currentPMax);
                updateVisuals(newPMin, currentPMax);
                if (inputFrom) {
                    inputFrom.value = formatNum ? val.toLocaleString('sl-SI') : val;
                    inputFrom.dispatchEvent(new Event('input', { bubbles: true }));
                    inputFrom.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                const newPMax = Math.max(pct, currentPMin);
                updateVisuals(currentPMin, newPMax);
                if (inputTo) {
                    inputTo.value = formatNum ? val.toLocaleString('sl-SI') : val;
                    inputTo.dispatchEvent(new Event('input', { bubbles: true }));
                    inputTo.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }

        function onPointerUp() {
            activeDragHandle = null;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        }

        handleMin.addEventListener('pointerdown', (e) => onPointerDown(e, handleMin));
        handleMax.addEventListener('pointerdown', (e) => onPointerDown(e, handleMax));

        if (inputFrom) {
            inputFrom.addEventListener('change', syncFromInputs);
            inputFrom.addEventListener('input', syncFromInputs);
        }
        if (inputTo) {
            inputTo.addEventListener('change', syncFromInputs);
            inputTo.addEventListener('input', syncFromInputs);
        }

        syncFromInputs();
        sliderResetters.push(() => updateVisuals(0, 100));
    }

    setupDualSlider({ sliderId: 'priceSlider', inputFromId: 'priceFromInput', inputToId: 'priceToInput', min: 0, max: 200000, step: 1000, unit: '€', formatNum: true, summaryId: 'priceRangeSummary' });
    setupDualSlider({ sliderId: 'yearSlider', inputFromId: 'year-from', inputToId: 'year-to', min: 1990, max: curYear, step: 1, summaryId: 'yearRangeSummary' });
    setupDualSlider({ sliderId: 'kmSlider', inputFromId: 'mileageFromInput', inputToId: 'mileage-to', min: 0, max: 300000, step: 5000, unit: 'km', formatNum: true, summaryId: 'mileageRangeSummary' });
    setupDualSlider({ sliderId: 'powerSlider', inputFromId: 'powerFromInput', inputToId: 'powerToInput', min: 0, max: 400, step: 10, unit: 'kW', summaryId: 'powerSummary' });
    setupDualSlider({ sliderId: 'dispSlider', inputFromId: 'displacementFrom', inputToId: 'displacementTo', min: 500, max: 5000, step: 100, unit: 'ccm', formatNum: true, summaryId: 'displacementSummary' });
    setupDualSlider({ sliderId: 'seatsSlider', inputFromId: 'seatsFrom', inputToId: 'seatsTo', min: 1, max: 9, step: 1, summaryId: 'seatsRangeSummary' });

    searchForm.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', updateLiveCount);
        el.addEventListener('input', updateLiveCount);
    });
    setTimeout(updateLiveCount, 100);

    searchForm.addEventListener('reset', () => {
        setTimeout(() => {
            vehicles = [];
            excludedVehicles = [];
            renderVehicleCards();
            renderExcludedCards();
            makeSelect.value = '';
            modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
            variantSelect.innerHTML = '<option value="">Različica</option>'; variantSelect.disabled = true;
            if (linijaSelect) linijaSelect.innerHTML = '<option value="">Linija</option>';
            if (linijaGroup) linijaGroup.style.display = 'none';

            makeSelect.dispatchEvent(new Event('change'));
            modelSelect.dispatchEvent(new Event('change'));
            variantSelect.dispatchEvent(new Event('change'));

            if (exhaustTagsList) exhaustTagsList.innerHTML = '';
            if (exhaustTagsRow) exhaustTagsRow.style.display = 'none';

            allBodyTypeCards.forEach(c => {
                c.classList.remove('active');
                c.classList.remove('on');
            });
            searchForm.querySelectorAll('.chip').forEach(c => {
                c.classList.remove('on');
                c.classList.remove('active');
            });
            searchForm.querySelectorAll('.sw2').forEach(s => s.classList.remove('on'));
            sliderResetters.forEach(fn => fn());

            bodyTypeHidden.value = '';
            if (motoGroupSelector) motoGroupSelector.reset();
            if (commercialSelector) commercialSelector.reset();
            // Collapse non-persistent accordions on reset so only Osnovni podatki is open
            document.querySelectorAll('.adv-accordion').forEach(a => {
                if (!a.classList.contains('persistent-open')) {
                    const trig = a.querySelector('.adv-acc-trigger');
                    const b = a.querySelector('.adv-acc-body');
                    if (trig) trig.setAttribute('aria-expanded', 'false');
                    a.setAttribute('aria-expanded', 'false');
                    a.classList.remove('open');
                    a.classList.add('closed');
                    if (b) b.style.display = 'none';
                }
            });
            applyRelevance();
            updateLiveCount();
        }, 0);
    });

    searchForm.addEventListener("submit", e => {
        e.preventDefault();
        // Set category to current active tab
        const params = new URLSearchParams();
        params.set('cat', activeTab);
        if (activeTab === catContext.cat) {
            if (catContext.sub) params.set('sub', catContext.sub);
            if (catContext.searchType) params.set('searchType', catContext.searchType);
            if (catContext.vtype) params.set('vtype', catContext.vtype);
            if (catContext.najem) params.set('najem', catContext.najem);
        }

        if (vehicles.length > 0) {
            params.set('vehicles', JSON.stringify(vehicles));
        } else {
            const make = makeSelect.value;
            const model = modelSelect.value;
            const variant = variantSelect.value;
            if (make) params.set('make', make);
            if (model) params.set('model', model);
            if (variant) params.set('variant', variant);
        }
        if (excludedVehicles.length > 0) {
            params.set('excludedVehicles', JSON.stringify(excludedVehicles));
        }

        // Collect selected body types
        const selectedBT = bodyTypeHidden.value;
        if (selectedBT) params.set('bodyType', selectedBT);

        const fd = new FormData(searchForm);

        // Price From/To
        const priceFrom = parseFormattedNumber(fd.get('priceFrom'));
        const priceTo = parseFormattedNumber(fd.get('priceTo'));
        if (priceFrom) params.set('priceFrom', priceFrom);
        if (priceTo) params.set('priceTo', priceTo);

        // Year From/To
        const yearFrom = fd.get('yearFrom');
        const yearTo = fd.get('yearTo');
        if (yearFrom) params.set('yearFrom', yearFrom);
        if (yearTo) params.set('yearTo', yearTo);

        // Mileage From/To
        const mileageFrom = parseFormattedNumber(fd.get('mileageFrom'));
        const mileageTo = parseFormattedNumber(fd.get('mileageTo'));
        if (mileageFrom) params.set('mileageFrom', mileageFrom);
        if (mileageTo) params.set('mileageTo', mileageTo);

        // Operating hours From/To (machinery)
        const engineHoursFrom = parseFormattedNumber(fd.get('engineHoursFrom'));
        const engineHoursTo = parseFormattedNumber(fd.get('engineHoursTo'));
        if (engineHoursFrom) params.set('engineHoursFrom', engineHoursFrom);
        if (engineHoursTo) params.set('engineHoursTo', engineHoursTo);

        // Fuel
        const fuels = fd.getAll('fuel').filter(Boolean);
        if (fuels.length > 0) {
            params.set('fuel', fuels.join(','));
        }

        // Transmission
        const transmission = fd.get('transmission');
        if (transmission) {
            params.set('transmission', transmission);
        }

        // Moto: Prenos moči
        const motoDrivetrains = fd.getAll('motoDrivetrain').filter(Boolean);
        if (motoDrivetrains.length > 0) params.set('motoDrivetrain', motoDrivetrains.join(','));

        // Condition, features, powerFrom/To, a2Eligible, rangeKmFrom, batteryKwhFrom
        const conditions = fd.getAll('condition').filter(Boolean);
        if (conditions.length > 0) params.set('condition', conditions.join(','));

        const features = fd.getAll('features').filter(Boolean);
        if (features.length > 0) params.set('features', features.join(','));

        const powerFrom = fd.get('powerFrom');
        const powerTo = fd.get('powerTo');
        if (powerFrom) params.set('powerFrom', powerFrom);
        if (powerTo) params.set('powerTo', powerTo);

        const a2Eligible = fd.get('a2Eligible');
        if (a2Eligible) params.set('a2Eligible', a2Eligible);

        const rangeKmFrom = fd.get('rangeKmFrom');
        const batteryKwhFrom = fd.get('batteryKwhFrom');
        if (rangeKmFrom) params.set('rangeKmFrom', rangeKmFrom);
        if (batteryKwhFrom) params.set('batteryKwhFrom', batteryKwhFrom);

        params.set('advanced', '1');

        if (searchMode === 'drazbe') {
            const aucType = fd.get('aucType');
            const aucStatus = fd.get('aucStatus');
            const aucReserve = fd.get('aucReserve');
            const startPriceFrom = parseFormattedNumber(fd.get('startPriceFrom'));
            const startPriceTo = parseFormattedNumber(fd.get('startPriceTo'));
            const bidPriceFrom = parseFormattedNumber(fd.get('bidPriceFrom'));
            const bidPriceTo = parseFormattedNumber(fd.get('bidPriceTo'));
            const aucBinding = fd.get('aucBinding');
            const aucCash = fd.get('aucCash');
            const aucTimeframe = fd.get('aucTimeframe');

            if (aucType) params.set('aucType', aucType);
            if (aucStatus) params.set('aucStatus', aucStatus);
            if (aucReserve) params.set('aucReserve', aucReserve);
            if (startPriceFrom) params.set('startPriceFrom', startPriceFrom);
            if (startPriceTo) params.set('startPriceTo', startPriceTo);
            if (bidPriceFrom) params.set('bidPriceFrom', bidPriceFrom);
            if (bidPriceTo) params.set('bidPriceTo', bidPriceTo);
            if (aucBinding) params.set('aucBinding', aucBinding);
            if (aucCash) params.set('aucCash', aucCash);
            if (aucTimeframe) params.set('aucTimeframe', aucTimeframe);
            params.set('advanced', '1');
        }

        if (activeTab) params.set('cat', activeTab);
        const hashParams = parseHashParams();
        const city = hashParams.get('city') || fd.get('city');
        const radius = hashParams.get('radius') || fd.get('radius');
        if (city) params.set('city', city);
        if (radius) params.set('radius', radius);

        const paramStr = params.toString();
        const target = searchMode === 'drazbe' ? '/drazbe' : '/oglasi';
        navigateTo(`${target}${paramStr ? '?' + paramStr : ''}`);
    });
}

const cityPoints = {
    'ljubljana': [46.0569, 14.5058],
    'maribor': [46.5547, 15.6459],
    'celje': [46.2397, 15.2677],
    'koper': [45.5481, 13.7302],
    'kranj': [46.2389, 14.3556],
    'novo mesto': [45.803, 15.1689]
};

function distanceKm(a, b) {
    const rad = v => v * Math.PI / 180;
    const dlat = rad(b[0] - a[0]);
    const dlng = rad(b[1] - a[1]);
    const h = Math.sin(dlat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dlng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Filter matching logic — determines if a listing matches all active filters
// This is the core filtering engine used by both live count and results page.
// When category-specific brand/model data is added later, the vehicleType
// filter here will automatically only show matching vehicles.
// ═══════════════════════════════════════════════════════════════════════════════
function matchesFilters(l, filters) {
    // Parts & tires are listed separately under "Gume in deli" — never show them
    // in the regular vehicle search.
    if (l.itemType && l.itemType !== 'vehicle') return false;

    // City and radius filter
    if (filters.city) {
        const cityKey = filters.city.split(',')[0].trim().toLowerCase();
        const origin = cityPoints[cityKey];
        const location = l.location || l.data?.location || {};
        const lat = location.lat ?? location.latitude;
        const lng = location.lng ?? location.longitude;
        const radius = Number(filters.radius) || 0;
        if (origin && radius && lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
            if (distanceKm(origin, [Number(lat), Number(lng)]) > radius) return false;
        } else if (!String(location.city || l.city || l.data?.city || '').toLowerCase().includes(cityKey)) {
            return false;
        }
    }

    // Auction mode vs regular listings mode
    const isAuctionMode = (filters.searchMode === 'drazbe' || searchMode === 'drazbe');
    if (isAuctionMode) {
        if (l.entryType !== 'auction') return false;

        // aucType: 'live', 'prebid', 'silent'
        if (filters.aucType) {
            const rowType = l.auctionType || l.auction_type || l.data?.auctionType;
            if (rowType !== filters.aucType) return false;
        }

        // aucStatus: 'active', 'endingSoon', 'upcoming', 'ended'
        if (filters.aucStatus) {
            const now = Date.now();
            const endsAtVal = l.endsAt || l.ends_at || l.data?.endsAt;
            const endsAt = endsAtVal ? new Date(endsAtVal).getTime() : null;
            if (filters.aucStatus === 'active') {
                if (endsAt && endsAt <= now) return false;
            } else if (filters.aucStatus === 'endingSoon') {
                if (!endsAt || endsAt <= now || (endsAt - now) > 24 * 3600 * 1000) return false;
            } else if (filters.aucStatus === 'upcoming') {
                const startsAtVal = l.startsAt || l.starts_at || l.data?.startsAt;
                const startsAt = startsAtVal ? new Date(startsAtVal).getTime() : null;
                if (!startsAt || startsAt <= now) return false;
            } else if (filters.aucStatus === 'ended') {
                if (!endsAt || endsAt > now) return false;
            }
        }

        // aucReserve: 'noReserve', 'hasReserve', 'met'
        if (filters.aucReserve) {
            const reserveEur = l.reservePriceEur || l.reserve_price_eur || l.data?.reservePriceEur || 0;
            const hasReserve = !!(reserveEur > 0 || l.hasReserve || l.data?.hasReserve);
            const currentBid = l.currentBidEur || l.current_bid_eur || l.data?.currentBidEur || l.price || 0;
            const isMet = !!(l.reserveMet || l.data?.reserveMet || (hasReserve && currentBid >= reserveEur));
            if (filters.aucReserve === 'noReserve' && hasReserve) return false;
            if (filters.aucReserve === 'hasReserve' && !hasReserve) return false;
            if (filters.aucReserve === 'met' && !isMet) return false;
        }

        // startPriceFrom, startPriceTo
        const startPrice = parseFloat(l.startPriceEur || l.start_price_eur || l.data?.startPriceEur || l.startPrice || 0);
        if (filters.startPriceFrom && startPrice < parseFloat(filters.startPriceFrom)) return false;
        if (filters.startPriceTo && startPrice > parseFloat(filters.startPriceTo)) return false;

        // bidPriceFrom, bidPriceTo
        const currentBid = parseFloat(l.currentBidEur || l.current_bid_eur || l.data?.currentBidEur || l.price || 0);
        if (filters.bidPriceFrom && currentBid < parseFloat(filters.bidPriceFrom)) return false;
        if (filters.bidPriceTo && currentBid > parseFloat(filters.bidPriceTo)) return false;

        // aucBinding
        if (filters.aucBinding === 'yes') {
            const isBinding = !!(l.bindingContract || l.binding_contract || l.data?.bindingContract || l.auctionBinding || l.data?.auctionBinding);
            if (!isBinding) return false;
        }

        // aucCash
        if (filters.aucCash === 'yes') {
            const isCash = !!(l.cashAllowed || l.cash_allowed || l.data?.cashAllowed || l.auctionCash || l.data?.auctionCash);
            if (!isCash) return false;
        }

        // aucTimeframe: 'today', '24h', '3d', '7d'
        if (filters.aucTimeframe) {
            const now = Date.now();
            const endsAtVal = l.endsAt || l.ends_at || l.data?.endsAt;
            const endsAt = endsAtVal ? new Date(endsAtVal).getTime() : null;
            if (!endsAt || endsAt <= now) return false;
            const diffHours = (endsAt - now) / (3600 * 1000);
            if (filters.aucTimeframe === 'today' && diffHours > 24) return false;
            if (filters.aucTimeframe === '24h' && diffHours > 24) return false;
            if (filters.aucTimeframe === '3d' && diffHours > 72) return false;
            if (filters.aucTimeframe === '7d' && diffHours > 168) return false;
        }
    } else {
        if (l.entryType === 'auction') return false;
    }

    // Category-level filtering
    if (filters.activeTab) {
        const carCat = (l.category === 'motor' || l.category === 'moto') ? 'moto' : l.category;
        const filterCat = (filters.activeTab === 'motor' || filters.activeTab === 'moto') ? 'moto' : filters.activeTab;
        if (carCat && carCat !== filterCat) return false;
    }

    // Excluded vehicles (AND: listing must not match any excluded entry)
    if (filters.excludedVehicles && filters.excludedVehicles.length > 0) {
        const isExcluded = filters.excludedVehicles.some(v => {
            if (v.make && l.make !== v.make) return false;
            if (v.model && l.model !== v.model) return false;
            if (v.variant && l.title && !l.title.includes(v.variant)) return false;
            if (v.linija && l.linija !== v.linija) return false;
            return true;
        });
        if (isExcluded) return false;
    }

    // Vehicle multi-match (OR between entries)
    if (filters.vehicles && filters.vehicles.length > 0) {
        const match = filters.vehicles.some(v => {
            if (v.make && l.make !== v.make) return false;
            if (v.model && l.model !== v.model) return false;
            if (v.variant && l.title && !l.title.includes(v.variant)) return false;
            if (v.linija && l.linija !== v.linija) return false;
            return true;
        });
        if (!match) return false;
    } else {
        // Single vehicle matching
        if (filters.make && l.make !== filters.make) return false;
        if (filters.model && l.model !== filters.model) return false;
        if (filters.variant && l.title && !l.title.includes(filters.variant)) return false;
        if (filters.linija && l.linija !== filters.linija) return false;
    }

    // Body Types (OR between tiles)
    if (filters.bodyTypes.length > 0) {
        const typeMatch = filters.bodyTypes.some(type => {
            const bt = l.bodyType || l.data?.bodyType || l.vehicleType || l.data?.vehicleType;
            if (type === 'Damaged') return l.isDamaged || l.condition === 'Poškodovano' || l.damaged === 'only';
            if (type === 'Oldtimer') return (l.condition || l.data?.condition) === 'Starodobnik' || (l.year && l.year < 1995);
            if (type === 'EVozila') return ['EMoto', 'ESkiro', 'EKolo'].includes(bt);
            return bt === type;
        });
        if (!typeMatch) return false;
    }

    // Motorcycle Specifics
    if (filters.activeTab === 'moto') {
        const stroke = filters.stroke;
        const cylinders = filters.cylinders;
        const layout = filters.cylinderLayout;
        if (stroke && l.stroke !== stroke) return false;
        // Cylinder filter — cylFilters (multi, OR) takes priority over single dropdowns
        const cf = filters.cylFilters && filters.cylFilters.length > 0 ? filters.cylFilters : [];
        const includeFilters = cf.filter(f => !f.exclude);
        const excludeFilters = cf.filter(f => f.exclude);

        function cylMatch(f, l) {
            const cyl = f.cylinders; const lay = f.layout || '';
            if (cyl === 'Wankel') return (l.engine_type || l.engineType || l.stroke || '') === 'Wankel';
            if (l.cylinders !== cyl && String(l.cylinders) !== cyl) return false;
            if (lay) {
                const ec = l.engine_code || '';
                if (lay.endsWith('(vsi)')) {
                    const prefix = lay.replace(' (vsi)', '');
                    return ec === prefix || ec.startsWith(prefix + ' ');
                }
                return ec === lay;
            }
            return true;
        }

        // If no chip filters, fall back to single dropdown values
        if (includeFilters.length === 0 && cf.length === 0 && cylinders) {
            includeFilters.push({ cylinders, layout: layout || '' });
        }
        if (includeFilters.length > 0 && !includeFilters.some(f => cylMatch(f, l))) return false;
        if (excludeFilters.some(f => cylMatch(f, l))) return false;
        // Prenos moči (drivetrain) — OR between checked chips
        if (filters.motoDrivetrain && filters.motoDrivetrain.length > 0) {
            const dt = l.drivetrain || '';
            if (!filters.motoDrivetrain.includes(dt)) return false;
        }
        if (filters.a2Eligible === 'yes' && !l.a2Eligible) return false;
    }

    // Condition chips
    const itemCondition = l.condition || l.data?.condition;
    if (filters.conditions.length > 0 && !filters.conditions.includes(itemCondition)) return false;

    // Damaged radio
    if (filters.damaged === 'only' && !l.isDamaged && l.damaged !== 'only') return false;
    if (filters.damaged === 'exclude' && (l.isDamaged || l.damaged === 'only')) return false;

    // Price, Year, Mileage
    const isCallForPrice = l.callForPrice || (!l.priceEur && !l.price);
    if (isCallForPrice) {
        if (!filters.includeCallForPrice) return false;
    } else {
        const price = l.priceEur || l.price || 0;
        if (price < filters.priceFrom || (filters.priceTo !== Infinity && price > filters.priceTo)) return false;
    }
    if (l.year < filters.yearFrom || (filters.yearTo !== Infinity && l.year > filters.yearTo)) return false;
    // Mileage (km) — only applied when a km range is actually set (road vehicles).
    if (filters.mileageFrom > 0 || filters.mileageTo !== Infinity) {
        const km = l.mileage ?? l.data?.mileageKm ?? l.mileageKm ?? l.mileage_km ?? 0;
        if (km < filters.mileageFrom || (filters.mileageTo !== Infinity && km > filters.mileageTo)) return false;
    }
    // Operating hours — applied when an hours range is set (machinery). Only
    // listings that actually record engineHours can match; km-only vehicles never do.
    if (filters.engineHoursFrom > 0 || filters.engineHoursTo !== Infinity) {
        if (l.engineHours == null) return false;
        const hrs = Number(l.engineHours) || 0;
        if (hrs < filters.engineHoursFrom || (filters.engineHoursTo !== Infinity && hrs > filters.engineHoursTo)) return false;
    }

    // Power (kW) filter
    const power = l.powerKw ?? l.data?.powerKw ?? l.power_kw ?? l.data?.power_kw;
    if (power !== undefined) {
        if (power < filters.powerFrom || (filters.powerTo !== Infinity && power > filters.powerTo)) return false;
    } else if (filters.powerFrom > 0) {
        return false;
    }

    // Fuel, Transmission, Drivetrain, Engine Configuration
    const fuel = l.fuel || l.data?.fuel;
    if (filters.fuels.length > 0) {
        const matchesFuel = filters.fuels.some(f => {
            if (f === fuel) return true;
            if ((f === 'Dizel' || f === 'Diesel') && (fuel === 'Dizel' || fuel === 'Diesel')) return true;
            if ((f === 'Petrol' || f === 'Bencin') && (fuel === 'Petrol' || fuel === 'Bencin')) return true;
            if ((f === 'Elektrika' || f === 'Electric') && (fuel === 'Elektrika' || fuel === 'Electric')) return true;
            if ((f === 'Hibrid' || f === 'Hybrid') && (fuel === 'Hibrid' || fuel === 'Hybrid')) return true;
            return false;
        });
        if (!matchesFuel) return false;
    }
    const transmission = l.transmission || l.data?.transmission;
    if (filters.gears.length > 0 && !filters.gears.includes(transmission)) return false;
    const drivetrain = l.drivetrain || l.data?.drivetrain;
    if (filters.drivetrain.length > 0 && !filters.drivetrain.includes(drivetrain)) return false;
    const engineConfig = l.engineConfig || l.data?.engineConfig;
    if (filters.engineConfigs && filters.engineConfigs.length > 0 && !filters.engineConfigs.includes(engineConfig)) return false;

    // Features (Equipment)
    if (filters.features && filters.features.length > 0) {
        const itemFeatures = l.features || l.data?.features || [];
        if (!Array.isArray(itemFeatures)) return false;
        // Listing must have ALL selected features
        const hasAll = filters.features.every(f => itemFeatures.includes(f));
        if (!hasAll) return false;
    }

    // Electric filters (Range, Battery capacity)
    if (filters.rangeKmFrom && Number(filters.rangeKmFrom) > 0) {
        const range = Number(l.rangeKm ?? l.data?.rangeKm ?? l.range_km ?? l.data?.range_km ?? 0);
        if (range < Number(filters.rangeKmFrom)) return false;
    }
    if (filters.batteryKwhFrom && Number(filters.batteryKwhFrom) > 0) {
        const battery = Number(l.batteryKwh ?? l.data?.batteryKwh ?? l.battery_kwh ?? l.data?.battery_kwh ?? 0);
        if (battery < Number(filters.batteryKwhFrom)) return false;
    }

    // Custom equipment (brand-specific, approved proposals)
    if (filters.customEquipment && filters.customEquipment.length > 0) {
        const listingCustom = Array.isArray(l.customEquipment) ? l.customEquipment.map(ce => ce.value) : [];
        const hasAll = filters.customEquipment.every(v => listingCustom.includes(v));
        if (!hasAll) return false;
    }

    // Exhaust sub-filters (only applied when SportExhaust is also selected)
    if (filters.features && filters.features.includes('SportExhaust')) {
        if (filters.exhaustBrands && filters.exhaustBrands.length > 0 && !filters.exhaustBrands.includes(l.exhaustBrand)) return false;
        if (filters.exhaustTypes && filters.exhaustTypes.length > 0 && !filters.exhaustTypes.includes(l.exhaustType)) return false;
    }

    // Rental filter
    if (filters.najem === '1' && !l.isRental) return false;

    return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Moto 4/3-wheel group selector — drill-down from group card into sub-types
// ═══════════════════════════════════════════════════════════════════════════════
function setupMotoGroupSelector({ bodyTypeHidden, getActiveTab, onChange }) {
    const mainGrid = document.getElementById('motoMainGrid');
    const subGrid = document.getElementById('motoSubGrid');
    const header = document.getElementById('motoDrillHeader');
    const title = document.getElementById('motoDrillTitle');
    const backBtn = document.getElementById('motoBackBtn');
    const groupCard = document.querySelector('.moto-group-card[data-group="4in3kolesa"]');
    if (!mainGrid || !subGrid || !groupCard) return { reset() {}, drillInto() {} };

    const selected = new Set();

    // Check initially active cards
    subGrid.querySelectorAll('.body-type-card.active').forEach(card => {
        if (card.dataset.value) selected.add(card.dataset.value);
    });
    if (selected.size > 0) {
        groupCard.classList.add('active');
    }

    function writeFilter() {
        if (!bodyTypeHidden) return;
        const tab = getActiveTab ? getActiveTab() : '';
        if (tab !== 'moto') return;
        const existing = bodyTypeHidden.value
            ? bodyTypeHidden.value.split(',').filter(v => !['ATV','UTV','Trikolesnik','Gocart'].includes(v))
            : [];
        const combined = [...existing, ...selected];
        bodyTypeHidden.value = combined.join(',');
    }

    function showSub() {
        mainGrid.style.display = 'none';
        subGrid.style.display = 'flex';
        subGrid.style.justifyContent = 'center';
        if (header) header.style.display = 'flex';
        if (title) title.textContent = '4 in 3 Kolesna motorna vozila';
        if (window.lucide) window.lucide.createIcons();
    }

    function showMain() {
        subGrid.style.display = 'none';
        mainGrid.style.display = 'flex';
        mainGrid.style.justifyContent = 'center';
        if (header) header.style.display = 'none';
        const grp = document.querySelector('.moto-group-card[data-group="4in3kolesa"]');
        if (grp) {
            if (selected.size > 0) grp.classList.add('active');
            else grp.classList.remove('active');
        }
        writeFilter();
        if (onChange) onChange();
    }

    function reset() {
        selected.clear();
        subGrid.querySelectorAll('.body-type-card').forEach(c => c.classList.remove('active'));
        const grp = document.querySelector('.moto-group-card[data-group="4in3kolesa"]');
        if (grp) grp.classList.remove('active');
        subGrid.style.display = 'none';
        mainGrid.style.display = 'flex';
        if (header) header.style.display = 'none';
        writeFilter();
    }

    groupCard.addEventListener('click', showSub);

    subGrid.querySelectorAll('.body-type-card').forEach(card => {
        card.addEventListener('click', () => {
            const val = card.dataset.value;
            if (selected.has(val)) {
                selected.delete(val);
                card.classList.remove('active');
            } else {
                selected.add(val);
                card.classList.add('active');
            }
            const grp = document.querySelector('.moto-group-card[data-group="4in3kolesa"]');
            if (grp) {
                if (selected.size > 0) grp.classList.add('active');
                else grp.classList.remove('active');
            }
            writeFilter();
            if (onChange) onChange();
        });
    });

    if (backBtn) backBtn.addEventListener('click', showMain);

    return { reset, drillInto: showSub };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Commercial vehicle selector — two-level drill-down (Vrsta → Kategorije)
// Level 1 shows the vrsta cards. Clicking one drills down in place to that
// vrsta's kategorije, with a back button. Selecting kategorije toggles them as
// active filters; with none selected the vrsta itself is used as the filter.
// ═══════════════════════════════════════════════════════════════════════════════
function setupCommercialSelector({ bodyTypeHidden, hiddenVType, getActiveTab, onChange }) {
    const grid = document.getElementById('commercialGrid');
    const header = document.getElementById('commercialDrillHeader');
    const title = document.getElementById('commercialDrillTitle');
    const backBtn = document.getElementById('commercialBackBtn');
    if (!grid) return { renderVrste() {}, drillInto() {}, reset() {} };

    let currentVrsta = null;
    const selected = new Set();

    function refreshIcons() {
        if (window.lucide) window.lucide.createIcons();
    }

    function writeFilter() {
        if (!bodyTypeHidden) return;
        const tab = getActiveTab ? getActiveTab() : '';
        if (tab !== 'gospodarska') return;
        if (selected.size > 0) {
            bodyTypeHidden.value = [...selected].join(',');
        } else if (currentVrsta) {
            bodyTypeHidden.value = currentVrsta;
        } else {
            bodyTypeHidden.value = '';
        }
        if (hiddenVType) hiddenVType.value = currentVrsta || '';
    }

    function renderVrste() {
        currentVrsta = null;
        selected.clear();
        grid.style.display = 'flex';
        grid.style.justifyContent = 'center';
        if (header) header.style.display = 'none';
        grid.innerHTML = COMMERCIAL_TAXONOMY.map(v => {
            let iconHtml = `<i class="${v.icon}"></i>`;
            if (v.icon) {
                if (v.icon.startsWith('custom-svg:')) {
                    iconHtml = `<svg class="custom-v-icon"><use href="icons/vehicles-custom.svg${v.icon.slice(11)}"></use></svg>`;
                } else if (v.icon.startsWith('svg:')) {
                    iconHtml = `<svg class="custom-v-icon"><use href="icons/vehicles.svg${v.icon.slice(4)}"></use></svg>`;
                }
            }
            return `
            <button type="button" class="body-type-card commercial-vrsta-card" data-key="${v.key}">
                ${iconHtml}<span>${v.label}</span>
            </button>`;
        }).join('');
        grid.querySelectorAll('.commercial-vrsta-card').forEach(card => {
            card.addEventListener('click', () => drillInto(card.dataset.key));
        });
        translateAdvancedSearchPage(grid);
        writeFilter();
        refreshIcons();
    }

    function drillInto(key) {
        const vrsta = COMMERCIAL_BY_KEY[key];
        if (!vrsta) return;
        currentVrsta = key;
        selected.clear();
        grid.style.display = 'flex';
        grid.style.justifyContent = 'center';
        if (header) header.style.display = 'flex';
        if (title) title.textContent = vrsta.label;
        grid.innerHTML = vrsta.categories.map(cat => {
            let catValue = typeof cat === 'object' ? cat.value : cat;
            let catLabel = typeof cat === 'object' ? cat.label : cat;
            let catIcon = typeof cat === 'object' && cat.icon ? cat.icon : vrsta.icon;

            let iconHtml = `<i class="${catIcon}"></i>`;
            if (catIcon) {
                if (catIcon.startsWith('custom-svg:')) {
                    iconHtml = `<svg class="custom-v-icon"><use href="icons/vehicles-custom.svg${catIcon.slice(11)}"></use></svg>`;
                } else if (catIcon.startsWith('svg:')) {
                    iconHtml = `<svg class="custom-v-icon"><use href="icons/vehicles.svg${catIcon.slice(4)}"></use></svg>`;
                }
            }
            return `
            <button type="button" class="body-type-card commercial-cat-card" data-value="${catValue}">
                ${iconHtml}<span>${catLabel}</span>
            </button>`;
        }).join('');
        grid.querySelectorAll('.commercial-cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const val = card.dataset.value;
                if (selected.has(val)) { selected.delete(val); card.classList.remove('active'); }
                else { selected.add(val); card.classList.add('active'); }
                writeFilter();
                if (onChange) onChange();
            });
        });
        writeFilter();
        if (onChange) onChange();
        translateAdvancedSearchPage(grid);
        refreshIcons();
    }

    if (backBtn) backBtn.addEventListener('click', () => {
        renderVrste();
        if (onChange) onChange();
    });

    renderVrste();

    return { renderVrste, drillInto, reset: renderVrste };
}

// ── Hybrid sub-option cascades ────────────────────────────────────────────────
function bindHybridSubOptions() {
    const hibridCheck = document.getElementById('fuelHibridCheck');
    const typeGroup   = document.getElementById('hybridTypeGroup');
    const engineGroup = document.getElementById('hybridEngineGroup');
    if (!hibridCheck || !typeGroup || !engineGroup) return;

    function updateEngineGroup() {
        const anyTypeChecked = [...typeGroup.querySelectorAll('.hybrid-type-check')].some(c => c.checked);
        engineGroup.style.display = anyTypeChecked ? 'block' : 'none';
        if (!anyTypeChecked) engineGroup.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
    }

    hibridCheck.addEventListener('change', () => {
        const show = hibridCheck.checked;
        typeGroup.style.display = show ? 'block' : 'none';
        if (!show) {
            typeGroup.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
            engineGroup.style.display = 'none';
            engineGroup.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
        }
    });

    typeGroup.querySelectorAll('.hybrid-type-check').forEach(c => c.addEventListener('change', updateEngineGroup));
}

export function initAdvancedSearchAuctionsPage() {
    initAdvancedSearchPage({ isAuctions: true });
}

// Export for use by oglasi.js if needed
export { matchesFilters, parseHashParams, bindPaintworkColorDynamics };
