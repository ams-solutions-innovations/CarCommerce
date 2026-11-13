// Najem vozil (Rentals Page) — Carcommerce / AutoHub.si
import { getRentalListings } from '../services/listingService.js';
import { PLATFORM } from '../config/platform.js';
import { escHtml } from '../utils/escHtml.js';
import { navigateTo } from '../router.js';
import { t } from '../core/i18n.js';
import { icon } from '../components/autohub/icons.js';
import { bindCardEvents } from './oglasi.js';

let _allRentalListings = [];
let _activeDays = 3;

function fmtEur(n) {
    return (Number(n) || 0).toLocaleString('sl-SI') + ' €';
}

function calcTotalRentalPrice(car, days) {
    const rp = car.rentalPricing || {};
    const daily = Number(rp.perDay || car.salePriceEur || car.priceRaw || car.price || 40);
    const weekly = Number(rp.perWeek || 0);

    let total = daily * days;
    // If weekly rate is specified and cheaper for >= 7 days
    if (weekly > 0 && days >= 7) {
        const fullWeeks = Math.floor(days / 7);
        const remDays = days % 7;
        total = (fullWeeks * weekly) + (remDays * daily);
    }
    return { daily, total: Math.round(total) };
}

function renderRentalCard(car, days) {
    const id = escHtml(String(car.id));
    const rp = car.rentalPricing || {};
    const { daily, total } = calcTotalRentalPrice(car, days);

    let displayImages = [];
    if (car.images) {
        if (car.images.exterior) displayImages.push(...car.images.exterior);
        if (car.images.interior) displayImages.push(...car.images.interior);
    }
    if (displayImages.length === 0) displayImages.push(car.image || 'images/car-placeholder.png');
    const images = [...new Set(displayImages)].slice(0, 5);

    const title = [car.make || car.brand, car.model].filter(Boolean).join(' ') || car.title;
    const location = typeof car.location === 'object' ? car.location?.city || car.location?.region || '' : car.location || '';
    const depositText = rp.deposit ? `Varščina: ${fmtEur(rp.deposit)}` : 'Brez varščine (0 €)';
    const kmText = rp.includedKmPerDay === 'unlimited' ? 'Neomejeni km' : `${rp.includedKmPerDay || 300} km/dan`;
    const insuranceText = rp.insuranceType === 'full' ? '0 € franšize (kasko)' : 'Osnovno kasko';
    const detailHref = `/oglas?id=${encodeURIComponent(car.id)}`;

    const isCamper = car.category === 'pocitniska' || (car.camperAmenities && car.camperAmenities.beds);
    const capacityText = isCamper ? `${car.camperAmenities?.beds || car.seatsCount || 4} ležišča` : `${car.seatsCount || 5} sedežev`;

    return `<article class="listing-card ah-listing-card rental-card" data-car-id="${id}" style="position:relative;">
        <div class="card-gallery-wrapper ah-card-photo">
            <div class="card-gallery-scroll">
                ${images.map((src, index) => `<img src="${escHtml(src)}" alt="${escHtml(title)}${index ? ` — ${index + 1}` : ''}" loading="lazy" decoding="async">`).join('')}
            </div>
            
            <span class="ah-photo-badge" style="background:#2563eb; color:#fff; font-weight:800;">NAJEM</span>
            ${rp.insuranceType === 'full' ? `<span class="ah-photo-badge ah-badge-blue" style="top:2.6rem;">0 € FRANŠIZE</span>` : ''}
            ${rp.vignetteIncluded ? `<span class="ah-photo-badge" style="top:${rp.insuranceType === 'full' ? '4.8rem' : '2.6rem'}; background:#10b981; color:#fff;">SLO VINJETA</span>` : ''}

            ${images.length > 1 ? `
                <button type="button" class="card-gallery-arrow card-gallery-prev ah-gallery-prev" aria-label="Prejšnja slika">${icon('right')}</button>
                <button type="button" class="card-gallery-arrow card-gallery-next ah-gallery-next" aria-label="Naslednja slika">${icon('right')}</button>
                <div class="card-gallery-dots">${images.map((_, i) => `<span class="card-gallery-dot ${i ? '' : 'active'}" data-dot-idx="${i}"></span>`).join('')}</div>
            ` : ''}
            <span class="ah-photo-count">${icon('camera')}1 / ${car.imgCount || images.length}</span>
        </div>

        <div class="ah-card-content">
            <div class="ah-card-heading">
                <div>
                    <h2><a href="${detailHref}">${escHtml(title)}</a></h2>
                    <p class="ah-card-subtitle">${escHtml(car.subtitle || car.variant || '')}</p>
                </div>
            </div>

            <!-- Price & Period calculation -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin:0.6rem 0; flex-wrap:wrap; gap:0.5rem;">
                <div>
                    <div style="font-size:1.6rem; font-weight:800; color:#2563eb; line-height:1.1;">
                        ${daily} € <span style="font-size:0.9rem; font-weight:600; color:#64748b;">/ dan</span>
                    </div>
                    <div style="font-size:0.8rem; font-weight:600; color:#64748b; margin-top:0.2rem;">
                        ${depositText}
                    </div>
                </div>
                ${days > 0 ? `
                    <div class="rental-pricing-badge" title="Skupni izračun za izbrano število dni">
                        <i data-lucide="check-circle-2" style="width:15px;height:15px;"></i>
                        <span>Skupaj: <strong>${fmtEur(total)}</strong> (${days} ${days === 1 ? 'dan' : (days === 2 ? 'dneva' : (days < 5 ? 'dni' : 'dni'))})</span>
                    </div>
                ` : ''}
            </div>

            <!-- Rental Specs Pills -->
            <div class="ah-card-specs" style="margin-top:0.5rem; display:flex; flex-wrap:wrap; gap:0.35rem;">
                <span class="ah-spec">${icon('gauge')}${escHtml(kmText)}</span>
                <span class="ah-spec">${icon('verified')}${escHtml(insuranceText)}</span>
                <span class="ah-spec">${icon('user')}${escHtml(capacityText)}</span>
                ${car.transmission ? `<span class="ah-spec">${icon('gear')}${escHtml(car.transmission)}</span>` : ''}
                ${car.fuel ? `<span class="ah-spec">${icon('fuel')}${escHtml(car.fuel)}</span>` : ''}
                ${location ? `<span class="ah-spec">${icon('pin')}${escHtml(location)}</span>` : ''}
                ${rp.crossBorderAllowed ? `<span class="ah-spec">${icon('globe')}Vožnja v EU</span>` : ''}
            </div>

            <!-- Actions footer -->
            <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid rgba(226,232,240,0.6); display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                <span style="font-size:0.8rem; font-weight:600; color:#64748b;">
                    ${car.seller ? escHtml(typeof car.seller === 'object' ? car.seller.name : car.seller) : 'Preverjen ponudnik'}
                </span>
                <a href="${detailHref}" class="pill-btn primary" style="text-decoration:none; padding:0.4rem 1.2rem; font-size:0.85rem; font-weight:700; border-radius:999px;">
                    Rezerviraj najem
                </a>
            </div>
        </div>
    </article>`;
}

