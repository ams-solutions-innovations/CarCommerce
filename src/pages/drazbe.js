// Dražbe (Auctions Board) — MojAvto.si / AutoHub
// Fully matching scratch/autohub-references/32/DrazbeDeska.dc.html

import { getListings } from '../services/listingService.js';
import { getAuction } from '../services/auctionService.js';
import { sampleAuctionCars, sampleAuctionState } from '../data/sampleAuctions.js';
import { PLATFORM } from '../config/platform.js';
import { navigateTo } from '../router.js';
import { showToast } from '../utils/toast.js';

let _auctionRows = [];
let _timerInterval = null;
let _openPopoverId = null;

const STORAGE_KEY = 'autohub_drazbe_filters';

// Default filter state
const _filters = {
    vehicleType: 'avto',     // 'avto' | 'moto'
    auctionType: '',         // '' (all) | 'live' | 'prebid' | 'silent'
    status: 'active',        // 'active' | 'upcoming' | 'ended'
    timeRemaining: '7d',     // '1h' | '24h' | '3d' | '7d' | ''
    binding: false,          // boolean
    cash: false,             // boolean
    reserveMet: false,       // boolean
    hasBids: false,          // boolean
    selectedBrands: new Set(),
    selectedModel: '',
    priceMin: 0,
    priceMax: 250000,
    yearMin: 2015,
    yearMax: 2026,
    sortBy: 'ending-soon',   // 'ending-soon' | 'price-asc' | 'price-desc' | 'bids-desc'
    viewMode: 'list',        // 'list' | 'grid'
    visibleLimit: 6,         // Show 6 initially like reference
    rememberFilters: true,
};

function fmtEur(n) {
    return (Number(n) || 0).toLocaleString('sl-SI') + ' €';
}

function fmtMileage(km) {
    if (typeof km === 'string' && km.includes('km')) return km;
    const num = Number(km) || 0;
    return num.toLocaleString('sl-SI') + ' km';
}

