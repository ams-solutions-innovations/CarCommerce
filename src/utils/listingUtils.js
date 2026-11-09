import { PLATFORM } from '../config/platform.js';
// Shared utilities for vehicle listing cards (US-localized)
import { getCurrentLang, t } from '../core/i18n.js';
import { key as lsKey } from '../config/storageKeys.js';

// =====================================================================
// US LOCALIZATION HELPERS
// Stored data may still be in metric (km, kW, l/100km, EUR). These helpers
// convert on display only. Pass values through these before rendering.
// =====================================================================

export const KM_TO_MI = 0.621371;
export const KW_TO_HP = 1.34102;
// MPG (US) from L/100km: 235.215 / L100km
export const L100KM_TO_MPG = (l) => (l > 0 ? 235.215 / l : 0);

export function kmToMiles(km) {
    if (km === undefined || km === null || isNaN(km)) return null;
    return Math.round(Number(km) * KM_TO_MI);
}

export function kwToHp(kw) {
    if (kw === undefined || kw === null || isNaN(kw)) return null;
    return Math.round(Number(kw) * KW_TO_HP);
}

export function l100kmToMpg(l) {
    const v = parseFloat(l);
    if (!v || isNaN(v)) return null;
    return Math.round(L100KM_TO_MPG(v));
}

export function formatPrice(value) {
    if (value === undefined || value === null || value === '') return '';
    const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''));
    if (isNaN(n)) return '';
    return new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export function formatMiles(km) {
    if (km === null || km === undefined) return '';
    return new Intl.NumberFormat('sl-SI').format(Math.round(Number(km))) + ' km';
}

export function formatHp(kw) {
    const hp = kwToHp(kw);
    if (hp === null) return '';
    return hp + (getCurrentLang() === 'sl' ? ' KM' : ' HP');
}

export function formatMpg(l) {
    if (l === undefined || l === null) return '';
    const v = parseFloat(l);
    if (isNaN(v)) return '';
    return v.toFixed(1) + ' L/100km';
}