function getSidebarRentalFilterValues() {
    const category = document.getElementById('rentalCategorySelect')?.value || '';
    const priceFrom = Number(document.getElementById('rentalPriceFrom')?.value) || 0;
    const priceTo = Number(document.getElementById('rentalPriceTo')?.value) || 0;
    const deposit = document.getElementById('rentalDepositSelect')?.value;
    const unlimitedKm = document.getElementById('filterUnlimitedKm')?.checked || false;
    const zeroExcess = document.getElementById('filterZeroExcess')?.checked || false;
    const vignette = document.getElementById('filterVignette')?.checked || false;
    const crossBorder = document.getElementById('filterCrossBorder')?.checked || false;
    const addDriver = document.getElementById('filterAddDriver')?.checked || false;
    const location = document.getElementById('rentalLocationSelect')?.value || document.getElementById('rentalHeroLocation')?.value || '';
    const transmission = document.getElementById('rentalTransmissionSelect')?.value || '';
    const fuel = document.getElementById('rentalFuelSelect')?.value || '';
    const sortBy = document.getElementById('najemSortSelect')?.value || '';

    return {
        category, priceFrom, priceTo, deposit, unlimitedKm, zeroExcess,
        vignette, crossBorder, addDriver, location, transmission, fuel, sortBy
    };
}

