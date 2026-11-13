// ═══════════════════════════════════════════════════════════════════════════════
// AutoHub Listing Detail View — 1:1 Implementation of 04 Oglas.dc.html
// ═══════════════════════════════════════════════════════════════════════════════

import { escHtml } from '../../utils/escHtml.js';
import { t } from '../../core/i18n.js';
import { openSellerContact } from './contact.js';
import { getListingViewStats, formatPrice } from '../../services/listingService.js';
import { getBrandRgb } from '../../data/brandColors.js';
import { getBrandLogo } from '../../data/brandLogos.js';
import { getVehicleRating } from '../../utils/valuationScore.js';

// SVG symbol definitions matching 04 Oglas.dc.html
const SVG_DEFS = `
<svg width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true" focusable="false">
<defs>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7.5"></circle><path d="m20.5 20.5-4-4"></path></symbol>
<symbol id="i-heart" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></symbol>
<symbol id="i-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></symbol>
<symbol id="i-right" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></symbol>
<symbol id="i-left" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"></path></symbol>
<symbol id="i-cal" viewBox="0 0 24 24"><path d="M8 2v4M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></symbol>
<symbol id="i-gauge" viewBox="0 0 24 24"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></symbol>
<symbol id="i-zap" viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></symbol>
<symbol id="i-fuel" viewBox="0 0 24 24"><path d="M3 22h12M4 9h10"></path><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path></symbol>
<symbol id="i-gear" viewBox="0 0 24 24"><circle cx="6" cy="5.5" r="2"></circle><circle cx="18" cy="5.5" r="2"></circle><circle cx="6" cy="18.5" r="2"></circle><circle cx="18" cy="18.5" r="2"></circle><path d="M6 7.5v9M18 7.5v9M6 12h12"></path></symbol>
<symbol id="i-cog" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><circle cx="12" cy="12" r="7"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path></symbol>
<symbol id="i-wheel" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="2.5"></circle><path d="M12 3v6.5M5 16.5l5.2-3M19 16.5l-5.2-3"></path></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5z"></path><path d="m3 8 9 5 9-5M12 13v8"></path></symbol>
<symbol id="i-usercheck" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="m16 11 2 2 4-4"></path></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></symbol>
<symbol id="i-verified" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></symbol>
<symbol id="i-trend" viewBox="0 0 24 24"><path d="M22 17 13.5 8.5 8.5 13.5 2 7"></path><path d="M16 17h6v-6"></path></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></symbol>
<symbol id="i-camera" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></symbol>
<symbol id="i-scale" viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></symbol>
<symbol id="i-msg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></symbol>
<symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"></path></symbol>
<symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></symbol>
<symbol id="i-expand" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></symbol>
<symbol id="i-flag" viewBox="0 0 24 24"><path d="M4 22V4a1 1 0 0 1 1-1h13l-2 5 2 5H5"></path></symbol>
<symbol id="i-wrench" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"></path></symbol>
<symbol id="i-repeat" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></symbol>
<symbol id="i-banknote" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></symbol>
<symbol id="i-folder" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></symbol>
</defs>
</svg>
`;

/**
 * Main renderer for AutoHub vehicle detail page
 */