function fmtPower(listing) {
    if (listing.power) return listing.power;
    const kw = Number(listing.powerKw);
    if (!kw) return '';
    const hp = Number(listing.powerHp) || Math.round(kw * 1.36);
    return `${kw} kW (${hp} KM)`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatCountdownText(endsAtMillis, isPrebid) {
    const diff = endsAtMillis - Date.now();
    if (diff <= 0) return 'Zaključeno';

    if (isPrebid) {
        const d = Math.floor(diff / (24 * 3600 * 1000));
        const h = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
        return `Živa faza čez ${d > 0 ? d + ' d ' : ''}${h} h`;
    }

    if (diff < 3600 * 1000) {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    const d = Math.floor(diff / (24 * 3600 * 1000));
    const h = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const m = Math.floor((diff % (3600 * 1000)) / 60000);

    if (d > 0) {
        return `${d} d ${h} h ${m} min`;
    }
    return `${h} h ${m} min`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Dedicated Auction Card Rendering Function
// CRITICAL USER REQUIREMENT:
// Vehicle specifications MUST be rendered as PILLS (.az-spec-pill or .sp,
// with border-radius: 9999px, icon + text, e.g. year, mileage, power, fuel, transmission, EV range).
// ──────────────────────────────────────────────────────────────────────────────
export function renderAutoHubAuctionCard(listing, auction) {
    const aType = auction?.auctionType || listing.auctionType || 'live';
    const isLive = aType === 'live' || auction?.currentPhase === 'live';
    const isPrebid = aType === 'prebid';
    const isSilent = aType === 'silent';

    const isBinding = Boolean(auction?.bindingContract ?? listing.auctionBinding ?? true);
    const isCash = Boolean(auction?.cashAllowed ?? listing.auctionCash ?? false);

    const endsAt = auction?.endsAt ? new Date(auction.endsAt).getTime() : (listing.endsAt ? new Date(listing.endsAt).getTime() : Date.now() + 3 * 86400000);
    const msLeft = endsAt - Date.now();
    const isHot = msLeft > 0 && msLeft < 3600 * 1000;
    const isWarn = msLeft >= 3600 * 1000 && msLeft < 48 * 3600 * 1000;

    let timerClass = '';
    if (isHot) timerClass = 'hot';
    else if (isWarn) timerClass = 'warn';

    const timerIcon = isPrebid ? '#i-timer' : '#i-clock';
    const timeText = formatCountdownText(endsAt, isPrebid);

    // Photos
    const imgUrl = listing.images?.exterior?.[0] || listing.image || listing.imgUrl || '';
    const imgCount = listing.imgCount || (listing.images?.exterior?.length || 0);

    // Title & subtitle
    const brandLogo = listing.brandLogo || '';
    const title = listing.title || `${listing.make || ''} ${listing.model || ''}`;
    const subtitle = listing.subtitle || `${listing.variant || ''} · ${listing.transmission || ''}`;

    // Vehicle specifications (CRITICAL: MUST BE RENDERED AS PILLS)
    const year = listing.year || 2023;
    const mileage = fmtMileage(listing.mileage || listing.mileageKm);
    const power = fmtPower(listing);
    const fuel = listing.fuel || 'Bencin';
    const transmission = listing.transmission || '';
    const evRange = listing.evRange || null;
    const phevRange = listing.phevRange || null;
    const consumption = listing.consumptionCombined || null;

    let fuelPillClass = '';
    let fuelIcon = '#i-fuel';
    if (fuel.toLowerCase().includes('elektri')) {
        fuelPillClass = 'ev';
        fuelIcon = '#i-zap';
    } else if (fuel.toLowerCase().includes('hibrid')) {
        fuelPillClass = 'hybrid';
    } else if (fuel.toLowerCase().includes('dizel')) {
        fuelPillClass = 'diesel';
    } else if (fuel.toLowerCase().includes('bencin')) {
        fuelPillClass = 'petrol';
    }

    // Auction Badges
    let typeBadgeHtml = '';
    if (isLive) typeBadgeHtml = `<span class="az-bd liv"><svg class="i"><use href="#i-eye"></use></svg> Živa dražba</span>`;
    else if (isPrebid) typeBadgeHtml = `<span class="az-bd pre"><svg class="i"><use href="#i-clock"></use></svg> Pred-dražba</span>`;
    else if (isSilent) typeBadgeHtml = `<span class="az-bd sil"><svg class="i"><use href="#i-lockk"></use></svg> Tiha dražba</span>`;

    const bindingBadgeHtml = isBinding ? `<span class="az-bd bi"><svg class="i"><use href="#i-check"></use></svg> Obvezna prodaja</span>` : '';
    const cashBadgeHtml = isCash ? `<span class="az-bd ca"><svg class="i"><use href="#i-wallet"></use></svg> Gotovina</span>` : '';

    // Auction Stats
    const bidCount = auction?.bidCount ?? listing.bidCount ?? 0;
    const bidderCount = auction?.bidderCount ?? listing.bidderCount ?? (bidCount > 0 ? Math.max(1, Math.floor(bidCount * 0.6)) : 0);
    const watchersCount = auction?.watchersCount ?? listing.watchersCount ?? (bidCount * 5 + 14);

    let reserveHtml = '';
    if (isSilent) {
        reserveHtml = `<span class="az-rs hd"><svg class="i"><use href="#i-lockk"></use></svg> Minimalna cena je skrita</span>`;
    } else if (auction?.reserveMet ?? listing.reserveMet ?? (bidCount >= 3)) {
        reserveHtml = `<span class="az-rs ok"><svg class="i"><use href="#i-check2"></use></svg> Minimalna cena dosežena</span>`;
    } else {
        reserveHtml = `<span class="az-rs no"><svg class="i"><use href="#i-info"></use></svg> Minimalna cena še ni dosežena</span>`;
    }

    // Anti-sniper notice
    const showAntiSniper = isLive && (msLeft < 24 * 3600 * 1000);

    // Seller & tags
    const sellerName = listing.seller || 'Avto Center';
    const sellerCity = listing.sellerCity || listing.location?.region || 'Ljubljana';
    const sellerVerified = listing.sellerVerified ?? (listing.sellerType === 'dealer');
    const tags = Array.isArray(listing.tags) ? listing.tags : [];

    // Prices & CTA
    const startPriceEur = auction?.startPriceEur ?? listing.startPriceEur ?? 20000;
    const currentBidEur = auction?.currentBidEur ?? listing.currentBidEur ?? startPriceEur;
    const nextBid = currentBidEur + 50;

    let priceLabel = 'Trenutna ponudba';
    let displayPrice = fmtEur(currentBidEur);
    let subPriceHtml = `Izklicna: <b>${fmtEur(startPriceEur)}</b>`;
    let ctaText = `Ponudi ${fmtEur(nextBid)}`;

    if (isSilent) {
        priceLabel = 'Izklicna cena';
        displayPrice = fmtEur(startPriceEur);
        subPriceHtml = '';
        ctaText = 'Oddaj zaprto ponudbo';
    } else if (isPrebid) {
        ctaText = 'Oddaj predponudbo';
    } else if (bidCount === 0) {
        priceLabel = 'Izklicna cena';
        displayPrice = fmtEur(startPriceEur);
        subPriceHtml = 'Še brez ponudb. Bodite prvi!';
        ctaText = 'Oddaj prvo ponudbo';
    }

    return `
    <article class="card lc az-c ${isHot ? 'hot' : ''}" data-id="${listing.id}" data-type="${aType}">
        <!-- PHOTO & COUNTDOWN BADGE -->
        <div class="lc-ph">
            ${imgUrl
                ? `<img src="${imgUrl}" alt="${escapeHtml(title)}" loading="lazy">`
                : `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#5a6b83;font-size:12px;font-weight:600;height:100%"><svg class="i" style="width:34px;height:34px;color:#9db0cb;stroke-width:1.4"><use href="#i-car"></use></svg>Brez fotografij</div>`
            }
            <span class="az-tm ${timerClass}" data-ends="${endsAt}">
                <svg class="i"><use href="${timerIcon}"></use></svg>
                <span class="az-time-text">${timeText}</span>
            </span>
            ${isLive ? `<span class="az-lv">V ŽIVO</span>` : ''}
            ${imgCount > 0 ? `<span class="cm"><svg class="i"><use href="#i-camera"></use></svg>1 / ${imgCount}</span>` : ''}
        </div>

        <!-- MAIN BODY -->
        <div class="lc-b">
            <div class="lc-t">
                ${brandLogo ? `<img src="${brandLogo}" alt="" class="lg">` : ''}
                <div style="min-width:0">
                    <a href="/drazba?id=${listing.id}" class="d ttl" style="display:block;text-decoration:none;color:inherit">${escapeHtml(title)}</a>
                    <div class="sb2">${escapeHtml(subtitle)}</div>
                </div>
            </div>

            <!-- VEHICLE SPEC PILLS (ROUNDED BADGES WITH SVG ICONS) -->
            <div class="lc-s az-pills">
                <span class="az-spec-pill"><svg class="i"><use href="#i-cal"></use></svg>${year}</span>
                <span class="az-spec-pill num"><svg class="i"><use href="#i-gauge"></use></svg>${mileage}</span>
                ${power ? `<span class="az-spec-pill num"><svg class="i"><use href="#i-zap"></use></svg>${power}</span>` : ''}
                <span class="az-spec-pill ${fuelPillClass}"><svg class="i"><use href="${fuelIcon}"></use></svg>${fuel}</span>
                ${transmission ? `<span class="az-spec-pill"><svg class="i"><use href="#i-gear"></use></svg>${transmission}</span>` : ''}
                ${evRange ? `<span class="az-spec-pill ev num"><svg class="i"><use href="#i-battery"></use></svg><i>Domet</i> ${evRange} km</span>` : ''}
                ${phevRange ? `<span class="az-spec-pill num"><svg class="i"><use href="#i-battery"></use></svg>${phevRange} km el.</span>` : ''}
                ${consumption ? `<span class="az-spec-pill num"><svg class="i"><use href="#i-droplet"></use></svg>${consumption}</span>` : ''}
            </div>

            <!-- AUCTION BADGES -->
            <div class="az-bds">
                ${typeBadgeHtml}
                ${bindingBadgeHtml}
                ${cashBadgeHtml}
            </div>

            <!-- STATS ROW -->
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px">
                <div class="az-s">
                    <span><svg class="i"><use href="#i-gavel"></use></svg><b>${bidCount}</b> ponudb</span>
                    <span><svg class="i"><use href="#i-users"></use></svg><b>${bidderCount}</b> ponudnikov</span>
                    <span><svg class="i"><use href="#i-eye"></use></svg><b>${watchersCount}</b> spremlja</span>
                </div>
                ${reserveHtml}
            </div>

            <!-- ANTI-SNIPER NOTICE -->
            ${showAntiSniper ? `<div class="az-note"><svg class="i"><use href="#i-bolt"></use></svg> Zadnje minute: vsaka ponudba doda 2 min.</div>` : ''}

            <!-- FOOTER: SELLER & TAGS -->
            <div class="lc-f">
                <span class="dl">
                    <svg class="i"><use href="${sellerVerified ? '#i-verified' : '#i-user'}"></use></svg>
                    <b>${escapeHtml(sellerName)}</b><span>· ${escapeHtml(sellerCity)}</span>
                </span>
                ${tags.map(t => `<span class="t2"><svg class="i"><use href="#i-check"></use></svg>${escapeHtml(t)}</span>`).join('')}
            </div>
        </div>

        <!-- RIGHT PRICING & CTA COLUMN -->
        <div class="az-r" style="position:relative">
            <div>
                <div class="lb">${priceLabel}</div>
                <div class="pr">${displayPrice}</div>
                ${subPriceHtml ? `<div class="sub">${subPriceHtml}</div>` : ''}
            </div>
            ${isSilent ? `<div class="az-hid"><svg class="i"><use href="#i-lockk"></use></svg><span>Ponudbe so skrite do zaključka</span></div>` : ''}
            <a href="/drazba?id=${listing.id}" class="btn-cta" style="text-decoration:none">${ctaText}</a>
            <div class="acts">
                <button type="button" class="ib2 btn-notify" aria-label="Obveščaj me, ko me kdo prehiti" data-id="${listing.id}"><svg class="i"><use href="#i-bell"></use></svg></button>
                <button type="button" class="ib2 btn-save" aria-label="Shrani v mapo" data-id="${listing.id}"><svg class="i"><use href="#i-heart"></use></svg></button>
                <button type="button" class="ib2 btn-compare" aria-label="Primerjaj" data-id="${listing.id}"><svg class="i"><use href="#i-scale"></use></svg></button>
            </div>

            <!-- Interactive Popover for Oglasne deske / Mape (rendered when active) -->
            ${_openPopoverId === listing.id ? renderSavePopover(listing) : ''}
        </div>
    </article>
    `;
}

// ──────────────────────────────────────────────────────────────────────────────
// Popover for Oglasne deske / Mape
// ──────────────────────────────────────────────────────────────────────────────
function renderSavePopover(listing) {
    return `
    <div class="pop" style="display:block;top:calc(100% - 40px);right:0">
        <div class="arr" style="right:48px"></div>
        <div class="ph2">
            <span class="d">Shrani v mapo</span>
            <button type="button" class="pop-close-btn" style="background:none;border:none;cursor:pointer;padding:0;color:#5a6b83"><svg class="i" style="width:16px;height:16px"><use href="#i-x"></use></svg></button>
        </div>
        <div class="pop-folders" style="display:flex;flex-direction:column;gap:4px;margin-top:6px">
            <label class="pr1 on" data-folder="favorites" style="cursor:pointer">
                <span class="cbx on"><svg class="i"><use href="#i-check"></use></svg></span>
                <span>Moji favoriti</span>
                <span class="ct">12</span>
            </label>
            <label class="pr1" data-folder="buying-2026" style="cursor:pointer">
                <span class="cbx"><svg class="i"><use href="#i-check"></use></svg></span>
                <span>Za nakup 2026</span>
                <span class="ct">4</span>
            </label>
            <label class="pr1" data-folder="ev" style="cursor:pointer">
                <span class="cbx"><svg class="i"><use href="#i-check"></use></svg></span>
                <span>Električna vozila</span>
                <span class="ct">8</span>
            </label>
        </div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:#5a6b83;margin:10px 0 4px 6px;text-transform:uppercase">Oglasne deske</div>
        <div class="pop-boards" style="display:flex;flex-direction:column;gap:4px">
            <label class="pr1" data-board="project-cars" style="cursor:pointer">
                <span class="cbx"><svg class="i"><use href="#i-check"></use></svg></span>
                <span>Projektni avti</span>
                <span class="ct">3</span>
            </label>
            <label class="pr1" data-board="family-wagons" style="cursor:pointer">
                <span class="cbx"><svg class="i"><use href="#i-check"></use></svg></span>
                <span>Družinski karavani</span>
                <span class="ct">5</span>
            </label>
        </div>
        <div class="pacts">
            <button type="button" class="pnew" id="popNewBoardBtn"><svg class="i"><use href="#i-plus"></use></svg> Nova deska</button>
            <a href="/oglasne-deske" class="pdesk" id="popOpenBoardLink" style="text-decoration:none"><svg class="i"><use href="#i-pinboard"></use></svg> Odpri desko</a>
        </div>
    </div>
    `;
}

// ──────────────────────────────────────────────────────────────────────────────
// Filtering and Sorting Pipeline
// ──────────────────────────────────────────────────────────────────────────────
function applyFiltersAndSort() {
    let result = [..._auctionRows];

    // 1. Vehicle type (avto / moto)
    if (_filters.vehicleType === 'moto') {
        result = result.filter(r => r.listing.category === 'motorna-kolesa' || r.listing.category === 'moto');
    } else {
        result = result.filter(r => r.listing.category !== 'motorna-kolesa' && r.listing.category !== 'moto');
    }

    // 2. Auction Type ('live' | 'prebid' | 'silent')
    if (_filters.auctionType) {
        result = result.filter(r => (r.auction?.auctionType || r.listing.auctionType) === _filters.auctionType);
    }

    // 3. Status ('active' | 'upcoming' | 'ended')
    if (_filters.status === 'active') {
        result = result.filter(r => {
            const endsAt = r.auction?.endsAt ? new Date(r.auction.endsAt).getTime() : new Date(r.listing.endsAt).getTime();
            return endsAt > Date.now();
        });
    }

    // 4. Time remaining ('1h' | '24h' | '3d' | '7d')
    if (_filters.timeRemaining) {
        const now = Date.now();
        let maxMs = 7 * 24 * 3600 * 1000;
        if (_filters.timeRemaining === '1h') maxMs = 1 * 3600 * 1000;
        else if (_filters.timeRemaining === '24h') maxMs = 24 * 3600 * 1000;
        else if (_filters.timeRemaining === '3d') maxMs = 3 * 24 * 3600 * 1000;
        else if (_filters.timeRemaining === '7d') maxMs = 7 * 24 * 3600 * 1000;

        result = result.filter(r => {
            const endsAt = r.auction?.endsAt ? new Date(r.auction.endsAt).getTime() : new Date(r.listing.endsAt).getTime();
            const left = endsAt - now;
            return left > 0 && left <= maxMs;
        });
    }

    // 5. Conditions
    if (_filters.binding) {
        result = result.filter(r => Boolean(r.auction?.bindingContract ?? r.listing.auctionBinding));
    }
    if (_filters.cash) {
        result = result.filter(r => Boolean(r.auction?.cashAllowed ?? r.listing.auctionCash));
    }
    if (_filters.reserveMet) {
        result = result.filter(r => Boolean(r.auction?.reserveMet ?? r.listing.reserveMet ?? (r.auction?.bidCount >= 3)));
    }
    if (_filters.hasBids) {
        result = result.filter(r => (r.auction?.bidCount || r.listing.bidCount || 0) > 0);
    }

    // 6. Brands
    if (_filters.selectedBrands.size > 0) {
        result = result.filter(r => {
            const make = r.listing.make || '';
            return _filters.selectedBrands.has(make);
        });
    }

    // 7. Model
    if (_filters.selectedModel) {
        result = result.filter(r => (r.listing.model || '').toLowerCase() === _filters.selectedModel.toLowerCase());
    }

    // 8. Price range
    result = result.filter(r => {
        const p = r.auction ? (r.auction.currentBidEur ?? r.auction.startPriceEur) : (r.listing.priceRaw ?? r.listing.startPriceEur ?? 0);
        return p >= _filters.priceMin && p <= _filters.priceMax;
    });

    // 9. Year range
    result = result.filter(r => {
        const y = Number(r.listing.year) || 2020;
        return y >= _filters.yearMin && y <= _filters.yearMax;
    });

    // 10. Sorting
    if (_filters.sortBy === 'ending-soon') {
        result.sort((a, b) => {
            const ea = a.auction?.endsAt ? new Date(a.auction.endsAt).getTime() : new Date(a.listing.endsAt).getTime();
            const eb = b.auction?.endsAt ? new Date(b.auction.endsAt).getTime() : new Date(b.listing.endsAt).getTime();
            return ea - eb;
        });
    } else if (_filters.sortBy === 'price-asc') {
        result.sort((a, b) => {
            const pa = a.auction ? (a.auction.currentBidEur ?? a.auction.startPriceEur) : a.listing.priceRaw;
            const pb = b.auction ? (b.auction.currentBidEur ?? b.auction.startPriceEur) : b.listing.priceRaw;
            return (pa || 0) - (pb || 0);
        });
    } else if (_filters.sortBy === 'price-desc') {
        result.sort((a, b) => {
            const pa = a.auction ? (a.auction.currentBidEur ?? a.auction.startPriceEur) : a.listing.priceRaw;
            const pb = b.auction ? (b.auction.currentBidEur ?? b.auction.startPriceEur) : b.listing.priceRaw;
            return (pb || 0) - (pa || 0);
        });
    } else if (_filters.sortBy === 'bids-desc') {
        result.sort((a, b) => {
            const ba = a.auction?.bidCount ?? a.listing.bidCount ?? 0;
            const bb = b.auction?.bidCount ?? b.listing.bidCount ?? 0;
            return bb - ba;
        });
    }

    return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// Render View
// ──────────────────────────────────────────────────────────────────────────────
function renderView() {
    const container = document.getElementById('carListingsContainer');
    const countBadge = document.getElementById('drazbeCount');
    const moreWrap = document.getElementById('loadMoreAuctionsWrap');
    const moreCountEl = document.getElementById('moreAuctionsCount');
    if (!container) return;

    const filtered = applyFiltersAndSort();
    const totalCount = filtered.length;

    if (countBadge) {
        countBadge.textContent = `${totalCount} ${totalCount === 1 ? 'dražba' : (totalCount === 2 ? 'dražbi' : (totalCount === 3 || totalCount === 4 ? 'dražbe' : 'dražb'))}`;
    }

    // Update 4 top Type badges
    updateTypeCardCounts();

    // Render cards
    if (totalCount === 0) {
        container.innerHTML = `
        <div class="card" style="padding:48px 24px;text-align:center;border-radius:24px">
            <svg class="i" style="width:48px;height:48px;margin:0 auto 12px;color:#94a3b8"><use href="#i-gavel"></use></svg>
            <h3 class="d" style="font-size:18px;font-weight:800;color:#0c1b30">Ni najdenih dražb za izbrane filtre</h3>
            <p style="font-size:13.5px;color:#5a6b83;margin-top:6px">Poskusite razširiti iskalne kriterije ali ponastavite filtre.</p>
            <button type="button" id="btnEmptyReset" class="btn-blue" style="margin-top:16px;cursor:pointer">Ponastavi vse filtre</button>
        </div>`;
        if (moreWrap) moreWrap.style.display = 'none';

        const resetBtn = document.getElementById('btnEmptyReset');
        if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
        return;
    }

    const visibleItems = filtered.slice(0, _filters.visibleLimit);
    container.innerHTML = visibleItems.map(r => renderAutoHubAuctionCard(r.listing, r.auction)).join('');

    // Handle "Prikaži več" button
    if (moreWrap && moreCountEl) {
        const remaining = totalCount - visibleItems.length;
        if (remaining > 0) {
            moreWrap.style.display = 'flex';
            moreCountEl.textContent = `(${remaining})`;
        } else {
            moreWrap.style.display = 'none';
        }
    }

    // Render active filter chips bar
    renderActiveFilterChips();

    // Rebind card action buttons (heart, notify, compare, popover)
    bindCardEvents(container);

    // Update histogram and slider visuals
    updatePriceControlsVisuals();
    updateYearControlsVisuals();
}

// ──────────────────────────────────────────────────────────────────────────────
// Top 4 Auction Type Badges update
// ──────────────────────────────────────────────────────────────────────────────
function updateTypeCardCounts() {
    let base = [..._auctionRows];
    if (_filters.vehicleType === 'moto') {
        base = base.filter(r => r.listing.category === 'motorna-kolesa' || r.listing.category === 'moto');
    } else {
        base = base.filter(r => r.listing.category !== 'motorna-kolesa' && r.listing.category !== 'moto');
    }

    const countAll = base.length;
    const countLiv = base.filter(r => (r.auction?.auctionType || r.listing.auctionType) === 'live').length;
    const countPre = base.filter(r => (r.auction?.auctionType || r.listing.auctionType) === 'prebid').length;
    const countSil = base.filter(r => (r.auction?.auctionType || r.listing.auctionType) === 'silent').length;

    const elAll = document.getElementById('badgeCntAll');
    const elLiv = document.getElementById('badgeCntLiv');
    const elPre = document.getElementById('badgeCntPre');
    const elSil = document.getElementById('badgeCntSil');

    if (elAll) elAll.textContent = countAll;
    if (elLiv) elLiv.textContent = countLiv;
    if (elPre) elPre.textContent = countPre;
    if (elSil) elSil.textContent = countSil;
}

// ──────────────────────────────────────────────────────────────────────────────
// Active Filter Chips Bar
// ──────────────────────────────────────────────────────────────────────────────
function renderActiveFilterChips() {
    const bar = document.getElementById('activeFilterChipsBar');
    if (!bar) return;

    const chips = [];

    if (_filters.status === 'active') {
        chips.push({ key: 'status', label: 'Aktivne dražbe' });
    }
    if (_filters.binding) {
        chips.push({ key: 'binding', label: 'Obvezna prodaja' });
    }
    if (_filters.cash) {
        chips.push({ key: 'cash', label: 'Gotovinsko plačilo' });
    }
    if (_filters.reserveMet) {
        chips.push({ key: 'reserve', label: 'Minimalna cena dosežena' });
    }
    if (_filters.hasBids) {
        chips.push({ key: 'hasBids', label: 'S ponudbami' });
    }
    if (_filters.timeRemaining) {
        const timeMap = { '1h': 'Do 1 ure', '24h': 'Do 24 ur', '3d': 'Do 3 dni', '7d': 'Do 7 dni' };
        chips.push({ key: 'time', label: `Zaključek: ${timeMap[_filters.timeRemaining] || _filters.timeRemaining}` });
    }
    if (_filters.priceMax < 250000 || _filters.priceMin > 0) {
        chips.push({ key: 'price', label: `${fmtEur(_filters.priceMin)} – ${fmtEur(_filters.priceMax)}` });
    }
    if (_filters.selectedBrands.size > 0 && _filters.selectedBrands.size < 6) {
        chips.push({ key: 'brands', label: Array.from(_filters.selectedBrands).join(', ') });
    }
    if (_filters.selectedModel) {
        chips.push({ key: 'model', label: `Model: ${_filters.selectedModel}` });
    }

    let html = chips.map(c => `
        <button type="button" class="chip on" data-clear="${c.key}">
            ${escapeHtml(c.label)}
            <svg class="i"><use href="#i-x"></use></svg>
        </button>
    `).join('');

    if (chips.length > 0) {
        html += `<a href="#" id="clearAllFiltersLink" style="font-size:13px;font-weight:700;color:#1d4ed8;margin-left:6px;text-decoration:none">Počisti vse</a>`;
    }

    bar.innerHTML = html;

    // Bind chip removals
    bar.querySelectorAll('[data-clear]').forEach(btn => {
        btn.addEventListener('click', () => {
            const k = btn.dataset.clear;
            if (k === 'status') _filters.status = '';
            else if (k === 'binding') {
                _filters.binding = false;
                const sw = document.getElementById('swBinding');
                if (sw) { sw.classList.remove('on'); sw.setAttribute('aria-checked', 'false'); }
            } else if (k === 'cash') {
                _filters.cash = false;
                const sw = document.getElementById('swCash');
                if (sw) { sw.classList.remove('on'); sw.setAttribute('aria-checked', 'false'); }
            } else if (k === 'reserve') {
                _filters.reserveMet = false;
                const sw = document.getElementById('swReserveMet');
                if (sw) { sw.classList.remove('on'); sw.setAttribute('aria-checked', 'false'); }
            } else if (k === 'hasBids') {
                _filters.hasBids = false;
                const sw = document.getElementById('swHasBids');
                if (sw) { sw.classList.remove('on'); sw.setAttribute('aria-checked', 'false'); }
            } else if (k === 'time') {
                _filters.timeRemaining = '';
                document.querySelectorAll('#timeRemainingChipsGroup .chip').forEach(c => c.classList.remove('on'));
            } else if (k === 'price') {
                _filters.priceMin = 0;
                _filters.priceMax = 250000;
                const pf = document.getElementById('sidebarPriceFrom');
                const pt = document.getElementById('sidebarPriceTo');
                if (pf) pf.value = 0;
                if (pt) pt.value = 250000;
            } else if (k === 'brands') {
                _filters.selectedBrands.clear();
                document.querySelectorAll('.bchip').forEach(b => b.classList.add('off'));
            } else if (k === 'model') {
                _filters.selectedModel = '';
                const mSel = document.getElementById('sidebarModelSelect');
                if (mSel) mSel.value = '';
            }
            renderView();
        });
    });

    const clearAll = document.getElementById('clearAllFiltersLink');
    if (clearAll) {
        clearAll.addEventListener('click', (e) => {
            e.preventDefault();
            resetAllFilters();
        });
    }
}

function resetAllFilters() {
    _filters.auctionType = '';
    _filters.status = 'active';
    _filters.timeRemaining = '7d';
    _filters.binding = false;
    _filters.cash = false;
    _filters.reserveMet = false;
    _filters.hasBids = false;
    _filters.selectedBrands = new Set();
    _filters.selectedModel = '';
    _filters.priceMin = 0;
    _filters.priceMax = 250000;
    _filters.yearMin = 2015;
    _filters.yearMax = 2026;
    _filters.visibleLimit = 6;

    // Reset UI controls
    document.querySelectorAll('#auctionTypeCardsGroup .az-ty').forEach(b => {
        b.classList.toggle('on', b.classList.contains('all'));
        b.setAttribute('aria-pressed', b.classList.contains('all') ? 'true' : 'false');
    });

    const swBinding = document.getElementById('swBinding');
    if (swBinding) { swBinding.classList.remove('on'); swBinding.setAttribute('aria-checked', 'false'); }
    const swCash = document.getElementById('swCash');
    if (swCash) { swCash.classList.remove('on'); swCash.setAttribute('aria-checked', 'false'); }
    const swRes = document.getElementById('swReserveMet');
    if (swRes) { swRes.classList.remove('on'); swRes.setAttribute('aria-checked', 'false'); }
    const swBids = document.getElementById('swHasBids');
    if (swBids) { swBids.classList.remove('on'); swBids.setAttribute('aria-checked', 'false'); }

    const pf = document.getElementById('sidebarPriceFrom');
    if (pf) pf.value = 0;
    const pt = document.getElementById('sidebarPriceTo');
    if (pt) pt.value = 250000;

    const yf = document.getElementById('sidebarYearFrom');
    if (yf) yf.value = 2015;
    const yt = document.getElementById('sidebarYearTo');
    if (yt) yt.value = 2026;

    document.querySelectorAll('.bchip').forEach(b => {
        const brand = b.dataset.brand;
        b.classList.toggle('off', !_filters.selectedBrands.has(brand));
    });

    const mSel = document.getElementById('sidebarModelSelect');
    if (mSel) mSel.value = '';

    renderView();
}

// ──────────────────────────────────────────────────────────────────────────────
// Price & Year Slider Visuals + Histogram
// ──────────────────────────────────────────────────────────────────────────────
function updatePriceControlsVisuals() {
    const min = _filters.priceMin;
    const max = _filters.priceMax;
    const total = 250000;

    const fill = document.getElementById('priceSliderFill');
    const hMin = document.getElementById('priceHandleMin');
    const hMax = document.getElementById('priceHandleMax');

    const leftPct = Math.max(0, Math.min(100, (min / total) * 100));
    const rightPct = Math.max(0, Math.min(100, (1 - max / total) * 100));

    if (fill) {
        fill.style.left = `${leftPct}%`;
        fill.style.right = `${rightPct}%`;
    }
    if (hMin) hMin.style.left = `${leftPct}%`;
    if (hMax) hMax.style.left = `${100 - rightPct}%`;

    // Histogram bars coloring
    const bars = document.querySelectorAll('#priceHistogram .az-bar');
    bars.forEach((bar, idx) => {
        const barStart = (idx / 25) * total;
        const barEnd = ((idx + 1) / 25) * total;
        const isInRange = barEnd >= min && barStart <= max;
        bar.style.background = isInRange ? '#2563eb' : '#c9d9f2';
    });
}

function updateYearControlsVisuals() {
    const min = _filters.yearMin;
    const max = _filters.yearMax;
    const yStart = 2000;
    const ySpan = 26; // 2000 to 2026

    const fill = document.getElementById('yearSliderFill');
    const hMin = document.getElementById('yearHandleMin');
    const hMax = document.getElementById('yearHandleMax');

    const leftPct = Math.max(0, Math.min(100, ((min - yStart) / ySpan) * 100));
    const rightPct = Math.max(0, Math.min(100, ((2026 - max) / ySpan) * 100));

    if (fill) {
        fill.style.left = `${leftPct}%`;
        fill.style.right = `${rightPct}%`;
    }
    if (hMin) hMin.style.left = `${leftPct}%`;
    if (hMax) hMax.style.left = `${100 - rightPct}%`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Card Actions and Popover Binding
// ──────────────────────────────────────────────────────────────────────────────
function bindCardEvents(container) {
    // Notify button
    container.querySelectorAll('.btn-notify').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('on');
            if (btn.classList.contains('on')) {
                showToast('Obveščanje aktivirano za to dražbo!', 'success');
            } else {
                showToast('Obveščanje izklopljeno.', 'info');
            }
        });
    });

    // Compare button
    container.querySelectorAll('.btn-compare').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('on');
            if (btn.classList.contains('on')) {
                showToast('Dodano v primerjavo vozil!', 'success');
            } else {
                showToast('Odstranjeno iz primerjave.', 'info');
            }
        });
    });

    // Save (Heart) button -> Toggle Popover
    container.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (_openPopoverId === id) {
                _openPopoverId = null;
            } else {
                _openPopoverId = id;
            }
            renderView();
        });
    });

    // Popover Close button
    container.querySelectorAll('.pop-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            _openPopoverId = null;
            renderView();
        });
    });

    // Popover Folder & Board item toggle
    container.querySelectorAll('.pop .pr1').forEach(row => {
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            row.classList.toggle('on');
            const cbx = row.querySelector('.cbx');
            if (cbx) cbx.classList.toggle('on');

            const name = row.querySelector('span:nth-child(2)')?.textContent || 'Mapo';
            if (row.classList.contains('on')) {
                showToast(`Shranjeno v "${name}"!`, 'success');
            } else {
                showToast(`Odstranjeno iz "${name}".`, 'info');
            }
        });
    });

    // Popover + Nova deska
    const newBoardBtn = container.querySelector('#popNewBoardBtn');
    if (newBoardBtn) {
        newBoardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = window.prompt('Vnesite ime nove oglasne deske:');
            if (name && name.trim()) {
                showToast(`Oglasna deska "${name.trim()}" ustvarjena!`, 'success');
            }
        });
    }

    // Popover Odpri desko
    const openBoardLink = container.querySelector('#popOpenBoardLink');
    if (openBoardLink) {
        openBoardLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/oglasne-deske');
        });
    }

    // Click outside to close popover
    document.addEventListener('click', (e) => {
        if (_openPopoverId && !e.target.closest('.pop') && !e.target.closest('.btn-save')) {
            _openPopoverId = null;
            renderView();
        }
    }, { once: true });
}

// ──────────────────────────────────────────────────────────────────────────────
// Live Countdown Ticker
// ──────────────────────────────────────────────────────────────────────────────
function startLiveCountdowns() {
    if (_timerInterval) clearInterval(_timerInterval);

    _timerInterval = setInterval(() => {
        const timerBadges = document.querySelectorAll('.az-tm[data-ends]');
        const now = Date.now();

        timerBadges.forEach(badge => {
            const endsAt = Number(badge.dataset.ends);
            if (!Number.isFinite(endsAt)) return;

            const textSpan = badge.querySelector('.az-time-text');
            if (!textSpan) return;

            const diff = endsAt - now;
            const card = badge.closest('.az-c');
            const isPrebid = card?.dataset.type === 'prebid';

            textSpan.textContent = formatCountdownText(endsAt, isPrebid);

            if (diff > 0 && diff < 3600 * 1000) {
                badge.classList.add('hot');
                badge.classList.remove('warn');
                if (card) card.classList.add('hot');
            } else if (diff >= 3600 * 1000 && diff < 48 * 3600 * 1000) {
                badge.classList.add('warn');
                badge.classList.remove('hot');
                if (card) card.classList.remove('hot');
            }
        });
    }, 1000);
}

// ──────────────────────────────────────────────────────────────────────────────
// Initialization of Page, Controls, and Event Listeners
// ──────────────────────────────────────────────────────────────────────────────
export async function initDrazbePage() {
    console.log('[Drazbe] init AutoHub Auctions Board');

    // 1. Fetch Listings & Auction States
    let listings = [];
    try {
        listings = await getListings();
    } catch (err) {
        console.error('[Drazbe] failed to load listings', err);
    }

    let auctionListings = (listings || []).filter(l =>
        l.entryType === 'auction'
        && (l.status === undefined || l.status === 'active')
    );

    // If less than 14 auction listings returned, complement with realistic sampleAuctionCars
    if (auctionListings.length < 14) {
        const seenIds = new Set(auctionListings.map(l => l.id));
        sampleAuctionCars.forEach(sc => {
            if (!seenIds.has(sc.id)) {
                auctionListings.push(sc);
                seenIds.add(sc.id);
            }
        });
    }

    // Fetch live states
    const states = await Promise.all(auctionListings.map(l => getAuction(l.id).catch(() => sampleAuctionState[l.id]?.auction || null)));

    _auctionRows = auctionListings.map((l, i) => ({
        listing: l,
        auction: states[i] || sampleAuctionState[l.id]?.auction || null,
    }));

    // Populate model dropdown options based on available listings
    populateModelOptions();

    // 2. Wire Top Header Actions
    // Save search button
    const btnSaveSearch = document.getElementById('btnSaveSearchHeader');
    if (btnSaveSearch) {
        btnSaveSearch.addEventListener('click', () => {
            showToast('Iskanje dražb shranjeno! Obveščali vas bomo o novih ponudbah.', 'success');
        });
    }

    // View mode toggle (list / grid)
    const viewToggleGroup = document.getElementById('viewToggleGroup');
    if (viewToggleGroup) {
        viewToggleGroup.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.view;
                _filters.viewMode = mode;
                viewToggleGroup.querySelectorAll('button').forEach(b => {
                    const isCur = b === btn;
                    b.classList.toggle('on', isCur);
                    b.setAttribute('aria-pressed', isCur ? 'true' : 'false');
                });
                const container = document.getElementById('carListingsContainer');
                if (container) {
                    container.classList.toggle('list-layout', mode === 'list');
                    container.classList.toggle('grid-layout', mode === 'grid');
                }
            });
        });
    }

    // Sort Dropdown
    const sortBtn = document.getElementById('drazbeSortBtn');
    const sortMenu = document.getElementById('drazbeSortDropdown');
    const sortLabel = document.getElementById('currentSortLabel');

    if (sortBtn && sortMenu) {
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = sortMenu.style.display === 'block';
            sortMenu.style.display = isOpen ? 'none' : 'block';
        });

        sortMenu.querySelectorAll('.drazbe-sort-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                _filters.sortBy = item.dataset.sort;
                sortMenu.querySelectorAll('.drazbe-sort-item').forEach(i => i.classList.remove('on'));
                item.classList.add('on');
                if (sortLabel) sortLabel.textContent = item.textContent;
                sortMenu.style.display = 'none';
                renderView();
            });
        });

        document.addEventListener('click', () => {
            sortMenu.style.display = 'none';
        });
    }

    // 3. Wire 4 Top Auction Type filter cards (.az-ty)
    const typeCards = document.querySelectorAll('#auctionTypeCardsGroup .az-ty');
    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            const t = card.dataset.type;
            _filters.auctionType = t;
            typeCards.forEach(c => {
                const isCur = c === card;
                c.classList.toggle('on', isCur);
                c.setAttribute('aria-pressed', isCur ? 'true' : 'false');
            });
            renderView();
        });
    });

    // 4. Wire Sidebar: Vrsta vozila (Avtomobili / Motorji)
    const vtypeSeg = document.getElementById('vehicleTypeSegment');
    if (vtypeSeg) {
        vtypeSeg.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                vtypeSeg.querySelectorAll('button').forEach(b => b.classList.remove('on'));
                btn.classList.add('on');
                _filters.vehicleType = btn.dataset.vtype;
                populateModelOptions();
                renderView();
            });
        });
    }

    // 5. Wire Status dražbe chips
    const statusChips = document.querySelectorAll('#statusChipsGroup .chip');
    statusChips.forEach(chip => {
        chip.addEventListener('click', () => {
            statusChips.forEach(c => c.classList.remove('on'));
            chip.classList.add('on');
            _filters.status = chip.dataset.status;
            renderView();
        });
    });

    // 6. Wire Čas do zaključka chips
    const timeChips = document.querySelectorAll('#timeRemainingChipsGroup .chip');
    timeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const wasOn = chip.classList.contains('on');
            timeChips.forEach(c => c.classList.remove('on'));
            if (!wasOn) {
                chip.classList.add('on');
                _filters.timeRemaining = chip.dataset.time;
            } else {
                _filters.timeRemaining = '';
            }
            renderView();
        });
    });

    // 7. Wire Pogoji dražbe toggle switches (.tsw)
    const wireSwitch = (id, key) => {
        const sw = document.getElementById(id);
        if (sw) {
            sw.addEventListener('click', () => {
                _filters[key] = !_filters[key];
                sw.classList.toggle('on', _filters[key]);
                sw.setAttribute('aria-checked', String(_filters[key]));
                renderView();
            });
        }
    };
    wireSwitch('swBinding', 'binding');
    wireSwitch('swCash', 'cash');
    wireSwitch('swReserveMet', 'reserveMet');
    wireSwitch('swHasBids', 'hasBids');
    wireSwitch('swRememberFilters', 'rememberFilters');

    // 8. Wire Brand chips (.bchip)
    document.querySelectorAll('.bchip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const brand = chip.dataset.brand;
            if (_filters.selectedBrands.has(brand)) {
                _filters.selectedBrands.delete(brand);
                chip.classList.add('off');
            } else {
                _filters.selectedBrands.add(brand);
                chip.classList.remove('off');
            }
            populateModelOptions();
            renderView();
        });
    });

    // Add brand button
    const addBrandBtn = document.getElementById('addBrandChipBtn');
    if (addBrandBtn) {
        addBrandBtn.addEventListener('click', () => {
            // Cycle in Audi, Mercedes-Benz, Škoda, BMW if not present
            const extraBrands = ['Audi', 'Mercedes-Benz', 'Škoda', 'BMW', 'Volkswagen'];
            for (const b of extraBrands) {
                if (!_filters.selectedBrands.has(b)) {
                    _filters.selectedBrands.add(b);
                    showToast(`Znamka "${b}" dodana v filter!`, 'success');
                    break;
                }
            }
            renderView();
        });
    }

    // Model select
    const modelSelect = document.getElementById('sidebarModelSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', () => {
            _filters.selectedModel = modelSelect.value;
            renderView();
        });
    }

    // 9. Wire Price Inputs and Slider
    const priceFromInput = document.getElementById('sidebarPriceFrom');
    const priceToInput = document.getElementById('sidebarPriceTo');

    if (priceFromInput) {
        priceFromInput.addEventListener('input', () => {
            _filters.priceMin = Number(priceFromInput.value) || 0;
            renderView();
        });
    }
    if (priceToInput) {
        priceToInput.addEventListener('input', () => {
            _filters.priceMax = Number(priceToInput.value) || 250000;
            renderView();
        });
    }

    // 10. Wire Year Inputs
    const yearFromInput = document.getElementById('sidebarYearFrom');
    const yearToInput = document.getElementById('sidebarYearTo');

    if (yearFromInput) {
        yearFromInput.addEventListener('input', () => {
            _filters.yearMin = Number(yearFromInput.value) || 2000;
            renderView();
        });
    }
    if (yearToInput) {
        yearToInput.addEventListener('input', () => {
            _filters.yearMax = Number(yearToInput.value) || 2026;
            renderView();
        });
    }

    // 11. Wire Section Reset Buttons
    const wireReset = (btnId, callback) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                callback();
                renderView();
            });
        }
    };

    wireReset('resetStatusBtn', () => {
        _filters.status = 'active';
        statusChips.forEach(c => c.classList.toggle('on', c.dataset.status === 'active'));
    });
    wireReset('resetTimeBtn', () => {
        _filters.timeRemaining = '7d';
        timeChips.forEach(c => c.classList.toggle('on', c.dataset.time === '7d'));
    });
    wireReset('resetConditionsBtn', () => {
        _filters.binding = true;
        _filters.cash = false;
        _filters.reserveMet = false;
        _filters.hasBids = false;
        const sw1 = document.getElementById('swBinding'); if (sw1) { sw1.classList.add('on'); sw1.setAttribute('aria-checked', 'true'); }
        const sw2 = document.getElementById('swCash'); if (sw2) { sw2.classList.remove('on'); sw2.setAttribute('aria-checked', 'false'); }
        const sw3 = document.getElementById('swReserveMet'); if (sw3) { sw3.classList.remove('on'); sw3.setAttribute('aria-checked', 'false'); }
        const sw4 = document.getElementById('swHasBids'); if (sw4) { sw4.classList.remove('on'); sw4.setAttribute('aria-checked', 'false'); }
    });
    wireReset('resetBrandBtn', () => {
        _filters.selectedBrands = new Set(['Porsche', 'Tesla', 'Toyota']);
        _filters.selectedModel = '';
        document.querySelectorAll('.bchip').forEach(b => {
            b.classList.toggle('off', !_filters.selectedBrands.has(b.dataset.brand));
        });
        if (modelSelect) modelSelect.value = '';
    });
    wireReset('resetPriceBtn', () => {
        _filters.priceMin = 1000;
        _filters.priceMax = 200000;
        if (priceFromInput) priceFromInput.value = 1000;
        if (priceToInput) priceToInput.value = 200000;
    });
    wireReset('resetYearBtn', () => {
        _filters.yearMin = 2015;
        _filters.yearMax = 2025;
        if (yearFromInput) yearFromInput.value = 2015;
        if (yearToInput) yearToInput.value = 2025;
    });

    // 12. "Prikaži več dražb" Load more button
    const loadMoreBtn = document.getElementById('loadMoreAuctionsBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            _filters.visibleLimit += 8;
            renderView();
        });
    }

    // 13. Sidebar & Banner Notifications
    const sidebarNotifyBtn = document.getElementById('sidebarNotifyBtn');
    if (sidebarNotifyBtn) {
        sidebarNotifyBtn.addEventListener('click', () => {
            showToast('Obvestila o novih dražbah so vklopljena!', 'success');
        });
    }
    const btnNotifyBanner = document.getElementById('btnNotifyBanner');
    if (btnNotifyBanner) {
        btnNotifyBanner.addEventListener('click', () => {
            showToast('Shranjeno! Prejeli boste obvestilo ob novih dražbah.', 'success');
        });
    }

    // 14. Newsletter in footer section
    const nlSubmit = document.getElementById('auctionNewsletterSubmitBtn');
    if (nlSubmit) {
        nlSubmit.addEventListener('click', () => {
            const email = document.getElementById('auctionNewsletterEmail')?.value;
            if (email && email.includes('@')) {
                showToast('Hvala za prijavo! Obvestila bodo poslana na ' + email, 'success');
            } else {
                showToast('Vnesite veljaven e-naslov.', 'warn');
            }
        });
    }

    // Popular searches chips
    document.querySelectorAll('#popularSearchesChips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const q = chip.dataset.search || chip.textContent.trim();
            const input = document.getElementById('auctionNewsletterQuery');
            if (input) input.value = q;
            showToast(`Izbrano: ${q}`, 'info');
        });
    });

    // 15. Initial Render and live countdown
    renderView();
    startLiveCountdowns();
}

function populateModelOptions() {
    const sel = document.getElementById('sidebarModelSelect');
    if (!sel) return;

    const availableModels = new Set();
    _auctionRows.forEach(r => {
        if (_filters.vehicleType === 'moto') {
            if (r.listing.category === 'motorna-kolesa' || r.listing.category === 'moto') {
                if (r.listing.model) availableModels.add(r.listing.model);
            }
        } else {
            if (r.listing.category !== 'motorna-kolesa' && r.listing.category !== 'moto') {
                if (_filters.selectedBrands.size === 0 || _filters.selectedBrands.has(r.listing.make)) {
                    if (r.listing.model) availableModels.add(r.listing.model);
                }
            }
        }
    });

    let opts = '<option value="">Vsi modeli</option>';
    Array.from(availableModels).sort().forEach(m => {
        const selAttr = _filters.selectedModel === m ? 'selected' : '';
        opts += `<option value="${escapeHtml(m)}" ${selAttr}>${escapeHtml(m)}</option>`;
    });
    sel.innerHTML = opts;
}