export const FUEL_MAP = {
    'petrol':            { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'bencin':            { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'benzin':            { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'b':                 { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'gasoline':          { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'gas':               { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'diesel':            { code: 'D',   cls: 'fuel-pill-D',  icon: 'fuel',     title: 'Diesel' },
    'dizel':             { code: 'D',   cls: 'fuel-pill-D',  icon: 'fuel',     title: 'Diesel' },
    'd':                 { code: 'D',   cls: 'fuel-pill-D',  icon: 'fuel',     title: 'Diesel' },
    'hibrid':            { code: 'H',   cls: 'fuel-pill-H',  icon: 'zap',      title: 'Hybrid' },
    'hybrid':            { code: 'H',   cls: 'fuel-pill-H',  icon: 'zap',      title: 'Hybrid' },
    'h':                 { code: 'H',   cls: 'fuel-pill-H',  icon: 'zap',      title: 'Hybrid' },
    'priključni hibrid': { code: 'PH',  cls: 'fuel-pill-HB', icon: 'plug-zap', title: 'Plug-in Hybrid' },
    'plug-in hybrid':    { code: 'PH',  cls: 'fuel-pill-HB', icon: 'plug-zap', title: 'Plug-in Hybrid' },
    'ph':                { code: 'PH',  cls: 'fuel-pill-HB', icon: 'plug-zap', title: 'Plug-in Hybrid' },
    'elektrika':         { code: 'E',   cls: 'fuel-pill-E',  icon: 'zap',      title: 'Electric' },
    'električno':        { code: 'E',   cls: 'fuel-pill-E',  icon: 'zap',      title: 'Electric' },
    'electric':          { code: 'E',   cls: 'fuel-pill-E',  icon: 'zap',      title: 'Electric' },
    'e':                 { code: 'E',   cls: 'fuel-pill-E',  icon: 'zap',      title: 'Electric' },
    'lpg':               { code: 'LPG', cls: 'fuel-pill-LPG',icon: 'flame',    title: 'LPG' },
};

export function getFuelPill(car) {
    if (!car) return '';
    const fuelStr = typeof car === 'object' ? car.fuel : car;
    if (!fuelStr) return '';

    const key = fuelStr.toLowerCase().trim();
    const fuelTitleKeys = {
        'P': 'fuel_petrol',
        'D': 'fuel_diesel',
        'H': 'fuel_hybrid',
        'PH': 'fuel_plugin_hybrid',
        'E': 'fuel_electric',
        'LPG': 'fuel_lpg',
    };
    const f = FUEL_MAP[key] || { code: 'E', cls: 'fuel-pill-E', icon: 'zap', title: 'Electric' };
    const title = fuelTitleKeys[f.code] ? t(fuelTitleKeys[f.code], f.title) : f.title;
    return `<div class="spec-pill fuel-coded ${f.cls}" title="${title}">
        <i data-lucide="${f.icon}"></i>
        <strong>${f.code}</strong>
    </div>`;
}

export function getPowerPill(powerKw) {
    if (!powerKw) return '';
    const hp = kwToHp(powerKw);
    const unit = getCurrentLang() === 'sl' ? 'KM' : 'HP';
    return `<div class="spec-pill power-pill" data-kw="${powerKw}" data-hp="${hp}">
        <i data-lucide="zap"></i>
        <span class="power-val">${hp} ${unit}</span>
    </div>`;
}

export function isElectricVehicle(car = {}) {
    const fuel = String(car.fuel || '').toLowerCase().trim();
    return ['elektrika', 'električno', 'electric', 'ev', 'e'].includes(fuel);
}

export function isPlugInHybrid(car = {}) {
    const fuel = String(car.fuel || '').toLowerCase().trim();
    const hybridType = String(car.hybridType || '').toLowerCase().replace(/[\s-]/g, '');
    return ['priključni hibrid', 'plug-in hybrid', 'plugin hybrid', 'phev', 'ph'].includes(fuel)
        || (['hibrid', 'hybrid'].includes(fuel) && ['plugin', 'pluginhybrid', 'phev'].includes(hybridType));
}

export function isElectrifiedVehicle(car = {}) {
    return isElectricVehicle(car) || isPlugInHybrid(car);
}

export function getChargingDetails(car = {}) {
    const toNumber = value => value === '' || value === null || value === undefined ? null : Number(value);
    const rawConnectors = car.connectors ?? car.connector;
    const connectors = (Array.isArray(rawConnectors) ? rawConnectors : String(rawConnectors || '').split(','))
        .map(value => String(value).trim()).filter(Boolean);
    return {
        rangeKm: toNumber(car.rangeKm ?? car.electricRangeKm),
        acKw: toNumber(car.chargeAcKw),
        dcKw: toNumber(car.chargeDcKw),
        timeMinutes: toNumber(car.chargeTimeMinutes),
        connectors: [...new Set(connectors)],
    };
}

export function getConsumptionPill(car) {
    if (isElectricVehicle(car)) {
        const rangeKm = getChargingDetails(car).rangeKm;
        if (!rangeKm) return '';
        let statusCls = 'status-low';
        if (rangeKm <= 250) statusCls = 'status-high';
        else if (rangeKm <= 400) statusCls = 'status-medium';

        return `<div class="spec-pill consumption-pill ${statusCls}" title="${t('range_title', 'Doseg')}">
            <i data-lucide="battery-charging"></i>
            ${rangeKm} km
        </div>`;
    }

    const cons = parseFloat(car.fuelL100kmCombined || car.fuelL100km);
    if (!cons) return '';

    let statusCls = 'status-medium';
    if (cons <= 5.0) statusCls = 'status-low';
    else if (cons >= 7.0) statusCls = 'status-high';

    const electricRange = getChargingDetails(car).rangeKm;
    if (isPlugInHybrid(car) && electricRange && cons) {
        return `<div class="spec-pill consumption-pill ${statusCls}" title="${t('consumption_ev_range', 'Poraba / doseg EV')}">
            <i data-lucide="droplets"></i>
            ${cons.toFixed(1)} L/100km · ${electricRange} km E
        </div>`;
    }

    return `<div class="spec-pill consumption-pill ${statusCls}" title="${t('fuel_economy', 'Poraba goriva')}">
        <i data-lucide="droplets"></i>
        ${cons.toFixed(1)} L/100km
    </div>`;
}

export function getTransmissionPill(car) {
    if (!car) return '';
    
    const transStr = typeof car === 'object' ? car.transmission : car;
    // Electric vehicles and plug-in hybrids do not need a gearbox as a key fact.
    if (typeof car === 'object' && isElectrifiedVehicle(car)) {
        return '';
    }

    if (!transStr) return '';

    const tStr = transStr.toLowerCase().trim();
    const isSl = getCurrentLang() === 'sl';
    let code = 'A';
    let label = isSl ? 'Samodejni' : 'Automatic';
    let typeCls = 'type-auto';

    if (tStr.includes('roč') || tStr.includes('manual')) {
        code = 'R';
        label = isSl ? 'Ročni' : 'Manual';
        typeCls = 'type-manual';
    }
    else if (tStr.includes('sekven') || tStr.includes('sequen')) {
        code = 'S';
        label = isSl ? 'Sekvenčni' : 'Sequential';
        typeCls = 'type-auto';
    }

    let html = `<div class="spec-pill transmission-pill ${typeCls}" title="${isSl ? 'Menjalnik:' : 'Transmission:'} ${label}">
        <i data-lucide="settings"></i>
        <strong>${code}</strong>
    </div>`;

    // For motorcycles (pri motorjih), add stroke and engine type pills to the right of transmission
    if (typeof car === 'object' && (car.category === 'moto' || car.category === 'motor')) {
        if (car.engineStroke) {
            html += `
            <div class="spec-pill stroke-pill" title="${isSl ? 'Takt motorja:' : 'Engine stroke:'} ${car.engineStroke}">
                <i data-lucide="activity"></i>
                <strong>${car.engineStroke}</strong>
            </div>`;
        }
        if (car.engineType) {
            html += `
            <div class="spec-pill type-pill" title="${isSl ? 'Vrsta motorja:' : 'Engine type:'} ${car.engineType}">
                <i data-lucide="cpu"></i>
                <strong>${car.engineType}</strong>
            </div>`;
        }
    }

    return html;
}

export function getYearPill(year) {
    if (!year) return '';
    return `<div class="spec-pill year-pill">
        <i data-lucide="calendar"></i>
        <span>${year}</span>
    </div>`;
}

export function getBatteryPill(car) {
    if (!isElectrifiedVehicle(car)) return '';
    if (!car.batteryKwh) return '';
    return `<div class="spec-pill battery-pill" title="${t('battery_capacity_title', 'Kapaciteta baterije')}">
        <i data-lucide="battery"></i>
        <span>${car.batteryKwh} kWh</span>
    </div>`;
}

export function getChargingPills(car) {
    if (!isElectrifiedVehicle(car)) return '';
    const charging = getChargingDetails(car);
    const power = charging.dcKw ? `DC ${charging.dcKw} kW` : (charging.acKw ? `AC ${charging.acKw} kW` : '');
    return `${power ? `<div class="spec-pill battery-pill" title="Moč polnjenja"><i data-lucide="plug"></i><span>${power}</span></div>` : ''}${charging.timeMinutes ? `<div class="spec-pill battery-pill" title="Čas polnjenja"><i data-lucide="clock"></i><span>${charging.timeMinutes} min</span></div>` : ''}`;
}

export function getKmPill(km) {
    if (km === undefined || km === null) return '';
    const formatted = typeof km === 'number'
        ? new Intl.NumberFormat('sl-SI').format(Math.round(km)) + ' km'
        : km;
    return `<div class="spec-pill km-pill">
        <i data-lucide="gauge"></i>
        <span>${formatted}</span>
    </div>`;
}

export function formatDisplacement(cc, unit, lang = 'sl') {
    if (!cc || isNaN(cc)) return '';
    
    if (unit === 'l') {
        const liters = cc / 1000;
        const rounded = Number(liters.toFixed(1));
        const formatted = rounded.toLocaleString('sl-SI', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        return formatted + 'L';
    } else {
        const formatted = new Intl.NumberFormat('sl-SI').format(cc);
        return formatted + ' cc';
    }
}

export function getDisplacementPill(engineCc) {
    if (!engineCc) return '';
    const unit = localStorage.getItem(lsKey('displacement_unit')) || 'cc';
    const lang = getCurrentLang();
    const formatted = formatDisplacement(engineCc, unit, lang);
    return `<div class="spec-pill displacement-pill" data-cc="${engineCc}">
        <i data-lucide="cog"></i>
        <span class="displacement-val">${formatted}</span>
    </div>`;
}

// ── Listing Card Display Preferences ─────────────────────────────────────────
export const DEFAULT_CARD_DISPLAY_PREFS = Object.freeze({
    fuel: true,
    year: true,
    mileage: true,
    transmission: true,
    power: true,
    consumptionCombined: true,
    consumptionCity: false,
    consumptionHighway: false,
    range: true,
    phevRange: true,
    batteryHealth: false,
    owners: false,
    engineType: false,
    driveType: false,
    displacement: false,
    fairPrice: true,
});

export function getCardDisplayPrefs() {
    try {
        const raw = localStorage.getItem(lsKey('card_display_prefs'));
        if (!raw) return { ...DEFAULT_CARD_DISPLAY_PREFS };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_CARD_DISPLAY_PREFS };
        return { ...DEFAULT_CARD_DISPLAY_PREFS, ...parsed };
    } catch {
        return { ...DEFAULT_CARD_DISPLAY_PREFS };
    }
}

export function setCardDisplayPrefs(nextPrefs) {
    const merged = { ...DEFAULT_CARD_DISPLAY_PREFS, ...(nextPrefs || {}) };
    try {
        localStorage.setItem(lsKey('card_display_prefs'), JSON.stringify(merged));
    } catch {}
    applyCardDisplayPrefsToDOM(merged);
    return merged;
}

export function resetCardDisplayPrefs() {
    try {
        localStorage.removeItem(lsKey('card_display_prefs'));
    } catch {}
    const defaults = { ...DEFAULT_CARD_DISPLAY_PREFS };
    applyCardDisplayPrefsToDOM(defaults);
    return defaults;
}

export function applyCardDisplayPrefsToDOM(prefs = getCardDisplayPrefs(), root = document) {
    if (!root) return;
    root.querySelectorAll('[data-card-field]').forEach(el => {
        const key = el.getAttribute('data-card-field');
        if (!key || !(key in DEFAULT_CARD_DISPLAY_PREFS)) return;
        const visible = Boolean(prefs[key]);
        el.hidden = !visible;
        el.style.display = visible ? '' : 'none';
    });
}

export function deriveCarEngineLayout(l = {}) {
    if (l.engineLayout) return l.engineLayout;
    if (l.cylinderLayout) return l.cylinderLayout;
    if (l.engineConfig) return l.engineConfig;
    if (l.engineType) return l.engineType;

    const isElectric = isElectricVehicle(l);
    const title = `${l.title || ''} ${l.subtitle || ''} ${l.variant || ''}`.toLowerCase();
    const make = (l.make || '').toLowerCase();
    const model = (l.model || '').toLowerCase();

    if (isElectric) {
        if (title.includes('tri-motor') || title.includes('tri motor')) return '3x Elektromotor';
        if (title.includes('dual') || title.includes('4x4') || title.includes('awd') || (l.driveType && String(l.driveType).includes('4'))) return '2x Elektromotor';
        return 'Elektromotor';
    }

    if (/\bv12\b/i.test(title)) return 'V12';
    if (/\bv10\b/i.test(title)) return 'V10';
    if (/\bv8\b/i.test(title)) return 'V8';
    if (/\bv6\b/i.test(title)) return 'V6';
    if (/\bboxer[- ]?6\b|\bb6\b/i.test(title)) return 'Boxer-6';
    if (/\bboxer[- ]?4\b|\bb4\b/i.test(title)) return 'Boxer-4';
    if (/\b(?:inline|vrstni)[- ]?6\b|\br6\b/i.test(title)) return 'Vrstni 6';
    if (/\b(?:inline|vrstni)[- ]?5\b|\br5\b/i.test(title)) return 'Vrstni 5';
    if (/\b(?:inline|vrstni)[- ]?4\b|\br4\b/i.test(title)) return 'Vrstni 4';
    if (/\b(?:inline|vrstni)[- ]?3\b|\br3\b/i.test(title)) return 'Vrstni 3';

    if (make === 'porsche') {
        if (model.includes('911')) return 'Boxer-6';
        if (model.includes('718') || model.includes('cayman') || model.includes('boxster')) return 'Boxer-4';
        if (model.includes('cayenne') || model.includes('panamera')) {
            return (l.powerKw && l.powerKw > 340) ? 'V8' : 'V6';
        }
    }
    if (make === 'subaru') {
        return (l.engineCc && l.engineCc > 2500) ? 'Boxer-6' : 'Boxer-4';
    }

    const cyl = parseInt(l.cylinders, 10);
    if (cyl === 12) return 'V12';
    if (cyl === 10) return 'V10';
    if (cyl === 8) return 'V8';
    if (cyl === 6) return make === 'bmw' ? 'Vrstni 6' : 'V6';
    if (cyl === 5) return 'Vrstni 5';
    if (cyl === 4) return 'Vrstni 4';
    if (cyl === 3) return 'Vrstni 3';

    const cc = Number(l.engineCc) || 0;
    if (cc >= 4000) return 'V8';
    if (cc >= 2800) {
        if (make === 'bmw') return 'Vrstni 6';
        if (make === 'porsche') return 'Boxer-6';
        return 'V6';
    }
    if (cc >= 1300) return 'Vrstni 4';
    if (cc > 0 && cc < 1300) return 'Vrstni 3';

    return '';
}

export function deriveCarOwnersLabel(l = {}) {
    if (l.condition === 'Novo vozilo' || (l.isNew && !l.previousOwnersCount && !l.previousOwners)) {
        return 'Novo (0 last.)';
    }
    if (l.previousOwnersCount) {
        return `${l.previousOwnersCount}. lastnik`;
    }
    if (l.previousOwners) {
        return String(l.previousOwners);
    }
    return '1. lastnik';
}

export function deriveCarBatteryHealth(l = {}) {
    if (l.batteryHealth !== undefined && l.batteryHealth !== null && l.batteryHealth !== '') {
        return `${Number(l.batteryHealth)} %`;
    }
    if (!isElectrifiedVehicle(l)) return '';
    // Deterministic realistic SoH fallback for electrified sample vehicles without explicit batteryHealth
    const yr = parseInt(l.year, 10) || 2022;
    const km = Number(l.mileageKm) || 20000;
    const age = Math.max(0, 2025 - yr);
    const soh = Math.max(86, Math.min(100, Math.round(100 - age * 1.2 - (km / 35000) * 1.1)));
    return `${soh} %`;
}

export function showCompareLimitToast() {
    const existing = document.getElementById('compare-limit-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'compare-limit-toast';
    toast.style.cssText = [
        'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
        'background:#1e293b', 'color:#fff', 'padding:14px 20px', 'border-radius:12px',
        'box-shadow:0 8px 32px rgba(0,0,0,0.28)', 'display:flex', 'align-items:center',
        'gap:12px', 'z-index:9999', 'font-size:0.9rem', 'max-width:90vw',
        'font-family:Inter,sans-serif',
    ].join(';');
    toast.innerHTML = `
        <span style="font-size:1.1rem;flex-shrink:0">⚖️</span>
        <span>${PLATFORM.id==='avto'?t('vc_limit','Primerjate lahko do 4 vozila.'):t('compare_limit_toast_msg', 'Primerjaš lahko največ 3 vozila naenkrat.') }</span>
        <a href="#/primerjava" style="background:#2563eb;color:#fff;border-radius:8px;padding:6px 12px;font-size:0.82rem;font-weight:600;text-decoration:none;white-space:nowrap;flex-shrink:0;">${t('compare_nav', 'Primerjalni kotiček')} →</a>
        <button onclick="this.closest('#compare-limit-toast').remove()" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px;flex-shrink:0;font-size:1rem;line-height:1;">✕</button>
    `;
    document.body.appendChild(toast);

    const timer = setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 320);
    }, 5000);

    toast.querySelector('a').addEventListener('click', () => clearTimeout(timer));
}