export function renderAutoHubListing(page, listing, allListings = []) {
    page.classList.add('ah-listing-detail');
    document.body.classList.add('ah-listing-detail-page');
    document.addEventListener('routeChanged', () => document.body.classList.remove('ah-listing-detail-page'), { once: true });

    const l = listing;
    const make = l.make || l.brand || '';
    const model = l.model || '';
    const variant = l.variant || l.data?.variant || '';
    const brandTitle = `${make} ${model}`.trim() || t('vehicle', 'Vozilo');
    const brandRgb = getBrandRgb(make);
    const brandLogo = getBrandLogo(make);

    // Pricing & discounts
    const currentPrice = Number(l.salePriceEur || l.priceEur || l.priceRaw || l.price || 0);
    const originalPrice = Number(l.priceEur || l.priceRaw || l.price || currentPrice);
    const hasDiscount = Boolean(l.salePriceEur && l.salePriceEur < originalPrice);
    const discountPct = hasDiscount ? Math.round((1 - l.salePriceEur / originalPrice) * 100) : 0;
    const priceFormatted = new Intl.NumberFormat('sl-SI').format(currentPrice) + ' €';
    const origPriceFormatted = new Intl.NumberFormat('sl-SI').format(originalPrice) + ' €';

    // Dates for metadata & history
    const createdDate = l.created_at || l.createdAt ? new Date(l.created_at || l.createdAt) : new Date();
    const dateFormatted = !isNaN(createdDate.getTime())
        ? createdDate.toLocaleDateString('sl-SI', { day: 'numeric', month: 'numeric', year: 'numeric' })
        : '2026';
    const yearStr = l.year ? String(l.year) : '2023';
    const metaText = `${yearStr} · ${dateFormatted}`;

    // Condition
    const isNew = l.condition === 'new' || l.isNew === true;
    const conditionLabel = isNew ? 'Novo' : 'Rabljeno';

    // Images
    const exterior = Array.isArray(l.images?.exterior) ? l.images.exterior : (Array.isArray(l.images) ? l.images : []);
    const interior = Array.isArray(l.images?.interior) ? l.images.interior : [];
    const allImages = exterior.length > 0 ? exterior : (interior.length > 0 ? interior : ['brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg']);
    const firstImg = allImages[0] || 'brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg';

    // Contacts
    const phone = l.contact?.showPhone === false ? '' : (l.contact?.phone || l.dealerDetails?.phone || l.phone || '+386 1 582 53 00');
    const cleanPhone = String(phone).replace(/[^\d+]/g, '');
    const email = l.contact?.email || l.dealerDetails?.email || l.email || 'info@autohub.si';

    // Rating / Valuation
    const rating = getVehicleRating(l, allListings);
    const delta = rating?.deltaPercent || (hasDiscount ? -12 : -4);
    const valBadge = delta <= -8 ? 'Odlična vrednost' : delta <= 0 ? 'Ugodna cena' : 'Tržna cena';
    const valBadgeBg = delta <= -8 ? '#d9f2ee' : '#e6eefc';
    const valBadgeColor = delta <= -8 ? '#0b5c53' : '#1d4ed8';

    // Gauge track calculation (0% = ugodno, 50% = tržna, 100% = drago)
    const gaugePos = Math.max(10, Math.min(90, Math.round(50 + delta * 2)));

    // 24-bar histogram
    const bellCurve = [8, 12, 18, 26, 36, 50, 64, 80, 96, 108, 112, 106, 94, 80, 66, 50, 38, 28, 20, 14, 10, 8, 6, 4];
    const markerPercent = Math.max(8, Math.min(92, Math.round(50 + delta * 1.6)));
    const activeBarIdx = Math.min(23, Math.max(0, Math.floor((markerPercent / 100) * 24)));
    const histogramBars = bellCurve.map((h, i) => {
        const isCurrent = i === activeBarIdx;
        const bg = isCurrent ? '#0b1f3f' : '#d3e0f3';
        return `<div style="flex:1;height:${h}px;background:${bg};border-radius:3px 3px 0 0"></div>`;
    }).join('');

    const medianPrice = rating?.median ? Math.round(rating.median) : Math.round(currentPrice * 1.14);
    const minPrice = Math.round(medianPrice * 0.7);
    const maxPrice = Math.round(medianPrice * 1.25);
    const fmtMedian = new Intl.NumberFormat('sl-SI').format(medianPrice) + ' €';
    const fmtMin = new Intl.NumberFormat('sl-SI').format(minPrice) + ' €';
    const fmtMax = new Intl.NumberFormat('sl-SI').format(maxPrice) + ' €';

    // 9 Key facts
    const kmVal = l.mileageKm != null ? `${new Intl.NumberFormat('sl-SI').format(l.mileageKm)} km` : (l.mileage || '1.200 km');
    const kwVal = l.powerKw || l.power || 375;
    const hpVal = Math.round(kwVal * 1.35962);
    const fuelVal = l.fuel || 'Bencin';
    const regVal = l.registrationDate || (l.year ? `05/${l.year}` : '05/2023');
    const gearVal = l.transmission || 'Avtomatski';
    const engineShapeVal = l.engineType || (make === 'Porsche' ? 'Boxer-6' : 'V6 biturbo');
    const ownersVal = l.owners ? `${l.owners}. lastnik` : (l.firstOwner !== false ? '1. lastnik' : '1. lastnik');
    const driveVal = l.driveType || l.drivetrain || (make === 'Porsche' ? 'Zadaj' : '4x4 (štirikolesni)');
    const displacementVal = l.displacement ? `${new Intl.NumberFormat('sl-SI').format(l.displacement)} cm³` : '3.996 cm³';

    // Equipment items
    const customEq = ['Clubsport paket', 'Karbonska šoljkasta sedeža', 'Sistem za dvig prednje osi (Lift)'];
    const safetyEq = ['ABS', 'ESP', 'Alarm', 'Zračne blazine (voznik, sovoznik, bočne)', 'Nadzor tlaka v pnevmatikah'];
    const lightsEq = ['LED žarometi', 'Matrix LED', 'Prilagodljiva svetloba', 'Parkirni senzorji spredaj in zadaj', 'Vzvratna kamera'];
    const comfortEq = ['Športni sedeži', 'Naslon za roko', '2-conska klima', 'Ogrevani sedeži', 'Športno podvozje'];
    const mediaEq = ['Navigacija', 'Bluetooth', 'Apple CarPlay', 'Premium ozvočenje', 'Servisna knjiga'];

    // Seller details
    const sellerName = l.dealerDetails?.name || l.seller || l.contact?.name || 'Porsche Center Ljubljana';
    const sellerMonogram = sellerName.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() || 'AH';
    const sellerAddress = l.dealerDetails?.address || (l.location?.city ? `${l.location.city}, Slovenija` : 'Bravničarjeva ulica 5, 1000 Ljubljana');
    const sellerHours = l.dealerDetails?.hours || 'Pon–pet 08:00–18:00<br>Sobota 08:00–13:00';

    // Views stats
    const viewStats = getListingViewStats(l);

    // TCO breakdown figures
    const monthlyTotal = Math.round(currentPrice * 0.0195) || 3703;
    const depVal = Math.round(monthlyTotal * 0.62);
    const fuelCostVal = Math.round(monthlyTotal * 0.21);
    const insVal = Math.round(monthlyTotal * 0.09);
    const maintVal = monthlyTotal - depVal - fuelCostVal - insVal;

    // Gallery thumbnails
    const thumbsHtml = allImages.slice(0, 6).map((img, i) => `
        <div class="lp-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
            <img src="${escHtml(img)}" alt="Foto ${i + 1}" loading="lazy">
            ${i === 5 && allImages.length > 6 ? `<span class="lp-thumb-more">+${allImages.length - 6}</span>` : ''}
        </div>
    `).join('');

    // Full page DOM
    page.innerHTML = `
        ${SVG_DEFS}

        <div class="lp-container">

            <!-- Breadcrumbs -->
            <nav class="lp-breadcrumb" aria-label="Pot">
                <a href="#/">Domov</a>
                <svg class="i" style="width:14px;height:14px"><use href="#i-right"></use></svg>
                <a href="#/oglasi?cat=${encodeURIComponent(l.category || 'avto')}">Avtomobili</a>
                ${make ? `
                    <svg class="i" style="width:14px;height:14px"><use href="#i-right"></use></svg>
                    <a href="#/oglasi?make=${encodeURIComponent(make)}">${escHtml(make)}</a>
                ` : ''}
                ${model ? `
                    <svg class="i" style="width:14px;height:14px"><use href="#i-right"></use></svg>
                    <span class="lp-bc-current">${escHtml(model)} ${escHtml(variant)}</span>
                ` : ''}
                <a class="pill ah-back-to-results" href="#/oglasi">
                    <svg class="i" style="width:15px;height:15px"><use href="#i-left"></use></svg>Nazaj na rezultate
                </a>
            </nav>

            <!-- Two-column flex layout -->
            <div class="lp-layout">

                <!-- ════════ LEFT COLUMN ════════ -->
                <div class="lp-main">

                    <!-- Gallery -->
                    <section class="lp-gallery" aria-label="Galerija" id="pregled">
                        <div class="lp-gallery-main">
                            <img id="galleryMainImg" src="${escHtml(firstImg)}" alt="${escHtml(brandTitle)}">
                            <span class="lp-condition-badge">${conditionLabel}</span>
                            <button class="lp-gallery-nav prev" id="gallPrev" aria-label="Prejšnja fotografija">
                                <svg class="i"><use href="#i-left"></use></svg>
                            </button>
                            <button class="lp-gallery-nav next" id="gallNext" aria-label="Naslednja fotografija">
                                <svg class="i"><use href="#i-right"></use></svg>
                            </button>
                            <div class="seg lp-view-toggle" style="position:absolute;left:20px;bottom:20px">
                                <button type="button" class="lp-view-btn on active" data-view="exterior">Zunanjost</button>
                                <button type="button" class="lp-view-btn" data-view="interior">Notranjost</button>
                            </div>
                            <div class="lp-gallery-ctrls">
                                <span class="num lp-gallery-counter" id="gallCounter">
                                    <svg class="i" style="width:15px;height:15px"><use href="#i-camera"></use></svg>
                                    1 / ${allImages.length}
                                </span>
                                <button type="button" class="ibtn lp-gallery-fullscreen" id="gallFullscreen" aria-label="Celozaslonski prikaz">
                                    <svg class="i" style="width:16px;height:16px"><use href="#i-expand"></use></svg>
                                </button>
                            </div>
                        </div>
                        <div id="gallThumbs" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(112px,100%),1fr));gap:12px;margin-top:14px">
                            ${thumbsHtml}
                        </div>
                    </section>

                    <!-- In-page floating glass tabs -->
                    <nav class="glass ah-detail-tabs" aria-label="Hitri skoki">
                        <a href="#pregled" class="tab on">Pregled</a>
                        <a href="#podatki" class="tab">Podatki</a>
                        <a href="#ocena-cene" class="tab">Ocena cene</a>
                        <a href="#oprema" class="tab">Oprema</a>
                        <a href="#stroski" class="tab">Stroški</a>
                        <a href="#prodajalec" class="tab">Prodajalec</a>
                    </nav>

                    <!-- Ključni podatki card -->
                    <section id="podatki" data-tab-panel="podatki" class="card lp-section lp-key-specs-box" style="padding:8px" aria-label="Tehnični podatki">
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px 6px">
                            <h2 class="h3">Ključni podatki</h2>
                            <button type="button" id="toggleAllSpecsBtn" style="background:transparent;border:0;cursor:pointer;font-size:13px;font-weight:700;color:#1d4ed8;display:inline-flex;align-items:center;gap:6px">
                                <span>Vse specifikacije</span>
                                <svg class="i" style="width:15px;height:15px;transition:transform .2s"><use href="#i-right"></use></svg>
                            </button>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr))">
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-gauge"></use></svg></span><div><div class="k">Prevoženi km</div><div class="v num">${kmVal}</div></div></div>
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-zap"></use></svg></span><div><div class="k">Moč motorja</div><div class="v num">${kwVal} kW (${hpVal} KM)</div></div></div>
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-fuel"></use></svg></span><div><div class="k">Gorivo</div><div class="v">${escHtml(fuelVal)}</div></div></div>
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-cal"></use></svg></span><div><div class="k">Prva registracija</div><div class="v num">${escHtml(regVal)}</div></div></div>
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-gear"></use></svg></span><div><div class="k">Menjalnik</div><div class="v">${escHtml(gearVal)}</div></div></div>
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-cog"></use></svg></span><div><div class="k">Oblika motorja</div><div class="v">${escHtml(engineShapeVal)}</div></div></div>
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-usercheck"></use></svg></span><div><div class="k">Prejšnji lastniki</div><div class="v">${escHtml(ownersVal)}</div></div></div>
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-wheel"></use></svg></span><div><div class="k">Pogon</div><div class="v">${escHtml(driveVal)}</div></div></div>
                            <div class="fact"><span class="ic"><svg class="i" style="width:22px;height:22px"><use href="#i-box"></use></svg></span><div><div class="k">Prostornina</div><div class="v num">${escHtml(displacementVal)}</div></div></div>
                        </div>

                        <!-- Expandable accordion for full specifications -->
                        <div id="allSpecsContainer" class="adv-accordion" style="display:none;margin:12px 14px 14px;border-radius:20px;padding:20px;background:rgba(12,27,48,.03)">
                            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;font-size:14px">
                                <div><strong style="display:block;font-size:12px;color:#5a6b83">Kategorija:</strong> ${escHtml(l.category || 'Osebni avtomobil')}</div>
                                <div><strong style="display:block;font-size:12px;color:#5a6b83">Oblika karoserije:</strong> ${escHtml(l.bodyType || 'Kupe')}</div>
                                <div><strong style="display:block;font-size:12px;color:#5a6b83">Barva:</strong> ${escHtml(l.color || 'Bela')}</div>
                                <div><strong style="display:block;font-size:12px;color:#5a6b83">Število vrat:</strong> ${l.doors || '2'}</div>
                                <div><strong style="display:block;font-size:12px;color:#5a6b83">Število sedežev:</strong> ${l.seats || '2'}</div>
                                <div><strong style="display:block;font-size:12px;color:#5a6b83">Emisijski razred:</strong> ${escHtml(l.emissionClass || 'Euro 6d')}</div>
                                <div><strong style="display:block;font-size:12px;color:#5a6b83">VIN številka:</strong> ${escHtml(l.vin || 'Na voljo ob povpraševanju')}</div>
                                <div><strong style="display:block;font-size:12px;color:#5a6b83">Poreklo:</strong> ${escHtml(l.origin || 'Slovensko poreklo')}</div>
                            </div>
                        </div>
                    </section>

                    <!-- Two-card row: Ocena cene & Cena skozi čas -->
                    <div id="ocena-cene" data-tab-panel="ocena-cene" style="display:flex;flex-wrap:wrap;gap:24px">

                        <!-- Card 1: Ocena cene -->
                        <section class="card ah-price-assessment" style="flex:1 1 380px;padding:26px 26px 24px;display:flex;flex-direction:column;gap:18px" aria-label="Ocena cene">
                            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                                <div>
                                    <h2 class="h3">Ocena cene</h2>
                                    <p style="font-size:13px;color:#5a6b83;margin-top:4px">Primerjava s ${rating?.comparablesCount || 14} podobnimi oglasi (${escHtml(brandTitle)}, 2021–2024)</p>
                                </div>
                                <span style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:9999px;background:${valBadgeBg};color:${valBadgeColor};font-size:12px;font-weight:700;white-space:nowrap">${valBadge}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:4px;color:#2563eb" aria-label="Ocena 5 od 5">
                                <svg class="i" style="width:22px;height:22px;fill:currentColor"><use href="#i-star"></use></svg>
                                <svg class="i" style="width:22px;height:22px;fill:currentColor"><use href="#i-star"></use></svg>
                                <svg class="i" style="width:22px;height:22px;fill:currentColor"><use href="#i-star"></use></svg>
                                <svg class="i" style="width:22px;height:22px;fill:currentColor"><use href="#i-star"></use></svg>
                                <svg class="i" style="width:22px;height:22px;fill:currentColor"><use href="#i-star"></use></svg>
                                <span class="d" style="color:inherit;font-weight:800;margin-left:8px;font-size:15px">5,0 / 5</span>
                            </div>
                            <div style="position:relative;padding-top:30px">
                                <div style="position:absolute;left:${markerPercent}%;top:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center">
                                    <span style="background:#0b1f3f;color:#fff;border-radius:9999px;padding:4px 12px;font-size:12px;font-weight:700;white-space:nowrap">Ta oglas</span>
                                </div>
                                <div style="display:flex;align-items:flex-end;gap:3px;height:112px;border-bottom:1px solid #d5e0ee" aria-hidden="true">
                                    ${histogramBars}
                                </div>
                                <div style="position:absolute;left:60%;top:20px;bottom:0;border-left:2px dashed #7d8fab"></div>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:12px;color:#5a6b83" class="num">
                                <span>${fmtMin}</span>
                                <span style="font-weight:700;color:inherit;margin-left:12%">Mediana ${fmtMedian}</span>
                                <span>${fmtMax}</span>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:10px;padding-top:6px;border-top:1px solid rgba(12,27,48,.08)">
                                <div style="display:flex;align-items:center;gap:12px;font-size:13px">
                                    <span style="width:150px;color:#5a6b83">Cena</span>
                                    <div style="flex:1;height:8px;border-radius:9999px;background:#e8eef6;overflow:hidden">
                                        <div style="width:92%;height:100%;background:#0f766e"></div>
                                    </div>
                                    <span class="num" style="width:36px;text-align:right;font-weight:700">92</span>
                                </div>
                                <div style="display:flex;align-items:center;gap:12px;font-size:13px">
                                    <span style="width:150px;color:#5a6b83">Redkost opreme</span>
                                    <div style="flex:1;height:8px;border-radius:9999px;background:#e8eef6;overflow:hidden">
                                        <div style="width:84%;height:100%;background:#0f766e"></div>
                                    </div>
                                    <span class="num" style="width:36px;text-align:right;font-weight:700">84</span>
                                </div>
                            </div>
                            <div id="lpRatingBlock" style="display:none;"></div>
                        </section>

                        <!-- Card 2: Cena skozi čas -->
                        <section class="card" style="flex:1 1 380px;padding:26px 26px 24px;display:flex;flex-direction:column;gap:18px" aria-label="Cena skozi čas">
                            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                                <div>
                                    <h2 class="h3">Cena skozi čas</h2>
                                    <p style="font-size:13px;color:#5a6b83;margin-top:4px">Objavljeno 14. sep. · znižano 7. okt.</p>
                                </div>
                                <span class="num" style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:9999px;background:#e6eefc;color:#1d4ed8;font-size:12px;font-weight:700;white-space:nowrap">
                                    <svg class="i" style="width:14px;height:14px"><use href="#i-trend"></use></svg>
                                    ${hasDiscount ? `−${new Intl.NumberFormat('sl-SI').format(originalPrice - currentPrice)} €` : '−26.000 €'}
                                </span>
                            </div>
                            <svg viewBox="0 0 420 200" role="img" aria-label="Graf cene: ${origPriceFormatted} do 7. oktobra, nato ${priceFormatted}" style="width:100%;height:auto;display:block;overflow:visible">
                                <defs>
                                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0" stop-color="#2563eb" stop-opacity=".22"></stop>
                                        <stop offset="1" stop-color="#2563eb" stop-opacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                <g stroke="currentColor" stroke-opacity="0.1" stroke-width="1">
                                    <path d="M20 40H400M20 90H400M20 140H400"></path>
                                </g>
                                <path d="M20 52H316L324 124H400V170H20Z" fill="url(#pg)"></path>
                                <path d="M20 52H316L324 124H400" fill="none" stroke="#2563eb" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></path>
                                <circle cx="20" cy="52" r="5" fill="#fff" stroke="#2563eb" stroke-width="3"></circle>
                                <circle cx="400" cy="124" r="6" fill="#0b1f3f" stroke="#fff" stroke-width="3"></circle>
                                <text x="20" y="36" font-size="13" font-weight="700" fill="currentColor" font-family="Manrope,Inter,sans-serif">${origPriceFormatted}</text>
                                <text x="400" y="108" font-size="13" font-weight="800" fill="currentColor" text-anchor="end" font-family="Manrope,Inter,sans-serif">${priceFormatted}</text>
                                <g font-size="12" fill="#5a6b83" font-family="Inter,sans-serif">
                                    <text x="20" y="194">14. sep.</text>
                                    <text x="190" y="194" text-anchor="middle">26. sep.</text>
                                    <text x="400" y="194" text-anchor="end">Danes</text>
                                </g>
                            </svg>
                            <div style="display:flex;flex-direction:column;gap:10px;padding-top:6px;border-top:1px solid rgba(12,27,48,.08);font-size:13px">
                                <div style="display:flex;align-items:center;gap:10px">
                                    <svg class="i" style="width:16px;height:16px;color:#2563eb"><use href="#i-bell"></use></svg>
                                    <span>Obvestimo vas ob vsakem nadaljnjem padcu cene.</span>
                                    <button type="button" class="pill" id="btnPriceAlert" style="height:34px;margin-left:auto;font-size:13px;padding:0 14px">Vklopi</button>
                                </div>
                            </div>
                        </section>

                    </div>

                    <!-- Oprema card -->
                    <section id="oprema" data-tab-panel="oprema" class="card lp-section" style="padding:26px 26px 28px;display:flex;flex-direction:column;gap:20px" aria-label="Oprema">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
                            <h2 class="h3">Oprema</h2>
                            <span style="font-size:13px;color:#5a6b83">23 standardnih postavk in 3 dodatne</span>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:6px">
                            <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#5a6b83">DODATNO PRI TEM VOZILU</div>
                            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
                                ${customEq.map(eq => `<span class="eq x"><svg class="i"><use href="#i-star"></use></svg>${escHtml(eq)}</span>`).join('')}
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:24px">
                            <div>
                                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#5a6b83;margin-bottom:10px">VARNOST</div>
                                <div style="display:flex;flex-wrap:wrap;gap:8px">
                                    ${safetyEq.map(eq => `<span class="eq"><svg class="i"><use href="#i-check"></use></svg>${escHtml(eq)}</span>`).join('')}
                                </div>
                            </div>
                            <div>
                                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#5a6b83;margin-bottom:10px">LUČI IN POMOČ</div>
                                <div style="display:flex;flex-wrap:wrap;gap:8px">
                                    ${lightsEq.map(eq => `<span class="eq"><svg class="i"><use href="#i-check"></use></svg>${escHtml(eq)}</span>`).join('')}
                                </div>
                            </div>
                            <div>
                                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#5a6b83;margin-bottom:10px">UDOBJE</div>
                                <div style="display:flex;flex-wrap:wrap;gap:8px">
                                    ${comfortEq.map(eq => `<span class="eq"><svg class="i"><use href="#i-check"></use></svg>${escHtml(eq)}</span>`).join('')}
                                </div>
                            </div>
                            <div>
                                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#5a6b83;margin-bottom:10px">MULTIMEDIJA</div>
                                <div style="display:flex;flex-wrap:wrap;gap:8px">
                                    ${mediaEq.map(eq => `<span class="eq"><svg class="i"><use href="#i-check"></use></svg>${escHtml(eq)}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Realni mesečni strošek (TCO) card -->
                    <div id="stroski" data-tab-panel="stroski" class="card lp-section" style="padding:24px 26px;display:flex;flex-direction:column;gap:16px">
                        <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#5a6b83">REALNI MESEČNI STROŠEK</div>
                        <div style="display:flex;align-items:baseline;gap:8px">
                            <span class="d num" style="font-size:36px;font-weight:800;letter-spacing:-.02em">~ ${new Intl.NumberFormat('sl-SI').format(monthlyTotal)} €</span>
                            <span style="font-size:13px;color:#5a6b83">ocena lastništva na mesec</span>
                        </div>
                        <div style="display:flex;height:12px;border-radius:9999px;overflow:hidden;gap:2px" role="img" aria-label="Razčlenitev stroškov: izguba vrednosti 62 %, gorivo 21 %, zavarovanje 9 %, ostalo 8 %">
                            <div style="width:62%;background:#0b1f3f"></div>
                            <div style="width:21%;background:#2563eb"></div>
                            <div style="width:9%;background:#7aa2f0"></div>
                            <div style="width:8%;background:#c3d4f3"></div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:9px;font-size:13px">
                            <div style="display:flex;align-items:center;gap:10px">
                                <span style="width:10px;height:10px;border-radius:3px;background:#0b1f3f;flex:none"></span>
                                <span>Izguba vrednosti</span>
                                <span class="num" style="margin-left:auto;font-weight:700">${new Intl.NumberFormat('sl-SI').format(depVal)} €</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:10px">
                                <span style="width:10px;height:10px;border-radius:3px;background:#2563eb;flex:none"></span>
                                <span>Gorivo</span>
                                <span class="num" style="margin-left:auto;font-weight:700">${new Intl.NumberFormat('sl-SI').format(fuelCostVal)} €</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:10px">
                                <span style="width:10px;height:10px;border-radius:3px;background:#7aa2f0;flex:none"></span>
                                <span>Zavarovanje</span>
                                <span class="num" style="margin-left:auto;font-weight:700">${new Intl.NumberFormat('sl-SI').format(insVal)} €</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:10px">
                                <span style="width:10px;height:10px;border-radius:3px;background:#c3d4f3;flex:none"></span>
                                <span>Servis, pnevmatike, davki</span>
                                <span class="num" style="margin-left:auto;font-weight:700">${new Intl.NumberFormat('sl-SI').format(maintVal)} €</span>
                            </div>
                        </div>
                        <button type="button" class="pill" id="btnAdjustTco" style="height:42px;font-size:13px;width:100%">Prilagodi izračun</button>
                        <div id="react-cost-panel-root" style="display:none;margin-top:12px;"></div>
                    </div>

                    <!-- Prodajalec Card -->
                    <div id="prodajalec" data-tab-panel="prodajalec" class="card lp-seller-section">
                        <div style="display:flex;align-items:center;gap:14px">
                            <span class="d lp-seller-avatar">${escHtml(sellerMonogram)}</span>
                            <div>
                                <div class="d" style="font-weight:800;font-size:17px;line-height:1.2">${escHtml(sellerName)}</div>
                                <span style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;font-size:12px;font-weight:700;color:#1d4ed8">
                                    <svg class="i" style="width:15px;height:15px"><use href="#i-verified"></use></svg>
                                    Preverjena avtohiša
                                </span>
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:10px;font-size:14px;color:#5a6b83">
                            <div style="display:flex;gap:10px;align-items:flex-start">
                                <svg class="i" style="width:16px;height:16px;margin-top:2px;color:currentColor"><use href="#i-pin"></use></svg>
                                <span>${escHtml(sellerAddress)}</span>
                            </div>
                            <div style="display:flex;gap:10px;align-items:flex-start">
                                <svg class="i" style="width:16px;height:16px;margin-top:2px;color:currentColor"><use href="#i-clock"></use></svg>
                                <span>${sellerHours}</span>
                            </div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px">
                            <span class="sp"><svg class="i"><use href="#i-wrench"></use></svg>Pooblaščeni serviser</span>
                            <span class="sp"><svg class="i"><use href="#i-banknote"></use></svg>Leasing</span>
                            <span class="sp"><svg class="i"><use href="#i-shield"></use></svg>${escHtml(make || 'AutoHub')} Approved</span>
                            <span class="sp"><svg class="i"><use href="#i-repeat"></use></svg>Staro za novo</span>
                        </div>
                        <a href="#/oglasi?seller=${encodeURIComponent(sellerName)}" class="pill" style="height:46px;width:100%;box-sizing:border-box">
                            Vsi oglasi prodajalca<svg class="i" style="width:15px;height:15px"><use href="#i-right"></use></svg>
                        </a>
                        <a href="#" id="lpReportBtn" style="display:inline-flex;align-items:center;gap:6px;align-self:center;font-size:13px;color:#5a6b83">
                            <svg class="i" style="width:14px;height:14px"><use href="#i-flag"></use></svg>Prijavi oglas
                        </a>
                    </div>

                    <!-- Opis prodajalca card -->
                    <section class="card lp-section" data-tab-panel="podatki" style="padding:26px 26px 28px" aria-label="Opis prodajalca">
                        <h2 class="h3">Opis prodajalca</h2>
                        <div style="font-size:16px;line-height:1.65;color:inherit;margin-top:12px;max-width:680px;text-wrap:pretty;opacity:.92">
                            ${l.description ? escHtml(l.description).replace(/\n/g, '<br>') : 'Vrhunsko stanje, brez praske. Prvi lastnik, SLO poreklo.'}
                        </div>
                    </section>

                    <!-- Service history (populated async if VIN exists) -->
                    <div id="service-history-container" data-tab-panel="podatki" style="display:none;"></div>

                    <!-- Podobni oglasi -->
                    <section class="lp-similar" aria-label="Podobni oglasi">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                            <h2 class="h3">Podobni oglasi</h2>
                            <a href="#/oglasi?cat=${encodeURIComponent(l.category || 'avto')}" style="font-size:13px;font-weight:700;color:#1d4ed8;display:inline-flex;align-items:center;gap:6px">
                                Vsi podobni<svg class="i" style="width:15px;height:15px"><use href="#i-right"></use></svg>
                            </a>
                        </div>
                        <div id="similarGrid" class="lp-similar-grid">
                            <p style="color:#94a3b8;font-size:0.85rem;">Nalaganje podobnih oglasov...</p>
                        </div>
                    </section>

                </div>

                <!-- ════════ RIGHT COLUMN (STICKY SIDEBAR) ════════ -->
                <aside class="lp-sidebar" aria-label="Cena in prodajalec">

                    <!-- Summary card wrapping title & price/actions -->
                    <div class="ah-listing-summary" aria-label="Pregled oglasa">

                        <!-- Brand gradient title banner -->
                        <div class="lp-title-card" style="background:linear-gradient(90deg,rgba(${brandRgb},.28) 0%,rgba(${brandRgb},.04) 100%);border:1px solid rgba(${brandRgb},.35);box-shadow:0 12px 32px -18px rgba(${brandRgb},.35)">
                            <div>
                                <h1 class="d lp-title">${escHtml(brandTitle)}</h1>
                                <div class="lp-subtitle">${escHtml(variant || 'GT3 PDK')}</div>
                                <div class="lp-title-meta">${escHtml(metaText)}</div>
                            </div>
                            ${brandLogo ? `<img class="lp-title-card-logo" src="${escHtml(brandLogo)}" alt="${escHtml(make)}">` : ''}
                        </div>

                        <!-- Price block & Actions -->
                        <div class="lp-header-price">
                            <div>
                                <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap">
                                    <span class="d num lp-price">${priceFormatted}</span>
                                    ${hasDiscount ? `<span class="num lp-original-price">${origPriceFormatted}</span>` : ''}
                                </div>
                                <span class="lp-discount-pct" style="margin-top:12px">
                                    <svg class="i" style="width:14px;height:14px"><use href="#i-trend"></use></svg>
                                    ${hasDiscount ? `−${discountPct} % · ${valBadge}` : valBadge}
                                </span>
                            </div>

                            <!-- 3-color gauge track -->
                            <div style="display:flex;flex-direction:column;gap:8px">
                                <div class="ah-gauge-track">
                                    <span class="ah-gauge-knob" style="left:${gaugePos}%"></span>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:#5a6b83">
                                    <span>Ugodno</span>
                                    <span>Tržna cena</span>
                                    <span>Drago</span>
                                </div>
                            </div>

                            <!-- CTAs -->
                            <div class="ah-summary-contact">
                                ${phone ? `<a href="tel:${cleanPhone}" class="btn-cta ah-cta"><svg class="i"><use href="#i-phone"></use></svg>Pokliči: ${escHtml(phone)}</a>` : ''}
                                ${email ? `<a href="mailto:${encodeURIComponent(email)}" class="btn-blue ah-pill"><svg class="i"><use href="#i-msg"></use></svg>Pošlji sporočilo</a>` : ''}
                                <button type="button" class="pill" id="btnBookViewing" style="height:50px"><svg class="i"><use href="#i-cal"></use></svg>Rezerviraj ogled</button>
                            </div>

                            <!-- Secondary actions -->
                            <div class="lp-action-row lp-sidebar-actions">
                                <button type="button" class="pill lp-action-btn lp-fav-btn" id="lpFavBtn" data-listing-id="${l.id}" style="flex:1.4;padding:0 12px" title="Shrani v mapo">
                                    <svg class="i"><use href="#i-heart"></use></svg>
                                    <span>Shrani v mapo</span>
                                    <svg class="i lp-fav-chevron" style="width:15px;height:15px"><use href="#i-down"></use></svg>
                                </button>
                                <button type="button" class="pill lp-action-btn lp-compare-btn" id="lpCompareBtn" data-listing-id="${l.id}" style="flex:1;padding:0 12px" title="Primerjaj">
                                    <svg class="i"><use href="#i-scale"></use></svg>
                                    <span>Primerjaj</span>
                                </button>
                                <button type="button" class="ibtn" id="lpShareBtn" aria-label="Deli oglas" title="Deli oglas">
                                    <svg class="i"><use href="#i-share"></use></svg>
                                </button>
                            </div>

                            <!-- Auction compatibility slot -->
                            <div class="lp-price-card" style="display:none;"></div>
                            <div id="lpServiceBadge"></div>
                        </div>

                    </div>

                    <!-- Ogled oglasa stats card -->
                    <div class="card lp-views-card">
                        <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.08em;color:#5a6b83">
                            <svg class="i" style="width:16px;height:16px"><use href="#i-eye"></use></svg>OGLED OGLASA
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
                            <div class="lp-view-stat">
                                <div class="d num lp-view-num">${viewStats.today}</div>
                                <div class="lp-view-label">Danes</div>
                            </div>
                            <div class="lp-view-stat">
                                <div class="d num lp-view-num">${viewStats.week}</div>
                                <div class="lp-view-label">Ta teden</div>
                            </div>
                            <div class="lp-view-stat">
                                <div class="d num lp-view-num">${viewStats.total}</div>
                                <div class="lp-view-label">Skupaj</div>
                            </div>
                        </div>
                    </div>

                </aside>

            </div>

        </div>
    `;

    // In-page tabs: "Pregled" shows every panel, any other tab shows only its own panel (no auto-scroll)
    const tabsNav = page.querySelector('.ah-detail-tabs');
    if (tabsNav) {
        const tabLinks = tabsNav.querySelectorAll('.tab');
        const panels = page.querySelectorAll('.lp-main > [data-tab-panel], .lp-main .lp-similar');
        const showTab = (tabId) => {
            tabLinks.forEach(a => {
                const on = a.getAttribute('href') === `#${tabId}`;
                a.classList.toggle('on', on);
                a.classList.toggle('is-active', on);
            });
            panels.forEach(el => {
                const names = (el.dataset.tabPanel || '').split(' ');
                const visible = tabId === 'pregled' || names.includes(tabId);
                el.classList.toggle('ah-tab-hidden', !visible);
            });
        };
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showTab(link.getAttribute('href')?.replace('#', '') || 'pregled');
            });
        });
        showTab('pregled');
    }

    // Bind Expandable specifications accordion
    const toggleSpecsBtn = page.querySelector('#toggleAllSpecsBtn');
    const specsContainer = page.querySelector('#allSpecsContainer');
    if (toggleSpecsBtn && specsContainer) {
        toggleSpecsBtn.addEventListener('click', () => {
            const isOpen = specsContainer.style.display !== 'none';
            specsContainer.style.display = isOpen ? 'none' : 'block';
            toggleSpecsBtn.querySelector('span').textContent = isOpen ? 'Vse specifikacije' : 'Manj specifikacij';
            const chevron = toggleSpecsBtn.querySelector('svg');
            if (chevron) chevron.style.transform = isOpen ? 'none' : 'rotate(90deg)';
        });
    }

    // Bind Price alert button
    const btnPriceAlert = page.querySelector('#btnPriceAlert');
    if (btnPriceAlert) {
        btnPriceAlert.addEventListener('click', () => {
            const isSubscribed = btnPriceAlert.classList.toggle('active');
            if (isSubscribed) {
                btnPriceAlert.textContent = 'Vklopljeno ✓';
                btnPriceAlert.style.background = '#e6eefc';
                btnPriceAlert.style.color = '#1d4ed8';
            } else {
                btnPriceAlert.textContent = 'Vklopi';
                btnPriceAlert.style.background = '';
                btnPriceAlert.style.color = '';
            }
        });
    }

    // Bind Message CTA to openSellerContact
    const mailLink = page.querySelector('.ah-summary-contact [href^="mailto:"]');
    if (mailLink) {
        mailLink.addEventListener('click', (e) => {
            e.preventDefault();
            openSellerContact(l);
        });
    }

    // Bind Book Viewing CTA
    const btnBookViewing = page.querySelector('#btnBookViewing');
    if (btnBookViewing) {
        btnBookViewing.addEventListener('click', () => {
            openSellerContact(l, 'Pozdravljeni, želim se dogovoriti za termin za ogled vozila.');
        });
    }

    // Bind Share button
    const btnShare = page.querySelector('#lpShareBtn');
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            const url = window.location.href;
            if (navigator.share) {
                try {
                    await navigator.share({ title: brandTitle, url });
                    return;
                } catch { /* cancelled / fallback */ }
            }
            try {
                await navigator.clipboard.writeText(url);
                btnShare.style.borderColor = '#10b981';
                setTimeout(() => { btnShare.style.borderColor = ''; }, 2000);
            } catch { /* ignore */ }
        });
    }

    // Bind Adjust TCO toggle
    const btnAdjustTco = page.querySelector('#btnAdjustTco');
    const costPanelRoot = page.querySelector('#react-cost-panel-root');
    if (btnAdjustTco && costPanelRoot) {
        btnAdjustTco.addEventListener('click', () => {
            const isHidden = costPanelRoot.style.display === 'none';
            costPanelRoot.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                costPanelRoot.querySelector('.cost-panel__collapsed')?.click();
                costPanelRoot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Favourite button: chevron opens the folder picker; saving a new favourite also offers a folder
    const favBtn = page.querySelector('#lpFavBtn');
    if (favBtn) {
        let wasActive = false;
        favBtn.addEventListener('click', (e) => {
            const viaChevron = Boolean(e.target.closest?.('.lp-fav-chevron'));
            wasActive = favBtn.classList.contains('active');
            if (viaChevron) {
                e.stopImmediatePropagation();
                import('./collectionUi.js').then(m => m.openFolderPickerForListing(l));
                return;
            }
            if (!wasActive) {
                setTimeout(() => {
                    if (favBtn.classList.contains('active')) {
                        import('./collectionUi.js').then(m => m.openFolderPickerForListing(l));
                    }
                }, 350);
            }
        }, true);
    }

    // Load similar listings
    loadAutoHubSimilar(l, allListings);

    // Initial layout sync
    syncAutoHubListingLayout(page);
}

/**
 * Responsive layout sync: moves .ah-listing-summary below gallery on mobile (<600px)
 * and returns it to .lp-sidebar on desktop/tablet.
 */
export function syncAutoHubListingLayout(page) {
    const summary = page.querySelector('.ah-listing-summary');
    const sidebar = page.querySelector('.lp-sidebar');
    const tabs = page.querySelector('.ah-detail-tabs');
    if (!summary || !sidebar) return;

    if (window.innerWidth < 600) {
        const gallery = page.querySelector('.lp-gallery');
        if (gallery && summary.previousElementSibling !== gallery) {
            gallery.after(summary);
        }
        if (tabs && summary.nextElementSibling !== tabs) {
            summary.after(tabs);
        }
    } else if (summary.parentElement !== sidebar) {
        sidebar.prepend(summary);
    }
}

/**
 * Backwards compatible adapter
 */
export function enhanceAutoHubListing(page, listing, allListings = []) {
    renderAutoHubListing(page, listing, allListings);
}

/**
 * Updates price assessment section when rating is resolved
 */
export function renderAutoHubPriceAssessment(page, rating) {
    if (!rating) return;
    const badge = page.querySelector('.ah-price-assessment [style*="border-radius:9999px"]');
    if (badge && rating.label) badge.textContent = rating.label;
}

/**
 * Similar listings card renderer for AutoHub
 */
export async function loadAutoHubSimilar(current, allListings = []) {
    const grid = document.getElementById('similarGrid');
    if (!grid) return;

    try {
        let all = Array.isArray(allListings) && allListings.length > 0 ? allListings : null;
        if (!all) {
            const { getListings } = await import('../../services/listingService.js');
            all = await getListings().catch(() => []);
        }

        const currentPrice = Number(current.salePriceEur || current.priceEur || current.priceRaw || current.price || 0);
        const similar = all.filter(l =>
            l.id !== current.id &&
            (!l.status || l.status === 'active') &&
            (l.make === current.make || l.category === current.category)
        ).slice(0, 3);

        if (similar.length === 0) {
            grid.innerHTML = '<p style="color:#94a3b8;font-size:0.85rem;">Ni primerljivih oglasov.</p>';
            return;
        }

        grid.innerHTML = similar.map(l => {
            const img = l.images?.exterior?.[0] || (Array.isArray(l.images) ? l.images[0] : null) || 'brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg';
            const priceVal = Number(l.salePriceEur || l.priceEur || l.priceRaw || l.price || 0);
            const priceFormatted = new Intl.NumberFormat('sl-SI').format(priceVal) + ' €';
            const diff = priceVal - currentPrice;
            const diffSign = diff < 0 ? '−' : '+';
            const diffColor = diff < 0 ? '#0f766e' : '#4a5b73';
            const diffText = diff === 0 ? 'Enaka cena' : `${diffSign}${new Intl.NumberFormat('sl-SI').format(Math.abs(diff))} € od tega oglasa`;
            const title = `${l.make || ''} ${l.model || ''} ${l.variant || ''}`.trim();
            const km = l.mileageKm != null ? `${new Intl.NumberFormat('sl-SI').format(l.mileageKm)} km` : (l.mileage || '');
            const power = l.powerKw ? `${l.powerKw} kW` : (l.power ? `${l.power} kW` : '');
            const meta = [l.year, km, power].filter(Boolean).join(' · ');

            return `
            <article class="card lp-similar-card">
                <a href="#/oglas?id=${l.id}" style="text-decoration:none;color:inherit;display:block;">
                    <div style="aspect-ratio:16/10;background:#0c1b30;overflow:hidden">
                        <img src="${escHtml(img)}" alt="${escHtml(title)}" style="width:100%;height:100%;object-fit:cover;display:block">
                    </div>
                    <div style="padding:16px 18px 18px;display:flex;flex-direction:column;gap:6px">
                        <div class="d" style="font-weight:800;font-size:17px">${escHtml(title)}</div>
                        <div style="font-size:13px;color:#5a6b83">${escHtml(meta)}</div>
                        <div style="display:flex;align-items:baseline;gap:10px;margin-top:6px">
                            <span class="d num" style="font-weight:800;font-size:20px">${priceFormatted}</span>
                            <span class="num" style="font-size:13px;font-weight:700;color:${diffColor}">${diffText}</span>
                        </div>
                    </div>
                </a>
            </article>`;
        }).join('');
    } catch (err) {
        console.warn('[loadAutoHubSimilar] Error:', err);
    }
}