function filterAndSortRentals(listings, filters, days) {
    let result = listings.filter(item => {
        const rp = item.rentalPricing || {};
        const dailyPrice = Number(rp.perDay || item.salePriceEur || item.priceRaw || item.price || 0);

        if (filters.category) {
            if (filters.category === 'suv' && item.bodyType !== 'suv') return false;
            if (filters.category === 'potniski-kombi' && item.bodyType !== 'potniski-kombi') return false;
            if (filters.category === 'pocitniska' && item.category !== 'pocitniska') return false;
            if (filters.category === 'gospodarska' && item.category !== 'gospodarska') return false;
            if (filters.category === 'avto' && item.category !== 'avto') return false;
            if (filters.category === 'moto' && !['moto', 'motor'].includes(item.category)) return false;
        }

        if (filters.priceFrom > 0 && dailyPrice < filters.priceFrom) return false;
        if (filters.priceTo > 0 && dailyPrice > filters.priceTo) return false;

        if (filters.deposit !== '' && filters.deposit !== undefined && filters.deposit !== null) {
            const maxDep = Number(filters.deposit);
            const curDep = Number(rp.deposit || 0);
            if (curDep > maxDep) return false;
        }

        if (filters.unlimitedKm && rp.includedKmPerDay !== 'unlimited') return false;
        if (filters.zeroExcess && rp.insuranceType !== 'full') return false;
        if (filters.vignette && !rp.vignetteIncluded) return false;
        if (filters.crossBorder && !rp.crossBorderAllowed) return false;
        if (filters.addDriver && !rp.additionalDriverIncluded) return false;

        if (filters.location) {
            const locStr = (typeof item.location === 'object' ? `${item.location.city || ''} ${item.location.region || ''}` : item.location || '').toLowerCase();
            if (!locStr.includes(filters.location.toLowerCase())) return false;
        }

        if (filters.transmission && item.transmission !== filters.transmission) return false;
        if (filters.fuel && item.fuel !== filters.fuel) return false;

        return true;
    });

    if (filters.sortBy === 'price-asc') {
        result.sort((a, b) => (a.rentalPricing?.perDay || a.priceRaw) - (b.rentalPricing?.perDay || b.priceRaw));
    } else if (filters.sortBy === 'price-desc') {
        result.sort((a, b) => (b.rentalPricing?.perDay || b.priceRaw) - (a.rentalPricing?.perDay || a.priceRaw));
    } else if (filters.sortBy === 'deposit-asc') {
        result.sort((a, b) => (a.rentalPricing?.deposit || 0) - (b.rentalPricing?.deposit || 0));
    }

    return result;
}

