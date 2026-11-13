// Napredno iskanje najema vozil (Advanced Search Rentals) — Carcommerce / AutoHub.si
import { getRentalListings } from '../services/listingService.js';
import { navigateTo } from '../router.js';

let _rentalListingsCache = [];

function countRentalMatches(form) {
    if (!_rentalListingsCache.length) return 0;

    const fd = new FormData(form);
    const cat = fd.get('cat') || '';
    const priceFrom = Number(fd.get('priceFrom')) || 0;
    const priceTo = Number(fd.get('priceTo')) || 0;
    const maxDeposit = fd.get('maxDeposit');
    const kmLimit = fd.get('kmLimit');
    const zeroExcess = fd.get('zeroExcess') === '1';
    const crossBorder = fd.get('crossBorder') === '1';
    const extraDriver = fd.get('extraDriver') === '1';
    const vignette = fd.get('vignette') === '1';
    const location = fd.get('location') || '';

    const transmissions = fd.getAll('transmission');
    const fuels = fd.getAll('fuel');
    const seats = fd.getAll('seats').map(Number);
    const berths = fd.getAll('berths').map(Number);

    return _rentalListingsCache.filter(car => {
        const rp = car.rentalPricing || {};
        const dailyPrice = Number(rp.perDay || car.salePriceEur || car.priceRaw || car.price || 0);

        if (cat) {
            if (cat === 'potniski-kombi' && car.bodyType !== 'potniski-kombi') return false;
            if (cat === 'pocitniska' && car.category !== 'pocitniska') return false;
            if (cat === 'gospodarska' && car.category !== 'gospodarska') return false;
            if (cat === 'avto' && car.category !== 'avto') return false;
            if (cat === 'moto' && !['moto', 'motor'].includes(car.category)) return false;
        }

        if (priceFrom > 0 && dailyPrice < priceFrom) return false;
        if (priceTo > 0 && dailyPrice > priceTo) return false;

        if (maxDeposit !== '' && maxDeposit !== null && maxDeposit !== undefined) {
            const curDep = Number(rp.deposit || 0);
            if (curDep > Number(maxDeposit)) return false;
        }

        if (kmLimit === 'unlimited' && rp.includedKmPerDay !== 'unlimited') return false;
        if (kmLimit && Number(kmLimit) > 0) {
            const incKm = rp.includedKmPerDay === 'unlimited' ? 999999 : Number(rp.includedKmPerDay || 0);
            if (incKm < Number(kmLimit)) return false;
        }

        if (zeroExcess && rp.insuranceType !== 'full') return false;
        if (crossBorder && !rp.crossBorderAllowed) return false;
        if (extraDriver && !rp.additionalDriverIncluded) return false;
        if (vignette && !rp.vignetteIncluded) return false;

        if (location) {
            const locStr = (typeof car.location === 'object' ? `${car.location.city || ''} ${car.location.region || ''}` : car.location || '').toLowerCase();
            if (!locStr.includes(location.toLowerCase())) return false;
        }

        if (transmissions.length > 0 && !transmissions.includes(car.transmission)) return false;
        if (fuels.length > 0 && !fuels.includes(car.fuel)) return false;
        if (seats.length > 0 && !seats.includes(car.seatsCount)) return false;

        if (berths.length > 0) {
            const carBerths = car.camperAmenities?.beds || 0;
            const matchesBerths = berths.some(b => b === 5 ? carBerths >= 5 : carBerths === b);
            if (!matchesBerths) return false;
        }

        return true;
    }).length;
}

function updateSubmitCount(form) {
    const textEl = document.getElementById('advRentalSubmitText');
    if (!textEl) return;
    const count = countRentalMatches(form);
    textEl.textContent = `Prikaži ponudbo najema (${count} ${count === 1 ? 'vozilo' : (count === 2 ? 'vozili' : (count < 5 ? 'vozila' : 'vozil'))})`;
}

export async function initAdvancedSearchRentalPage() {
    console.log('[AdvancedSearchRental] init page');
    const form = document.getElementById('advancedRentalSearchForm');
    if (!form) return;

    try {
        _rentalListingsCache = await getRentalListings();
    } catch (e) {
        console.error('[AdvancedSearchRental] failed to fetch rentals', e);
        _rentalListingsCache = [];
    }

    // Default dates (today & +3 days)
    const dateFromEl = document.getElementById('advRentalDateFrom');
    const dateToEl = document.getElementById('advRentalDateTo');
    if (dateFromEl && dateToEl) {
        const today = new Date();
        const toDate = new Date();
        toDate.setDate(today.getDate() + 3);
        const formatIso = d => d.toISOString().split('T')[0];
        dateFromEl.value = formatIso(today);
        dateToEl.value = formatIso(toDate);
    }

    // 1. Vehicle category tabs
    const catTabs = document.querySelectorAll('#rentalCategoryTabs .tab-btn');
    const catHidden = document.getElementById('rentalCatHidden');
    const camperAccordion = document.getElementById('camperAccordion');

    catTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            catTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const val = tab.dataset.tab || '';
            if (catHidden) catHidden.value = val;

            // If camper tab chosen, expand camper accordion
            if (val === 'pocitniska' && camperAccordion) {
                const trigger = camperAccordion.querySelector('.adv-acc-trigger');
                const body = camperAccordion.querySelector('.adv-acc-body');
                if (trigger && body) {
                    trigger.setAttribute('aria-expanded', 'true');
                    body.style.display = 'flex';
                }
            }

            updateSubmitCount(form);
        });
    });

    // 2. Accordions logic
    document.querySelectorAll('#advancedRentalSearchForm .adv-accordion:not(.persistent-open)').forEach(acc => {
        const trigger = acc.querySelector('.adv-acc-trigger');
        const body = acc.querySelector('.adv-acc-body');
        if (!trigger || !body) return;

        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', String(!expanded));
            body.style.display = expanded ? 'none' : 'flex';
        });
    });

    // 3. Form input & change listener for live count
    form.addEventListener('input', () => updateSubmitCount(form));
    form.addEventListener('change', () => updateSubmitCount(form));

    // 4. Form Reset
    form.addEventListener('reset', () => {
        catTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === ''));
        if (catHidden) catHidden.value = '';
        setTimeout(() => updateSubmitCount(form), 50);
    });

    // 5. Form Submit -> navigate to /najem with URL query params
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const params = new URLSearchParams();

        for (const [key, val] of fd.entries()) {
            if (val && val !== '') {
                params.append(key, val);
            }
        }

        navigateTo(`/najem?${params.toString()}`);
    });

    // Initial count
    updateSubmitCount(form);

    if (window.lucide) window.lucide.createIcons();
}
