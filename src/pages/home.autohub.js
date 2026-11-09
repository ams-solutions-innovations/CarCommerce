import { t, getCurrentLang } from '../core/i18n.js';
import { escHtml } from '../utils/escHtml.js';
import { createCustomSelect } from '../utils/customSelect.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { brandsFileFor } from '../data/brandFiles.js';
import { popularBrandsFor, getBrandCount } from '../data/popularBrands.js';
import { COUNTRIES, getRegions } from '../data/locationData.js';
import { getListings } from '../services/listingService.js';
import { getSiteSettings } from '../services/adminService.js';
import { recentVehicles, clearRecentVehicles } from '../services/vehicleWorkspaceService.js';
import { renderCarCard, bindCardEvents } from './oglasi.js';
import { navigateTo } from '../router.js';
import { key as lsKey } from '../config/storageKeys.js';
import { icon, brandAsset, AUTOHUB_HERO } from '../components/autohub/icons.js';

let dispose;
const money = value => new Intl.NumberFormat('sl-SI').format(value);

export async function initAutoHubHomePage() {
    dispose?.();
    const host = document.getElementById('autoHubHome');
    if (!host) return;
    const controller = new AbortController();
    const options = { signal: controller.signal };
    dispose = () => {
        delete window.__setHomeSearchMode;
        delete window.__currentHomeSearchMode;
        controller.abort();
    };
    document.addEventListener('beforeRouteChange',dispose,{once:true,signal:controller.signal});
    const text = (key, fallback) => escHtml(t(key,fallback));
    const field = (id,key,fallback,first) => `<div class="ah-field" data-home-field="${id}"><label for="${id}">${text(key,fallback)}</label><div class="pill-select-wrapper"><select class="pill-input" id="${id}"><option value="">${first}</option></select></div></div>`;
    const categories = [['avto','car','cat_cars','Avtomobili'],['motor','bike','cat_moto','Motorna kolesa'],['gospodarska','truck','cat_commercial','Gospodarska vozila'],['prosti-cas','tent','cat_recreation','Prosti čas']];
    const vehicleTypes = [
        ['Limuzina','ah_sedans','Limuzine','dac15b24c64a4c96063768274c2416d1.svg'],
        ['Karavan','ah_estates','Karavani','f651b91c8ef360202df783be6b03eeb5.svg'],
        ['SUV','ah_suv','SUV','a2007272c1633d9ea61164607b88d5de.svg'],
        ['Kombilimuzina','ah_hatchbacks','Hatchback','9ce576494b3d76568df65f7beeb3c9e2.svg'],
        ['Coupe','ah_coupes','Kupe','066a949bc40bb4da4ac61cfbaf7c6a78.svg'],
        ['Kabriolet','ah_convertibles','Kabrio','b27642fd338841fdb35c6a672c5be70f.svg'],
        ['Enoprostorec','ah_mpvs','Enoprostorci','2aa77b38835e0b66283e034412bbe85d.svg'],
        ['Pick-up','ah_pickups','Pickup','69ddafb159e04009fb0057af0f6ab012.svg'],
    ];
    const features = [['/drazbe','gavel','ah_auctions_title','Dražbe','ah_auctions_copy','Licitirajte v živo in spremljajte preostali čas.','ah_auctions_link','Oglej si dražbe'],['/avtohise','building','nav_dealers','Avtohiše','ah_dealers_copy','Saloni, servisi in vulkanizerji na zemljevidu z ocenami.','ah_dealers_link','Odpri zemljevid'],['/gume-in-deli','disc','header_tires_parts','Gume in deli','ah_parts_copy','Pnevmatike, deli in oprema za vaše vozilo.','ah_parts_link','Poišči po vozilu'],['/primerjava','scale','ah_compare_title','Primerjava','ah_compare_copy','Primerjajte oglase, opremo in realni mesečni strošek.','ah_compare_link','Odpri primerjavo']];
    host.innerHTML = `<section class="ah-home-hero ah-container">
        <div class="ah-hero"><div class="ah-hero-background" id="homeHeroBackground" style="background-image:url('${brandAsset(AUTOHUB_HERO)}')" aria-hidden="true"></div><div class="ah-hero-shade"></div>
            <div class="ah-hero-copy"><span class="ah-hero-trust">${icon('verified')}${text('ah_price_promise','Ocena poštene cene pri vsakem oglasu')}</span><h1>${getCurrentLang() === 'en' ? 'Let your next <span>car</span> find you.' : 'Naj te najde tvoj naslednji <span>avto</span>'}</h1><p>${text('ah_hero_description','Primerjajte cene, realni mesečni strošek lastništva in zgodovino vozila na enem mestu.')}</p></div>
            <a class="ah-hero-sponsored" id="ahHeroSponsored" hidden></a>
        </div>
    </section>
    <section class="ah-home-search ah-container" aria-label="${text('header_listings','Iskanje vozil')}"><form id="homeSearchForm" class="ah-search-card">
        <div class="ah-search-tabs">
            <div class="ah-mobile-search-mode-wrap">
                <select id="homeSearchModeSelect" class="pill-input" aria-label="${text('ah_search_mode','Način iskanja')}" data-no-search="true" data-sheet-title="${text('ah_search_mode','Način iskanja')}">
                    <option value="oglasi" data-icon="newspaper" selected>${text('search_mode_listings','Oglasi')}</option>
                    <option value="drazbe" data-icon="gavel">${text('search_mode_auctions','Dražbe')}</option>
                    <option value="najem" data-icon="calendar">${text('search_mode_rentals','Najem')}</option>
                </select>
            </div>
            <div class="ah-mobile-category-wrap">
                <select id="homeCategorySelect" class="pill-input" aria-label="${text('ah_vehicle_type','Vrsta vozila')}" data-no-search="true" data-icon-only="true" data-sheet-title="${text('ah_vehicle_type','Vrsta vozila')}">
                    ${categories.map(([cat,glyph,key,fallback],i)=>`<option value="${cat}" data-icon="${glyph}" ${i ? '' : 'selected'}>${text(key,fallback)}</option>`).join('')}
                </select>
            </div>
            <div class="ah-segment ah-category-tabs" role="group" aria-label="${text('ah_vehicle_type','Vrsta vozila')}">${categories.map(([category,glyph,key,fallback],i)=>`<button type="button" class="tab-btn ${i ? '' : 'active'}" data-category="${category}" aria-pressed="${!i}" title="${text(key,fallback)}" aria-label="${text(key,fallback)}">${icon(glyph)}<span class="ah-cat-label">${text(key,fallback)}</span></button>`).join('')}</div>
            <div class="ah-segment ah-search-mode-desktop" id="homeSearchMode" role="group" aria-label="${text('ah_search_mode','Način iskanja')}"><button type="button" class="active" data-search-mode="oglasi" aria-pressed="true">${icon('search')}${text('search_mode_listings','Išči oglase')}</button><button type="button" data-search-mode="drazbe" aria-pressed="false">${icon('gavel')}${text('search_mode_auctions','Išči dražbe')}</button><button type="button" data-search-mode="najem" aria-pressed="false">${icon('calendar')}${text('search_mode_rentals','Najem')}</button></div>
        </div>
        <div class="ah-search-grid">
            ${field('home-make','form_make','Znamka',text('all_brands','Vse znamke'))}
            ${field('home-model','form_model','Model',text('all_models','Vsi modeli'))}
            <div class="ah-field" id="group-home-price"><label for="home-price-to" id="home-price-to-label">${text('form_price_to','Cena do')}</label><input type="text" id="home-price-to" class="pill-input js-format-number" inputmode="numeric" placeholder="${text('no_limit','Brez omejitve')}"></div>
            ${field('home-reg-from','form_year_from','Letnik od',text('all_years','Vsi'))}
            <div class="ah-field" id="group-home-mileage" data-home-field="home-mileage-to"><label for="home-mileage-to">${text('form_mileage_to','Prevoženi km do')}</label><div class="pill-select-wrapper"><select class="pill-input" id="home-mileage-to"><option value="">${text('unlimited_mileage','Neomejeno')}</option></select></div></div>
            <div class="ah-field" id="group-home-auction-type" data-home-field="home-auction-type" style="display:none;"><label for="home-auction-type">Vrsta dražbe</label><div class="pill-select-wrapper"><select class="pill-input" id="home-auction-type"><option value="">Vse vrste dražb</option><option value="live">🔴 Živa dražba</option><option value="prebid">⏱ Pred-dražba</option><option value="silent">🔒 Tiha dražba</option></select></div></div>
            <div class="ah-field" id="group-home-rental-duration" data-home-field="home-rental-duration" style="display:none;"><label for="home-rental-duration">Koliko časa (trajanje)</label><div class="pill-select-wrapper"><select class="pill-input" id="home-rental-duration"><option value="">Katerokoli trajanje</option><option value="1-3">1 - 3 dni</option><option value="weekend">Konec tedna</option><option value="week">1 teden</option><option value="2-3weeks">2 - 3 tedne</option><option value="month">1 mesec ali več</option></select></div></div>
        </div>
        <div class="ah-search-bottom">
            ${field('home-country','cl_label_country','Država',text('cl_sel_country','Vse države'))}
            ${field('home-region','cl_label_region','Regija',text('cl_sel_region','Vse regije'))}
            <div class="ah-search-actions"><button type="reset" class="ah-pill">${icon('reset')}${text('sidebar_reset','Ponastavi')}</button><a id="homeAdvancedSearchLink" href="/iskanje?cat=avto" class="ah-pill">${icon('sliders')}${text('filter_more','Več filtrov')}</a><button type="submit" class="ah-cta">${icon('search')}<span id="offer-count-text">${text('ah_show_listings','Prikaži oglase')}</span></button></div>
        </div>
        <div class="ah-quick-searches"><a class="ah-chip" href="/oglasi?cat=avto&fuel=Electric">${text('ah_electric','Električna vozila')}</a><a class="ah-chip" href="/iskanje?cat=avto&bodyType=SUV">SUV</a><a class="ah-chip" href="/oglasi?cat=avto&priceTo=10000">${text('ah_under_10k','Do 10.000 €')}</a><a class="ah-chip" href="/najem">${icon('calendar')}${text('nav_rentals','Najem vozil')}</a><a class="ah-chip" href="/drazbe">${icon('gavel')}${text('ah_auctions_title','Dražbe')}</a><a class="ah-chip" href="/primerjava">${icon('scale')}${text('ah_compare_title','Primerjava')}</a></div>
    </form></section>
    <section class="ah-recent-section ah-mobile-recent ah-container" id="ahRecentSection" hidden>
        <div class="ah-section-heading ah-recent-heading">
            <div class="ah-recent-title-group">
                <h2>${text('recently_viewed_title','Nazadnje ogledano')}</h2>
                <button type="button" class="ah-recent-clear-btn" id="ahRecentClear" title="${text('vp_clear_history','Počisti zgodovino')}" aria-label="${text('vp_clear_history','Počisti zgodovino')}">${icon('trash')}</button>
            </div>
            <div class="ah-recent-controls">
                <div class="ah-recent-arrows">
                    <button type="button" class="ah-icon-button" id="ahRecentPrev" aria-label="${text('gallery_prev','Nazaj')}">${icon('right','ah-detail-prev')}</button>
                    <button type="button" class="ah-icon-button" id="ahRecentNext" aria-label="${text('gallery_next','Naprej')}">${icon('right')}</button>
                </div>
            </div>
        </div>
        <div class="ah-recent-track-wrapper">
            <div id="ahRecentList" class="ah-recent-track ah-mobile-recent-list" aria-live="polite"></div>
        </div>
    </section>
    <section class="ah-vehicle-section ah-container"><div class="ah-section-heading"><div><h2>${text('ah_vehicle_shapes','Poiščite po vrsti vozila')}</h2><p>${text('ah_vehicle_shapes_copy','Izberite obliko, ki ustreza vašemu življenju.')}</p></div><a href="/iskanje" class="ah-pill">${text('ah_all_categories','Vse kategorije')}${icon('arrow')}</a></div><div class="ah-vehicle-grid">${vehicleTypes.map(([type,key,fallback,file])=>`<a href="/oglasi?cat=avto&bodyType=${encodeURIComponent(type)}" class="ah-vehicle-tile"><div><img src="${brandAsset(file)}" alt="" loading="lazy"></div><strong>${text(key,fallback)}</strong></a>`).join('')}</div></section>
    <section class="ah-container ah-home-listings">
        <div class="ah-section-heading">
            <h2>${text('ah_recommended','Izbrano za vas')}</h2>
            <div class="ah-recommend-controls">
                <div class="ah-segment ah-recommend-desktop" role="group" aria-label="${text('ah_listing_selection','Izbor oglasov')}">${[['all','ah_for_you','Za vas'],['discount','ah_price_drops','Padci cen'],['today','ah_new_today','Novo danes'],['nearby','ah_nearby','V bližini']].map(([mode,key,fallback],i)=>`<button type="button" class="${i ? '' : 'active'}" data-recommend-mode="${mode}" aria-pressed="${!i}">${text(key,fallback)}</button>`).join('')}</div>
                <button type="button" class="ah-recommend-trigger" id="ahRecommendTrigger" aria-haspopup="dialog" aria-expanded="false"><span id="ahRecommendTriggerText">${text('ah_for_you','Za vas')}</span>${icon('down')}</button>
                <div class="ah-recommend-arrows"><button type="button" class="ah-icon-button" id="ahRecommendPrev" aria-label="${text('gallery_prev','Nazaj')}">${icon('right','ah-detail-prev')}</button><button type="button" class="ah-icon-button" id="ahRecommendNext" aria-label="${text('gallery_next','Naprej')}">${icon('right')}</button></div>
            </div>
        </div>
        <dialog class="ah-bottom-sheet" id="ahRecommendSheet" aria-labelledby="ahRecommendSheetTitle">
            <div class="ah-bottom-sheet-handle" aria-hidden="true"></div>
            <div class="ah-bottom-sheet-heading"><h2 id="ahRecommendSheetTitle">${text('ah_recommended','Izbrano za vas')}</h2><button type="button" class="ah-icon-button" id="ahRecommendSheetClose" aria-label="${text('close','Zapri')}">${icon('close')}</button></div>
            <div class="ah-bottom-sheet-options">
                ${[['all','spark','ah_for_you','Za vas'],['discount','tag','ah_price_drops','Padci cen'],['today','calendar','ah_new_today','Novo danes'],['nearby','pin','ah_nearby','V bližini']].map(([mode,glyph,key,fallback],i)=>`<button type="button" class="ah-bottom-sheet-choice ${i ? '' : 'active'}" data-recommend-choice="${mode}">${icon(glyph)}<span>${text(key,fallback)}</span>${icon('check')}</button>`).join('')}
            </div>
        </dialog>
        <div id="ahHomeListings" class="ah-home-card-grid" aria-live="polite"><p class="ah-empty">${text('loading','Nalaganje …')}</p></div>
    </section>
    <section class="ah-container ah-home-features"><h2>${text('ah_more_than_listings','Več kot samo oglasi')}</h2><div class="ah-feature-layout"><div class="ah-valuation"><span class="ah-valuation-label">${icon('calculator')}${text('ah_valuation','Vrednotenje vozila')}</span><h3>${text('ah_valuation_title','Koliko je vaš avto zares vreden?')}</h3><p>${text('ah_valuation_copy','Ocena temelji na primerljivih oglasih in redkosti opreme, brez ugibanja.')}</p><div class="ah-histogram" aria-hidden="true">${[12,18,26,36,50,66,84,102,118,126,120,104,86,68,52,38,28,20,14,10].map((height,i)=>`<i style="height:${height}px" class="${i >= 8 && i <= 10 ? 'is-highlight' : ''}"></i>`).join('')}</div><a href="/oceni-vrednost" class="ah-cta">${text('ah_evaluate_link','Ocenite vrednost vozila')}${icon('arrow')}</a></div><div class="ah-feature-grid">${features.map(([href,glyph,key,title,copyKey,copy,linkKey,link])=>`<a href="${href}" class="ah-feature-card"><span class="ah-feature-icon">${icon(glyph)}</span><h3>${text(key,title)}</h3><p>${text(copyKey,copy)}</p><span class="ah-feature-link">${text(linkKey,link)}${icon('arrow')}</span></a>`).join('')}</div></div></section>`;
    host.setAttribute('aria-busy','false');

    let category = 'avto';
    let searchMode = 'oglasi';
    let catalog = {};
    let listings = [];
    let recommendMode = 'all';
    let recommendOffset = 0;
    let brandGeneration = 0;
    const select = id => host.querySelector(`#${id}`);
    const make = select('home-make');
    const model = select('home-model');
    const country = select('home-country');
    const region = select('home-region');
    model.disabled = true;
    region.disabled = true;
    const addOption = (el,value,label,properties) => { const option = new Option(label,value); Object.assign(option.dataset,properties); el.add(option); };
    const year = select('home-reg-from');
    for (let y = new Date().getFullYear(); y >= 1980; y--) addOption(year,y,y);
    [10000,25000,50000,75000,100000,150000,200000,250000,300000].forEach(km=>addOption(select('home-mileage-to'),km,`${money(km)} km`));
    COUNTRIES.forEach(c=>addOption(country,c.code,c.label));
    const populateRegions = () => {
        region.length = 1;
        region.value = '';
        region.disabled = !country.value;
        getRegions(country.value).forEach(value=>addOption(region,value,value));
    };
    country.value = localStorage.getItem(lsKey('filterCountry')) || '';
    populateRegions();
    region.value = localStorage.getItem(lsKey('filterRegion')) || '';
    host.querySelectorAll('select').forEach(el=>createCustomSelect(el));
    const priceInput = select('home-price-to');
    setupNumericFormatter(priceInput);
    if (priceInput) {
        const syncPriceValue = () => priceInput.classList.toggle('has-value', Boolean(priceInput.value.trim()));
        priceInput.addEventListener('input', syncPriceValue);
        priceInput.addEventListener('change', syncPriceValue);
    }

    async function loadBrands() {
        const generation = ++brandGeneration;
        try {
            const response = await fetch(brandsFileFor(category),options);
            if (!response.ok) throw new Error('Brand catalogue unavailable');
            const data = await response.json();
            if (controller.signal.aborted || generation !== brandGeneration) return;
            catalog = data;
            make.length = 1;
            make.value = '';
            model.length = 1;
            model.disabled = true;
            const popular = popularBrandsFor(category).filter(name=>data[name]);
            if (popular.length) {
                const heading = new Option(t('ah_popular_brands','Priljubljene znamke'),'');
                heading.disabled = true; heading.dataset.popularLabel = 'true'; make.add(heading);
                popular.forEach(name=>addOption(make,name,name,{popular:'true'}));
            }
            Object.keys(data).sort().forEach(name=>{ if (!popular.includes(name)) addOption(make,name,name); });
        } catch (error) { if (error.name !== 'AbortError') console.warn('[AutoHub] Brand catalogue:',error); }
    }
    let recentTickerRaf = null;
    let recentResumeTimer = null;
    let recentTrackAbort = null;

    function stopRecentTicker() {
        if (recentTickerRaf) {
            cancelAnimationFrame(recentTickerRaf);
            recentTickerRaf = null;
        }
        if (recentResumeTimer) {
            clearTimeout(recentResumeTimer);
            recentResumeTimer = null;
        }
        if (recentTrackAbort) {
            recentTrackAbort.abort();
            recentTrackAbort = null;
        }
    }
    controller.signal.addEventListener('abort', stopRecentTicker);

    function renderRecent() {
        stopRecentTicker();
        const section = select('ahRecentSection') || host.querySelector('.ah-mobile-recent');
        if (!section) return;
        const recent = recentVehicles().slice(0, 10);
        if (!recent.length) {
            section.hidden = true;
            return;
        }
        const byId = new Map(listings.map(car => [String(car.id), car]));
        const cars = recent.map(item => byId.get(String(item.id)) || item);
        const listEl = select('ahRecentList') || section.querySelector('.ah-mobile-recent-list');
        if (!listEl) return;

        // Infinite circular loop: duplicate cards 3 times so there is always a buffer
        // before and after the visible set, enabling seamless infinite scroll in both directions.
        const setCount = 3;
        const loopedCars = [];
        for (let i = 0; i < setCount; i++) {
            loopedCars.push(...cars);
        }

        listEl.innerHTML = loopedCars.map(car => renderCarCard(car)).join('');
        section.hidden = false;
        bindCardEvents(listEl, loopedCars);

        const n = cars.length;
        const measureSetWidth = () => {
            const children = listEl.children;
            if (children.length > n && children[n] && children[0]) {
                const diff = children[n].offsetLeft - children[0].offsetLeft;
                if (diff > 0) return diff;
            }
            return 0;
        };

        let singleSetWidth = measureSetWidth();
        let currentScroll = listEl.scrollLeft;
        let isInteracting = false;
        let lastTimestamp = 0;
        const PIXELS_PER_SECOND = 26; // gentle, readable continuous speed

        // Center on the middle set initially so backwards and forwards swiping both work infinitely
        const initScrollPos = () => {
            singleSetWidth = measureSetWidth();
            if (singleSetWidth > 0 && listEl.scrollLeft < singleSetWidth * 0.2) {
                listEl.scrollLeft = singleSetWidth;
                currentScroll = listEl.scrollLeft;
            }
        };
        requestAnimationFrame(initScrollPos);

        const checkWrap = () => {
            if (singleSetWidth <= 0) singleSetWidth = measureSetWidth();
            if (singleSetWidth <= 0) return;
            // Seamless wrap: shifting by exactly one set width is 100% invisible because sets are identical
            if (listEl.scrollLeft >= singleSetWidth * 2) {
                listEl.scrollLeft -= singleSetWidth;
                currentScroll = listEl.scrollLeft;
            } else if (listEl.scrollLeft < singleSetWidth * 0.5) {
                listEl.scrollLeft += singleSetWidth;
                currentScroll = listEl.scrollLeft;
            }
        };

        const pause = (delay = 2400) => {
            isInteracting = true;
            currentScroll = listEl.scrollLeft;
            if (recentResumeTimer) clearTimeout(recentResumeTimer);
            recentResumeTimer = setTimeout(() => {
                isInteracting = false;
                currentScroll = listEl.scrollLeft;
                lastTimestamp = 0;
            }, delay);
        };

        // Swipe-proof touch and pointer listeners:
        // Pauses immediately on any touch or drag, lets native momentum scroll happen,
        // and safely wraps around seamlessly without any hitch.
        recentTrackAbort = new AbortController();
        const trackSignal = recentTrackAbort.signal;

        listEl.addEventListener('scroll', () => {
            checkWrap();
            if (isInteracting) {
                currentScroll = listEl.scrollLeft;
                pause(2400);
            }
        }, { passive: true, signal: trackSignal });

        listEl.addEventListener('touchstart', () => pause(2600), { passive: true, signal: trackSignal });
        listEl.addEventListener('touchmove', () => pause(2600), { passive: true, signal: trackSignal });
        listEl.addEventListener('touchend', () => pause(2200), { passive: true, signal: trackSignal });
        listEl.addEventListener('touchcancel', () => pause(2200), { passive: true, signal: trackSignal });

        listEl.addEventListener('pointerdown', () => pause(2600), { passive: true, signal: trackSignal });
        listEl.addEventListener('pointerup', () => pause(2200), { passive: true, signal: trackSignal });
        listEl.addEventListener('mouseenter', () => {
            isInteracting = true;
            if (recentResumeTimer) clearTimeout(recentResumeTimer);
        }, { passive: true, signal: trackSignal });
        listEl.addEventListener('mouseleave', () => {
            if (recentResumeTimer) clearTimeout(recentResumeTimer);
            recentResumeTimer = setTimeout(() => {
                isInteracting = false;
                currentScroll = listEl.scrollLeft;
                lastTimestamp = 0;
            }, 150);
        }, { passive: true, signal: trackSignal });

        window.addEventListener('resize', () => {
            singleSetWidth = measureSetWidth();
            currentScroll = listEl.scrollLeft;
        }, { passive: true, signal: trackSignal });

        const prevBtn = select('ahRecentPrev');
        const nextBtn = select('ahRecentNext');
        if (prevBtn && nextBtn) {
            prevBtn.disabled = false;
            nextBtn.disabled = false;
            prevBtn.onclick = () => {
                pause(3000);
                const step = Math.min(360, (singleSetWidth / n) || 320);
                listEl.scrollBy({ left: -step, behavior: 'smooth' });
            };
            nextBtn.onclick = () => {
                pause(3000);
                const step = Math.min(360, (singleSetWidth / n) || 320);
                listEl.scrollBy({ left: step, behavior: 'smooth' });
            };
        }

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReduced) {
            const tick = timestamp => {
                if (controller.signal.aborted) return;
                if (!lastTimestamp) lastTimestamp = timestamp;
                const delta = (timestamp - lastTimestamp) / 1000;
                lastTimestamp = timestamp;

                if (!isInteracting && document.visibilityState === 'visible') {
                    if (singleSetWidth <= 0) singleSetWidth = measureSetWidth();
                    if (singleSetWidth > 0 && delta > 0 && delta < 0.1) {
                        currentScroll += PIXELS_PER_SECOND * delta;
                        listEl.scrollLeft = Math.round(currentScroll);
                        checkWrap();
                    }
                }
                recentTickerRaf = requestAnimationFrame(tick);
            };
            recentTickerRaf = requestAnimationFrame(tick);
        }
    }
    make.addEventListener('change',() => {
        model.length = 1;
        model.value = '';
        const models = catalog[make.value];
        model.disabled = !models;
        (Array.isArray(models) ? models : Object.keys(models || {})).forEach(name=>addOption(model,name,name));
        updateCount();
    },options);
    country.addEventListener('change',() => { populateRegions(); localStorage.setItem(lsKey('filterCountry'),country.value); localStorage.removeItem(lsKey('filterRegion')); },options);
    region.addEventListener('change',()=>localStorage.setItem(lsKey('filterRegion'),region.value),options);
    [country,region].forEach(el=>el.addEventListener('change',()=>{ if (recommendMode === 'nearby') { recommendOffset=0; renderCards(); } },options));
    const matches = listing => {
        const categoryMatch = category === 'motor' ? ['motor','moto'].includes(listing.category) : listing.category === category;
        const price = Number(listing.salePriceEur || listing.priceEur || listing.priceRaw || listing.price);
        const maxPrice = parseFormattedNumber(select('home-price-to').value);
        const compact = window.innerWidth < 1024;
        const maxKm = compact ? 0 : Number(select('home-mileage-to').value);
        const minYear = Number(year.value);
        const location = listing.location;
        return categoryMatch && (!make.value || listing.make === make.value) && (!model.value || listing.model === model.value)
            && (!maxPrice || price <= maxPrice) && (!maxKm || Number(listing.mileageKm) <= maxKm)
            && (!minYear || parseInt(listing.year,10) >= minYear)
            && (compact || !country.value || location?.country === country.value) && (compact || !region.value || location?.region === region.value);
    };
    function updateCount() {
        const brandCount = make.value ? getBrandCount(make.value) : null;
        if (brandCount) {
            select('offer-count-text').textContent = searchMode === 'drazbe' 
                ? `Prikaži ${brandCount} dražb` 
                : (searchMode === 'najem' 
                    ? `Prikaži ${brandCount} ponudb` 
                    : `Prikaži ${brandCount} oglasov`);
        } else {
            select('offer-count-text').textContent = searchMode === 'drazbe' ? t('ah_show_auctions','Prikaži dražbe') : (searchMode === 'najem' ? t('ah_show_rentals','Prikaži najem') : t('ah_show_listings','Prikaži oglase'));
        }
        const count = listings.filter(matches).length;
        select('homeSearchForm').dataset.loadedMatches = String(count);
    }
    const categorySelect = select('homeCategorySelect');
    function setCategory(newCategory) {
        category = newCategory;
        recommendOffset = 0;
        host.querySelectorAll('[data-category]').forEach(other => {
            const active = other.dataset.category === category;
            other.classList.toggle('active', active);
            other.setAttribute('aria-pressed', String(active));
        });
        if (categorySelect && categorySelect.value !== category) {
            categorySelect.value = category;
            categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        select('homeAdvancedSearchLink').href = `${searchMode === 'drazbe' ? '/iskanje-drazbe' : (searchMode === 'najem' ? '/iskanje-najem' : '/iskanje')}?cat=${category === 'motor' ? 'moto' : category}`;
        loadBrands();
        renderCards();
        updateCount();
    }
    host.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
        setCategory(button.dataset.category);
    }, options));
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            if (categorySelect.value !== category) {
                setCategory(categorySelect.value);
            }
        }, options);
    }
    const modeSelect = select('homeSearchModeSelect');
    window.__setHomeSearchMode = setMode;
    function setMode(newMode) {
        searchMode = newMode;
        window.__currentHomeSearchMode = searchMode;
        document.dispatchEvent(new CustomEvent('homeModeChanged', { detail: { mode: searchMode } }));
        host.querySelectorAll('[data-search-mode]').forEach(btn => {
            const active = btn.dataset.searchMode === searchMode;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
        if (modeSelect && modeSelect.value !== searchMode) {
            modeSelect.value = searchMode;
            modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const mileageGroup = select('group-home-mileage');
        const auctionTypeGroup = select('group-home-auction-type');
        const rentalDurationGroup = select('group-home-rental-duration');
        const priceLabel = select('home-price-to-label');
        const priceInput = select('home-price-to');

        if (searchMode === 'drazbe') {
            if (mileageGroup) mileageGroup.style.display = 'none';
            if (auctionTypeGroup) auctionTypeGroup.style.display = '';
            if (rentalDurationGroup) rentalDurationGroup.style.display = 'none';
            if (priceLabel) priceLabel.textContent = 'Cena (do €)';
            if (priceInput) priceInput.placeholder = text('no_limit','Brez omejitve');
        } else if (searchMode === 'najem') {
            if (mileageGroup) mileageGroup.style.display = 'none';
            if (auctionTypeGroup) auctionTypeGroup.style.display = 'none';
            if (rentalDurationGroup) rentalDurationGroup.style.display = '';
            if (priceLabel) priceLabel.textContent = 'Cena na dan (€/dan)';
            if (priceInput) priceInput.placeholder = 'npr. 50 €/dan';
        } else {
            if (mileageGroup) mileageGroup.style.display = '';
            if (auctionTypeGroup) auctionTypeGroup.style.display = 'none';
            if (rentalDurationGroup) rentalDurationGroup.style.display = 'none';
            if (priceLabel) priceLabel.textContent = text('form_price_to','Cena do');
            if (priceInput) priceInput.placeholder = text('no_limit','Brez omejitve');
        }

        select('homeAdvancedSearchLink').href = `${searchMode === 'drazbe' ? '/iskanje-drazbe' : (searchMode === 'najem' ? '/iskanje-najem' : '/iskanje')}?cat=${category === 'motor' ? 'moto' : category}`;
        updateCount();
    }
    host.querySelectorAll('[data-search-mode]').forEach(button=>button.addEventListener('click',()=>{
        setMode(button.dataset.searchMode);
    },options));
    if (modeSelect) {
        modeSelect.addEventListener('change', () => {
            if (modeSelect.value !== searchMode) {
                setMode(modeSelect.value);
            }
        }, options);
    }
    const form = select('homeSearchForm');
    form.addEventListener('input',updateCount,options);
    form.addEventListener('change',updateCount,options);
    form.addEventListener('reset',event=>{
        event.preventDefault();
        [make,model,year,select('home-mileage-to'),country,region].forEach(el=>{ el.value=''; el.dispatchEvent(new Event('change')); });
        const priceEl = select('home-price-to');
        if (priceEl) { priceEl.value = ''; priceEl.classList.remove('has-value'); }
        setMode('oglasi');
        updateCount();
    },options);
    function searchParams() {
        const params = new URLSearchParams({cat:category === 'motor' ? 'moto' : category});
        const values = {make:make.value,model:model.value,yearFrom:year.value};
        if (searchMode === 'drazbe') {
            const at = select('home-auction-type')?.value;
            if (at) values.aucType = at;
            values.priceTo = parseFormattedNumber(select('home-price-to').value);
        } else if (searchMode === 'najem') {
            const rd = select('home-rental-duration')?.value;
            if (rd) values.duration = rd;
            values.priceDay = parseFormattedNumber(select('home-price-to').value);
        } else {
            values.priceTo = parseFormattedNumber(select('home-price-to').value);
            if (window.innerWidth >= 1024) Object.assign(values,{mileageTo:select('home-mileage-to').value});
        }
        if (window.innerWidth >= 1024) Object.assign(values,{country:country.value,region:region.value});
        Object.entries(values).forEach(([key,value])=>{ if (value) params.set(key,value); });
        return params;
    }
    select('homeAdvancedSearchLink').addEventListener('click',event=>{
        event.preventDefault();
        navigateTo(`${searchMode === 'drazbe' ? '/iskanje-drazbe' : (searchMode === 'najem' ? '/iskanje-najem' : '/iskanje')}?${searchParams()}`);
    },options);
    form.addEventListener('submit',event=>{
        event.preventDefault();
        const params = searchParams();
        navigateTo(`${searchMode === 'drazbe' ? '/drazbe' : (searchMode === 'najem' ? '/najem' : '/oglasi')}?${params}`);
    },options);
    function renderCards() {
        let available = listings.filter(l=>category === 'motor' ? ['motor','moto'].includes(l.category) : l.category === category).filter(l=>l.entryType !== 'auction');
        if (recommendMode === 'discount') available = available.filter(l=>l.salePriceEur > 0 && l.salePriceEur < Number(l.priceEur || l.priceRaw || l.price));
        if (recommendMode === 'today') available = available.filter(l=>{
            const created = l.createdAt?.toMillis?.() || (typeof l.createdAt === 'string' ? new Date(l.createdAt).getTime() : l.createdAt) || 0;
            return created > Date.now()-86400000;
        });
        if (recommendMode === 'nearby') available = country.value || region.value ? available.filter(l=>(!country.value || l.location?.country === country.value) && (!region.value || l.location?.region === region.value)) : [];
        const cards = available.slice(recommendOffset,recommendOffset+3);
        const container = select('ahHomeListings');
        container.innerHTML = cards.length ? cards.map(car=>renderCarCard(car)).join('') : `<p class="ah-empty">${recommendMode === 'nearby' && !country.value && !region.value ? text('ah_select_area','V iskalniku izberite državo in regijo za prikaz oglasov v bližini.') : text('no_featured_listings','Trenutno ni oglasov v tej kategoriji.')}</p>`;
        select('ahRecommendPrev').disabled = recommendOffset === 0;
        select('ahRecommendNext').disabled = recommendOffset+3 >= available.length;
        bindCardEvents(container,cards);
    }
    const recommendSheet = select('ahRecommendSheet');
    const recommendTrigger = select('ahRecommendTrigger');
    const recommendClose = select('ahRecommendSheetClose');

    function setRecommendMode(mode) {
        recommendMode = mode;
        recommendOffset = 0;
        host.querySelectorAll('[data-recommend-mode]').forEach(other => {
            const active = other.dataset.recommendMode === mode;
            other.classList.toggle('active', active);
            other.setAttribute('aria-pressed', String(active));
        });
        host.querySelectorAll('[data-recommend-choice]').forEach(other => {
            const active = other.dataset.recommendChoice === mode;
            other.classList.toggle('active', active);
            other.setAttribute('aria-pressed', String(active));
            if (active && select('ahRecommendTriggerText')) {
                select('ahRecommendTriggerText').textContent = other.querySelector('span').textContent;
            }
        });
        renderCards();
    }

    host.querySelectorAll('[data-recommend-mode]').forEach(button => button.addEventListener('click', () => {
        setRecommendMode(button.dataset.recommendMode);
    }, options));

    function closeRecommendSheet() {
        if (!recommendSheet || !recommendSheet.hasAttribute('open') || recommendSheet.classList.contains('closing')) return;
        recommendSheet.classList.add('closing');
        setTimeout(() => {
            recommendSheet.close();
            recommendSheet.classList.remove('closing');
            recommendTrigger?.setAttribute('aria-expanded', 'false');
        }, 260);
    }

    host.querySelectorAll('[data-recommend-choice]').forEach(button => button.addEventListener('click', () => {
        setRecommendMode(button.dataset.recommendChoice);
        closeRecommendSheet();
    }, options));

    if (recommendTrigger && recommendSheet && typeof recommendSheet.showModal === 'function') {
        recommendTrigger.addEventListener('click', () => {
            recommendSheet.classList.remove('closing');
            recommendSheet.showModal();
            recommendTrigger.setAttribute('aria-expanded', 'true');
        }, options);
        if (recommendClose) {
            recommendClose.addEventListener('click', () => closeRecommendSheet(), options);
        }
        recommendSheet.addEventListener('close', () => {
            recommendTrigger.setAttribute('aria-expanded', 'false');
        }, options);
        recommendSheet.addEventListener('click', event => {
            if (event.target === recommendSheet) closeRecommendSheet();
        }, options);
    }
    select('ahRecommendPrev').addEventListener('click',()=>{recommendOffset=Math.max(0,recommendOffset-3);renderCards();},options);
    select('ahRecommendNext').addEventListener('click',()=>{recommendOffset+=3;renderCards();},options);

    const recentClear = select('ahRecentClear');
    if (recentClear) {
        recentClear.addEventListener('click', () => {
            clearRecentVehicles();
            renderRecent();
        }, options);
    }

    loadBrands();
    renderRecent();
    getListings().then(data=>{
        if (controller.signal.aborted) return;
        listings = data;
        renderCards();
        renderRecent();
        updateCount();
        const promoted = listings.find(l=>l.category === 'avto' && (['sponsored','homepage'].includes(l.promotion?.tier) || l.isPremium));
        const sponsored = promoted || listings.find(l=>l.id === 'car-premium-3') || listings.find(l=>l.category === 'avto');
        if (sponsored) {
            const card = select('ahHeroSponsored');
            card.href = `/oglas?id=${encodeURIComponent(sponsored.id)}`;
            card.innerHTML = `<small>${promoted ? text('sponsored_label','SPONZORIRANO') : text('ah_featured_listing','Izbrani oglas')}</small><div><strong>${escHtml(sponsored.title || `${sponsored.make} ${sponsored.model}`)}</strong><span>${escHtml(sponsored.year || '')}${sponsored.mileageKm != null ? ` · ${money(sponsored.mileageKm)} km` : ''}</span><b>${money(sponsored.salePriceEur || sponsored.priceEur || sponsored.priceRaw || 0)} €</b></div>`;
            card.hidden = false;
        }
    }).catch(()=>{ if (!controller.signal.aborted) select('ahHomeListings').innerHTML = `<p class="ah-empty">${text('ah_load_error','Oglasov trenutno ni mogoče naložiti. Poskusite znova.')}</p>`; });
    getSiteSettings().then(settings=>{
        if (controller.signal.aborted || !settings.heroBackgroundUrl) return;
        const image = new URL(settings.heroBackgroundUrl,window.location.href);
        if (['https:','http:'].includes(image.protocol)) select('homeHeroBackground').style.backgroundImage = `url(${JSON.stringify(image.href)})`;
    }).catch(()=>{ /* The original reference image remains available. */ });
}
