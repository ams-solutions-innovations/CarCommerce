import { escHtml } from '../../utils/escHtml.js';
import { getBrandLogo } from '../../data/brandLogos.js';
import { getBrandRgb } from '../../data/brandColors.js';
import { getCurrentLang, t } from '../../core/i18n.js';
import { key as lsKey } from '../../config/storageKeys.js';
import {
    getChargingDetails,
    isElectricVehicle,
    isElectrifiedVehicle,
    isPlugInHybrid,
    kwToHp,
    formatDisplacement,
    getCardDisplayPrefs,
    deriveCarEngineLayout,
    deriveCarOwnersLabel,
    deriveCarBatteryHealth
} from '../../utils/listingUtils.js';
import { icon } from './icons.js';

const fmt = value => new Intl.NumberFormat('sl-SI').format(value);
const price = value => `${fmt(value)} €`;

const visAttr = (prefs, fieldKey) => {
    const visible = Boolean(prefs[fieldKey]);
    return `data-card-field="${fieldKey}"${visible ? '' : ' hidden style="display:none"'}`;
};

const spec = (glyph, text, prefs, fieldKey, extraCls = '', extraAttrs = '') =>
    `<span class="ah-spec${extraCls ? ' ' + extraCls : ''}" ${visAttr(prefs, fieldKey)}${extraAttrs ? ' ' + extraAttrs : ''}>${icon(glyph)}${escHtml(text)}</span>`;

export function listingDisplayPrice(car) {
    const original=Number(car.priceEur||car.priceRaw||(typeof car.price==='number'?car.price:0));
    const sale=Number(car.salePriceEur);
    return sale>0&&sale<original?sale:original;
}