function updateRentalView() {
    const grid = document.getElementById('carListingsContainer');
    const countEl = document.getElementById('najemCount');
    const periodSummaryEl = document.getElementById('rentalPeriodSummary');
    if (!grid) return;

    if (periodSummaryEl) {
        periodSummaryEl.textContent = `Obdobje: ${_activeDays} ${_activeDays === 1 ? 'dan' : (_activeDays === 2 ? 'dneva' : (_activeDays < 5 ? 'dni' : 'dni'))}`;
    }

    const filters = getSidebarRentalFilterValues();
    const filtered = filterAndSortRentals(_allRentalListings, filters, _activeDays);

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="drazbe-empty" style="text-align:center; padding:3rem 1rem;">
            <p style="font-size:1.2rem; font-weight:700;">🔑 Trenutno ni vozil za najem po izbranih filtrih.</p>
            <p class="drazbe-empty-sub" style="color:#64748b;">Poskusite razširiti iskalne kriterije ali izberite drugo lokacijo prevzema.</p>
        </div>`;
        if (countEl) countEl.textContent = '(0)';
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    grid.innerHTML = filtered.map(c => renderRentalCard(c, _activeDays)).join('');
    if (countEl) countEl.textContent = `(${filtered.length} vozil)`;

    bindCardEvents(grid, filtered);
    if (window.lucide) window.lucide.createIcons();
}

function initDatePickers() {
    const dateFromEl = document.getElementById('rentalDateFrom');
    const dateToEl = document.getElementById('rentalDateTo');
    if (!dateFromEl || !dateToEl) return;

    const today = new Date();
    const toDate = new Date();
    toDate.setDate(today.getDate() + 3);

    const formatIso = d => d.toISOString().split('T')[0];
    dateFromEl.value = formatIso(today);
    dateToEl.value = formatIso(toDate);

    const recomputeDaysFromDates = () => {
        const from = new Date(dateFromEl.value);
        const to = new Date(dateToEl.value);
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            const diffTime = to.getTime() - from.getTime();
            const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
            _activeDays = diffDays;

            // Highlight corresponding quick day button if matches
            document.querySelectorAll('.rental-quick-day-btn').forEach(btn => {
                btn.classList.toggle('active', Number(btn.dataset.days) === _activeDays);
            });

            updateRentalView();
        }
    };

    dateFromEl.addEventListener('change', recomputeDaysFromDates);
    dateToEl.addEventListener('change', recomputeDaysFromDates);

    // Quick Day Buttons
    document.querySelectorAll('.rental-quick-day-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.rental-quick-day-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const days = Number(btn.dataset.days) || 1;
            _activeDays = days;

            const from = dateFromEl.value ? new Date(dateFromEl.value) : new Date();
            const to = new Date(from);
            to.setDate(from.getDate() + days);
            dateToEl.value = formatIso(to);

            updateRentalView();
        });
    });
}

function bindRentalAccordions() {
    document.querySelectorAll('#sidebarFiltersForm .adv-accordion').forEach(acc => {
        const trigger = acc.querySelector('.adv-acc-trigger');
        const body = acc.querySelector('.adv-acc-body');
        if (!trigger || !body) return;

        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', String(!expanded));
            body.style.display = expanded ? 'none' : 'flex';
        });
    });
}

function wireRentalSidebarEvents() {
    const form = document.getElementById('sidebarFiltersForm');
    if (!form) return;

    form.addEventListener('change', () => updateRentalView());
    form.addEventListener('input', () => updateRentalView());

    // Quick price radios
    form.querySelectorAll('input[name="quickPrice"]').forEach(r => {
        r.addEventListener('change', () => {
            const priceToEl = document.getElementById('rentalPriceTo');
            if (priceToEl) {
                priceToEl.value = r.value;
                updateRentalView();
            }
        });
    });

    // Reset button
    const resetBtn = document.getElementById('sidebarResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            const heroLoc = document.getElementById('rentalHeroLocation');
            if (heroLoc) heroLoc.value = '';
            _activeDays = 3;
            initDatePickers();
            updateRentalView();
        });
    }

    // Hero location select sync
    const heroLoc = document.getElementById('rentalHeroLocation');
    const sideLoc = document.getElementById('rentalLocationSelect');
    if (heroLoc && sideLoc) {
        heroLoc.addEventListener('change', () => {
            sideLoc.value = heroLoc.value;
            updateRentalView();
        });
        sideLoc.addEventListener('change', () => {
            heroLoc.value = sideLoc.value;
            updateRentalView();
        });
    }

    // Sort select
    const sortEl = document.getElementById('najemSortSelect');
    if (sortEl) {
        sortEl.addEventListener('change', () => updateRentalView());
    }

    // Mobile filter drawer
    const mobileToggle = document.getElementById('mobileFilterToggle');
    const filtersCard = document.getElementById('filtersCard');
    if (mobileToggle && filtersCard) {
        mobileToggle.addEventListener('click', () => {
            filtersCard.classList.toggle('open');
            mobileToggle.classList.toggle('active');
        });
    }
}

function parseUrlParamsIntoSidebar() {
    const url = new URL(window.location.href);
    const cat = url.searchParams.get('cat');
    const priceTo = url.searchParams.get('priceTo');
    const loc = url.searchParams.get('location') || url.searchParams.get('city');

    if (cat) {
        const catSelect = document.getElementById('rentalCategorySelect');
        if (catSelect) catSelect.value = cat;
    }
    if (priceTo) {
        const priceToEl = document.getElementById('rentalPriceTo');
        if (priceToEl) priceToEl.value = priceTo;
    }
    if (loc) {
        const locSelect = document.getElementById('rentalLocationSelect');
        const heroLoc = document.getElementById('rentalHeroLocation');
        if (locSelect) locSelect.value = loc;
        if (heroLoc) heroLoc.value = loc;
    }
}

export async function initNajemPage() {
    console.log('[Najem] init page');
    const grid = document.getElementById('carListingsContainer');
    if (!grid) return;

    try {
        _allRentalListings = await getRentalListings();
        console.log('[Najem] loaded rental listings count:', _allRentalListings.length);
    } catch (err) {
        console.error('[Najem] failed to load rental listings', err);
        _allRentalListings = [];
    }

    bindRentalAccordions();
    initDatePickers();
    wireRentalSidebarEvents();
    parseUrlParamsIntoSidebar();
    updateRentalView();

    if (window.lucide) window.lucide.createIcons();
}