// Retain the existing delegated card/gallery/favourite/compare event contract.
export function renderAutoHubListingCard(car, { images, inCompare, favourite, rating, auctionBadges = '', auction }) {
    const prefs = getCardDisplayPrefs();
    const id = escHtml(String(car.id));
    const originalPrice = Number(car.priceEur || car.priceRaw || (typeof car.price === 'number' ? car.price : 0));
    const salePrice = Number(car.salePriceEur);
    const discounted = salePrice > 0 && salePrice < originalPrice;
    const displayPrice = discounted ? salePrice : originalPrice;
    const mileage = car.mileageKm ?? car.mileage;
    const mileageText = typeof mileage === 'number' ? `${fmt(mileage)} km` : (mileage || '—');
    const fuel = ({Petrol: t('fuel_petrol','Bencin'), Diesel: t('fuel_diesel','Dizel'), Electric: t('fuel_electric','Elektrika'), Hybrid: t('fuel_hybrid','Hibrid')})[car.fuel] || car.fuel || '';
    const logo = getBrandLogo(car.make || car.brand);
    const location = typeof car.location === 'object' ? car.location?.city || car.location?.region || '' : car.location || '';
    const seller = typeof car.seller === 'object' ? car.seller?.name || car.seller?.companyName || '' : car.seller || '';
    const ratingColor = rating?.stars >= 4 ? '#0f766e' : rating?.stars <= 2 ? '#c2410c' : '#475569';
    const marker = rating?.stars >= 4 ? '22%' : rating?.stars <= 2 ? '78%' : '49%';
    const title = [car.make || car.brand, car.model].filter(Boolean).join(' ') || car.title;
    const isAuction = !!auction || car.entryType === 'auction';
    const electrified = isElectrifiedVehicle(car);
    const electric = isElectricVehicle(car);
    const phev = isPlugInHybrid(car);
    const charging = getChargingDetails(car);
    const ends = auction?.endsAt || car.endsAt;
    const detailHref = `/${isAuction ? 'drazba' : 'oglas'}?id=${encodeURIComponent(car.id)}`;

    // Consumption values (Combined, City, Highway)
    const consCombRaw = Number(car.fuelL100kmCombined || car.fuelL100km);
    const hasComb = !electric && !isNaN(consCombRaw) && consCombRaw > 0;
    const consCityRaw = Number(car.fuelL100kmCity || (hasComb ? (consCombRaw * 1.18).toFixed(1) : 0));
    const consHwyRaw = Number(car.fuelL100kmHighway || (hasComb ? Math.max(0.8, consCombRaw * 0.85).toFixed(1) : 0));

    // Additional optional fields
    const ownersText = deriveCarOwnersLabel(car);
    const engineLayoutText = deriveCarEngineLayout(car);
    const driveText = car.driveType || '';
    const batteryHealthText = deriveCarBatteryHealth(car);
    const dispUnit = localStorage.getItem(lsKey('displacement_unit')) || 'cc';
    const dispText = car.engineCc ? formatDisplacement(car.engineCc, dispUnit, getCurrentLang()) : '';

    return `<article class="listing-card ah-listing-card" data-car-id="${id}">
        <div class="card-gallery-wrapper ah-card-photo">
            <div class="card-gallery-scroll">${images.map((src,index) => `<img src="${escHtml(src)}" alt="${escHtml(car.title || title)}${index ? ` — ${index + 1}` : ''}" loading="lazy" decoding="async">`).join('')}</div>
            ${discounted ? `<span class="ah-photo-badge">−${Math.round((1-salePrice/originalPrice)*100)} %</span>` : car.isNew ? `<span class="ah-photo-badge ah-badge-blue">${t('badge_new','NOVO')}</span>` : ''}
            ${images.length > 1 ? `<button type="button" class="card-gallery-arrow card-gallery-prev ah-gallery-prev" aria-label="${t('gallery_prev','Prejšnja slika')}">${icon('right')}</button><button type="button" class="card-gallery-arrow card-gallery-next" aria-label="${t('gallery_next','Naslednja slika')}">${icon('right')}</button><div class="card-gallery-dots">${images.map((_,i)=>`<span class="card-gallery-dot ${i ? '' : 'active'}" data-dot-idx="${i}"></span>`).join('')}</div>` : ''}
            <span class="ah-photo-count">${icon('camera')}1 / ${car.imgCount || images.length}</span>
            ${isAuction ? `<span class="drazba-card-timer" data-ends="${ends ? new Date(ends).getTime() : ''}">—</span>${auction?.bidCount > 0 ? `<span class="drazba-card-live">${t('auction_live_badge','● V ŽIVO')}</span>` : ''}` : ''}
            ${logo ? `<span class="ah-photo-brand" style="--brand-rgb:${getBrandRgb(car.make || car.brand)}"><img src="${escHtml(logo)}" alt="${escHtml(car.make || '')}"><span class="ah-photo-brand-name">${escHtml(car.make || car.brand || '')}</span></span>` : ''}
        </div>
        <div class="ah-card-content">
            <div class="ah-card-heading"><div><h2><a href="${detailHref}">${escHtml(title)}</a></h2><p class="ah-card-subtitle">${escHtml(car.variant || car.subtitle || (car.powerKw ? `${car.powerKw} kW` : ''))}</p></div>${logo ? `<img class="ah-card-brand" src="${escHtml(logo)}" alt="">` : ''}</div>
            <div class="ah-card-price"><strong>${displayPrice ? price(displayPrice) : escHtml(car.price || t('price_on_request','Cena po dogovoru'))}</strong>${discounted ? `<del>${price(originalPrice)}</del>` : ''}</div>
            ${rating ? `<div class="ah-card-rating" ${visAttr(prefs, 'fairPrice')} style="--ah-rating-color:${ratingColor};--ah-rating-position:${marker}${prefs.fairPrice ? '' : ';display:none'}"><span>${escHtml(rating.label)}</span><div class="ah-rating-track"><i></i></div></div>` : ''}
            ${auctionBadges}
            <div class="ah-card-specs">${
                spec('calendar', car.year || '—', prefs, 'year')
            }${
                spec('gauge', mileageText, prefs, 'mileage')
            }${
                fuel ? spec(electric ? 'bolt' : 'fuel', fuel, prefs, 'fuel') : ''
            }${
                !electrified && car.transmission ? spec('gear', car.transmission, prefs, 'transmission') : ''
            }${
                car.powerKw ? `<span class="ah-spec power-pill" ${visAttr(prefs, 'power')} data-kw="${Number(car.powerKw)}" data-hp="${kwToHp(car.powerKw)}">${icon('gauge')}<span class="power-val">${Number(car.powerKw)} kW</span></span>` : ''
            }${
                car.engineCc ? `<span class="ah-spec displacement-pill" ${visAttr(prefs, 'displacement')} data-cc="${Number(car.engineCc)}">${icon('engine')}<span class="displacement-val">${escHtml(dispText)}</span></span>` : ''
            }${
                electric && charging.rangeKm ? spec('batteryCharge', `${t('ah_range','Domet')} ${charging.rangeKm} km`, prefs, 'range') : ''
            }${
                phev && charging.rangeKm ? spec('batteryCharge', `${t('ah_electric_range','El. domet')} ${charging.rangeKm} km`, prefs, 'phevRange') : ''
            }${
                electrified && batteryHealthText ? spec('batteryHeart', `Baterija ${batteryHealthText}`, prefs, 'batteryHealth') : ''
            }${
                electrified && (charging.dcKw || charging.acKw) ? `<span class="ah-spec">${icon('plug')}${escHtml(`${charging.dcKw ? `DC ${charging.dcKw}` : `AC ${charging.acKw}`} kW`)}</span>` : ''
            }${
                electrified && charging.timeMinutes ? `<span class="ah-spec">${icon('timer')}${escHtml(`${charging.timeMinutes} min`)}</span>` : ''
            }${
                hasComb ? spec('drop', `${consCombRaw.toFixed(1)} L/100 km`, prefs, 'consumptionCombined') : ''
            }${
                hasComb && consCityRaw > 0 ? spec('drop', `Mesto ${consCityRaw.toFixed(1)} L`, prefs, 'consumptionCity') : ''
            }${
                hasComb && consHwyRaw > 0 ? spec('drop', `AC ${consHwyRaw.toFixed(1)} L`, prefs, 'consumptionHighway') : ''
            }${
                ownersText ? spec('user', ownersText, prefs, 'owners') : ''
            }${
                engineLayoutText ? spec('engine', engineLayoutText, prefs, 'engineType') : ''
            }${
                driveText ? spec('drive', driveText, prefs, 'driveType') : ''
            }</div>
            <div class="ah-card-seller"><span class="ah-seller-name">${icon('building')}${escHtml(seller || t('private_seller','Zasebni prodajalec'))}</span>${location ? `<span class="ah-seller-location">${icon('pin')}${escHtml(location)}</span>` : ''}</div>
            <div class="ah-card-quick-actions"><button type="button" class="listing-fav-btn ah-list-heart ${favourite ? 'active' : ''}" data-car-id="${id}" aria-label="${t('save_favorite','Shrani med priljubljene')}">${icon('heart')}<span class="ah-qa-label">${t('ah_save_short','Shrani')}</span></button><button type="button" class="listing-compare-btn ${inCompare ? 'active' : ''}" data-car-id="${id}" aria-label="${t('compare_btn','Primerjaj')}">${icon('scale')}<span class="ah-qa-label">${t('compare_btn','Primerjaj')}</span></button><button type="button" class="contact-btn ah-contact-button" data-car-id="${id}" aria-label="${t('contact_seller','Kontaktiraj prodajalca')}">${icon('phone')}<span class="ah-qa-label">${t('ah_contact_short','Kontakt')}</span></button></div>
        </div>
    </article>`;
}
