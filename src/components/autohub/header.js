import { onAuth, logout } from '../../auth/auth.js';
import { t, getCurrentLang, switchLang } from '../../core/i18n.js';
import { navigateTo } from '../../router.js';
import { escHtml } from '../../utils/escHtml.js';
import { key as lsKey } from '../../config/storageKeys.js';
import { icon, brandAsset, AUTOHUB_LOGO } from './icons.js';
import { businessIcon } from './businessIcons.js';

export function initAutoHubHeader() {
    const host = document.getElementById('header');
    let user = null;
    let bindings;
    const label = (key, fallback) => escHtml(t(key, fallback));
    const flag = language => `<img class="ah-flag" src="${language === 'sl' ? `${import.meta.env.BASE_URL}images/flags/si.svg` : brandAsset('flag-gb.svg')}" alt="">`;
    const menuLink = (href, glyph, text) => `<a href="${href}" class="ah-menu-row">${icon(glyph)}<span>${text}</span></a>`;

    function render() {
        bindings?.abort();
        bindings = new AbortController();
        const options = { signal: bindings.signal };
        const dark = document.body.classList.contains('dark-mode');
        const name = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('my_account', 'Moj račun');
        const shortName = name.split(' ')[0];
        const lang = getCurrentLang();
        const themeRow = `<button type="button" class="ah-menu-row ah-menu-theme-row" id="ahMenuThemeToggle" aria-label="${label('theme_dark', 'Temna tema')}">${icon('moon', 'ah-theme-icon')}<span class="ah-menu-theme-text">${label('theme_dark', 'Temna tema')}</span><span class="ah-theme-switch-indicator ${dark ? 'is-dark' : 'is-light'}" aria-hidden="true"><span class="ah-theme-switch-thumb"></span></span></button>`;
        
        host.innerHTML = `<div class="ah-header-wrap">
            <nav class="ah-nav" aria-label="${label('ah_navigation','Glavna navigacija')}">
                <a href="/" class="ah-logo" aria-label="Carcommerce, ${label('nav_home','Domov')}"><img src="${brandAsset(AUTOHUB_LOGO)}" alt="Carcommerce" width="108" height="36"></a>
                
                <div class="ah-nav-links">
                    <!-- Oglasi dropdown (dražbe + najem as flyouts to the right) -->
                    <div class="ah-menu-anchor" id="ahListingsAnchor">
                        <a href="/oglasi" class="ah-nav-link" id="ahListingsButton" aria-expanded="false" aria-controls="ahListingsMenu">${icon('newspaper')}<span>${label('header_listings','Oglasi')}</span>${icon('down','ah-small')}</a>
                        <div class="ah-popover" id="ahListingsMenu" hidden>
                            ${menuLink('/oglasi','newspaper',label('all_listings','Vsi oglasi'))}
                            ${menuLink('/iskanje','sliders',label('adv_search','Napredno iskanje'))}
                            <div class="ah-menu-divider"></div>
                            ${menuLink('/iskanje?cat=avto','car',label('cat_cars','Avtomobili'))}
                            ${menuLink('/iskanje?cat=moto','bike',label('cat_moto','Motorna kolesa'))}
                            ${menuLink('/iskanje?cat=gospodarska','truck',label('cat_commercial','Gospodarska vozila'))}
                            ${menuLink('/iskanje?cat=prosti-cas','tent',label('cat_recreation','Prosti čas'))}
                            <div class="ah-menu-divider"></div>
                            <div class="ah-submenu-anchor">
                                <button type="button" class="ah-menu-row ah-submenu-trigger" aria-expanded="false">${icon('gavel')}<span>${label('nav_auctions','Dražbe')}</span>${icon('right','ah-small ah-submenu-caret')}</button>
                                <div class="ah-submenu">
                                    ${menuLink('/drazbe','gavel',label('all_auctions','Aktivne dražbe'))}
                                    ${menuLink('/iskanje-drazbe','sliders',label('adv_search_auctions','Napredno iskanje dražb'))}
                                    <div class="ah-menu-divider"></div>
                                    ${menuLink('/drazbe?type=live','radio',label('live_auctions','Žive dražbe'))}
                                    ${menuLink('/drazbe?type=silent','lock',label('silent_auctions','Tihe dražbe'))}
                                </div>
                            </div>
                            <div class="ah-submenu-anchor">
                                <button type="button" class="ah-menu-row ah-submenu-trigger" aria-expanded="false">${icon('key')}<span>${label('nav_rentals_long','Najem vozil')}</span>${icon('right','ah-small ah-submenu-caret')}</button>
                                <div class="ah-submenu">
                                    ${menuLink('/najem','key',label('all_rentals','Vsa vozila za najem'))}
                                    ${menuLink('/iskanje-najem','sliders',label('adv_search_rentals','Napredno iskanje najema'))}
                                    <div class="ah-menu-divider"></div>
                                    ${menuLink('/najem?cat=avto','car',label('cat_cars','Avtomobili'))}
                                    ${menuLink('/najem?cat=potniski-kombi','users',label('cat_vans','Potniški kombiji'))}
                                    ${menuLink('/najem?cat=pocitniska','tent',label('cat_campers','Avtodomi'))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <a href="/avtohise" class="ah-nav-link">${businessIcon('dealer')}${label('nav_dealers','Avtohiše')}</a>
                    <a href="/gume-in-deli" class="ah-nav-link">${icon('disc')}${label('header_tires_parts','Gume in deli')}</a>
                </div>

                <div class="ah-nav-actions">
                    <a href="/" class="ah-icon-button ah-focus-exit" aria-label="${label('close','Zapri')}">${icon('close')}</a>
                    <a href="/primerjava" class="ah-icon-button ah-mobile-compare" aria-label="${label('compare_btn','Primerjava')}">${icon('scale')}<span class="ah-count" id="ahMobileCompareBadge" hidden></span></a>
                    <div class="ah-publish-wrap"><a href="/novi-oglas" class="ah-publish" aria-label="${label('publish_listing','Objavi oglas')}">${icon('plus')}<span>${label('publish_listing','Objavi oglas')}</span></a></div>
                    <div class="ah-menu-anchor">
                        <button type="button" class="ah-account ${user ? 'is-logged-in' : 'is-guest'}" id="ahAccountButton" aria-expanded="false" aria-controls="ahAccountMenu" aria-label="${user ? escHtml(name) : label('login_title','Prijava')}"><span class="ah-avatar ${user ? 'has-avatar' : 'is-guest-avatar'}">${user ? escHtml(shortName.charAt(0).toUpperCase()) : icon('user')}</span><span class="ah-account-name">${user ? escHtml(shortName) : label('login_title','Prijava')}</span>${icon('down','ah-small')}</button>
                        <div class="ah-popover ah-account-menu" id="ahAccountMenu" hidden>
                            ${user ? `<div class="ah-menu-person"><span class="ah-avatar">${escHtml(shortName.charAt(0).toUpperCase())}</span><div><strong>${escHtml(name)}</strong><small>${escHtml(user.email || '')}</small></div></div>
                            ${menuLink('/dashboard','newspaper',label('dashboard_link','Nadzorna plošča'))}
                            ${menuLink('/profil','user',label('my_profile','Moj profil'))}
                            ${menuLink('/mape','folder',label('ah_my_folders','Moje mape'))}
                            ${menuLink('/oglasne-deske','board',label('ah_boards','Oglasne deske'))}
                            ${menuLink('/garaža','car',label('my_garage','Moja garaža'))}
                            ${menuLink('/primerjava','scale',`${label('compare_btn','Primerjava')} <span id="compareBadgeDropdown" class="ah-count" hidden></span>`)}
                            <div class="ah-menu-divider"></div><button type="button" class="ah-menu-row ah-logout" id="ahLogout">${icon('arrow')}${label('logout','Odjava')}</button>` : `${menuLink('/prijava','user',label('login_title','Prijava'))}${menuLink('/registracija','plus',label('register_title','Registracija'))}${menuLink('/primerjava','scale',`${label('compare_btn','Primerjava')} <span id="compareBadgeDropdown" class="ah-count" hidden></span>`)}`}
                        </div>
                    </div>
                    <div class="ah-menu-anchor ah-language">
                        <button type="button" class="ah-pill" id="ahLanguageButton" aria-expanded="false" aria-controls="ahLanguageMenu">${flag(lang)}${lang === 'sl' ? 'SL' : 'EN'}${icon('down','ah-small')}</button>
                        <div class="ah-popover ah-language-menu" id="ahLanguageMenu" hidden><button type="button" class="ah-menu-row" data-ah-lang="sl">${icon('globe')}${flag('sl')} Slovenščina</button><button type="button" class="ah-menu-row" data-ah-lang="en">${icon('globe')}${flag('en')} English</button></div>
                    </div>
                    <button type="button" class="ah-icon-button ah-theme" id="ahTheme" aria-label="${label(dark ? 'theme_light' : 'theme_dark',dark ? 'Svetla tema' : 'Temna tema')}">${icon(dark ? 'sun' : 'moon')}</button>
                    <button type="button" class="ah-icon-button ah-burger" id="ahMobileButton" aria-expanded="false" aria-controls="ahMobileMenu" aria-label="${label('menu', 'Meni')}">${icon('menu')}</button>
                </div>
                <div class="ah-popover ah-mobile-menu" id="ahMobileMenu" hidden>
                    ${menuLink('/oglasi','newspaper',label('all_listings','Vsi oglasi'))}
                    ${menuLink('/drazbe','gavel',label('nav_auctions','Dražbe'))}
                    ${menuLink('/najem','key',label('nav_rentals','Najem'))}
                    ${menuLink('/avtohise','dealer',label('nav_dealers','Avtohiše'))}
                    ${menuLink('/gume-in-deli','disc',label('header_tires_parts','Gume in deli'))}
                    ${menuLink('/iskanje','sliders',label('adv_search','Napredno iskanje'))}
                    ${menuLink('/primerjava','scale',label('compare_btn','Primerjava'))}
                    ${menuLink('/oceni-vrednost','chart',label('evaluate_car','Oceni vozilo'))}
                    <div class="ah-menu-divider"></div>
                    ${user ? `
                        <div class="ah-menu-person"><span class="ah-avatar">${escHtml(shortName.charAt(0).toUpperCase())}</span><div><strong>${escHtml(name)}</strong><small>${escHtml(user.email || '')}</small></div></div>
                        ${menuLink('/dashboard','newspaper',label('dashboard_link','Nadzorna plošča'))}
                        ${menuLink('/profil','user',label('my_profile','Moj profil'))}
                        ${menuLink('/mape','folder',label('ah_my_folders','Moje mape'))}
                        ${menuLink('/oglasne-deske','board',label('ah_boards','Oglasne deske'))}
                        ${menuLink('/garaža','car',label('my_garage','Moja garaža'))}
                    ` : `
                        ${menuLink('/prijava','user',label('login_title','Prijava'))}
                        ${menuLink('/registracija','plus',label('register_title','Registracija'))}
                    `}
                    <div class="ah-menu-divider"></div>
                    <div class="ah-mobile-settings">
                        <button type="button" class="ah-menu-row ah-menu-theme-row" id="ahMobileTheme" aria-label="${label(dark ? 'theme_light' : 'theme_dark', dark ? 'Svetla tema' : 'Temna tema')}">
                            ${icon(dark ? 'sun' : 'moon', 'ah-theme-icon')}
                            <span class="ah-menu-theme-text">${label(dark ? 'theme_light' : 'theme_dark', dark ? 'Svetla tema' : 'Temna tema')}</span>
                            <span class="ah-theme-switch-indicator ${dark ? 'is-dark' : 'is-light'}" aria-hidden="true"><span class="ah-theme-switch-thumb"></span></span>
                        </button>
                    </div>
                    ${user ? `<div class="ah-menu-divider"></div><button type="button" class="ah-menu-row ah-logout" id="ahMobileLogout">${icon('arrow')}${label('logout','Odjava')}</button>` : ''}
                </div>
            </nav>

            <!-- Dedicated Mobile Mode Switcher Bar -->
            <div class="ah-mobile-modes-bar" role="tablist" aria-label="${label('ah_search_mode','Kategorija ponudbe')}">
                <a href="/oglasi" class="ah-mobile-mode-pill" data-mobile-mode="oglasi" role="tab">
                    ${icon('car','ah-mode-ico')}<span>${label('header_listings','Oglasi')}</span>
                </a>
                <a href="/drazbe" class="ah-mobile-mode-pill" data-mobile-mode="drazbe" role="tab">
                    ${icon('gavel','ah-mode-ico')}<span>${label('nav_auctions','Dražbe')}</span>
                </a>
                <a href="/najem" class="ah-mobile-mode-pill" data-mobile-mode="najem" role="tab">
                    ${icon('key','ah-mode-ico')}<span>${label('nav_rentals','Najem')}</span>
                </a>
            </div>
        </div>

        <nav class="ah-bottom-nav" aria-label="${label('ah_navigation','Glavna navigacija')}">
            <a href="/" data-bottom-tab="home">${icon('home')}<span>${label('nav_home','Domov')}</span></a>
            <a href="/iskanje" data-bottom-tab="search">${icon('search')}<span>${label('search','Iskanje')}</span></a>
            <a href="/novi-oglas" data-bottom-tab="publish">${icon('plus')}<span>Objavi</span></a>
            <a href="/profil?tab=favourites" data-bottom-tab="favourites">${icon('heart')}<span>Shranjeno</span></a>
            <a href="/profil" data-bottom-tab="profile">${icon('user')}<span>Račun</span></a>
        </nav>`;

        const navAnchors = [
            { anchor: '#ahListingsAnchor', menu: '#ahListingsMenu', button: '#ahListingsButton' }
        ];

        let navTimer = null;
        navAnchors.forEach(({ anchor, menu, button }) => {
            const anchorEl = host.querySelector(anchor);
            const menuEl = host.querySelector(menu);
            const btnEl = host.querySelector(button);
            if (!anchorEl || !menuEl) return;

            anchorEl.addEventListener('mouseenter', () => {
                clearTimeout(navTimer);
                host.querySelector('#ahAccountMenu') && (host.querySelector('#ahAccountMenu').hidden = true);
                host.querySelector('#ahAccountButton')?.setAttribute('aria-expanded', 'false');
                host.querySelector('#ahLanguageMenu') && (host.querySelector('#ahLanguageMenu').hidden = true);
                host.querySelector('#ahLanguageButton')?.setAttribute('aria-expanded', 'false');

                navAnchors.forEach(other => {
                    if (other.menu !== menu) {
                        const om = host.querySelector(other.menu);
                        if (om) om.hidden = true;
                        host.querySelector(other.button)?.setAttribute('aria-expanded', 'false');
                    }
                });

                menuEl.hidden = false;
                btnEl?.setAttribute('aria-expanded', 'true');
            }, options);

            anchorEl.addEventListener('mouseleave', () => {
                clearTimeout(navTimer);
                navTimer = setTimeout(() => {
                    menuEl.hidden = true;
                    btnEl?.setAttribute('aria-expanded', 'false');
                }, 180);
            }, options);
        });

        const pairs = [
            ['ahListingsButton','ahListingsMenu'],
            ['ahAccountButton','ahAccountMenu'],
            ['ahLanguageButton','ahLanguageMenu'],
            ['ahMobileButton','ahMobileMenu']
        ];

        const closeAll = () => {
            clearTimeout(navTimer);
            pairs.forEach(([buttonId, menuId]) => {
                host.querySelector(`#${buttonId}`)?.setAttribute('aria-expanded','false');
                const menu = host.querySelector(`#${menuId}`);
                if (menu) menu.hidden = true;
            });
        };

        pairs.forEach(([buttonId, menuId]) => {
            const button = host.querySelector(`#${buttonId}`);
            const menu = host.querySelector(`#${menuId}`);
            button?.addEventListener('click', (e) => {
                if (buttonId === 'ahListingsButton') {
                    if (!window.matchMedia('(hover: hover)').matches && menu.hidden) {
                        e.preventDefault();
                        closeAll();
                        menu.hidden = false;
                        button.setAttribute('aria-expanded', 'true');
                        return;
                    }
                    closeAll();
                    return;
                }
                const open = menu.hidden;
                closeAll();
                menu.hidden = !open;
                button.setAttribute('aria-expanded',String(open));
            }, options);
        });

        host.querySelectorAll('.ah-submenu-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const anchorEl = trigger.closest('.ah-submenu-anchor');
                const open = !anchorEl.classList.contains('is-open');
                host.querySelectorAll('.ah-submenu-anchor.is-open').forEach(el => {
                    el.classList.remove('is-open');
                    el.querySelector('.ah-submenu-trigger')?.setAttribute('aria-expanded', 'false');
                });
                anchorEl.classList.toggle('is-open', open);
                trigger.setAttribute('aria-expanded', String(open));
            }, options);
        });

        // Mobile pills interaction: if on home page, switch home search mode directly
        host.querySelectorAll('.ah-mobile-mode-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                const path = window.location.pathname.replace(import.meta.env.BASE_URL.replace(/\/$/,''),'') || '/';
                const targetMode = pill.dataset.mobileMode;
                if (path === '/') {
                    e.preventDefault();
                    if (window.__setHomeSearchMode) {
                        window.__setHomeSearchMode(targetMode);
                    }
                    updateActiveLinks();
                }
            }, options);
        });

        document.addEventListener('click', event => {
            if (!host.contains(event.target) || event.target.closest('a')) closeAll();
        }, options);
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            const active = pairs.find(([,menuId]) => !host.querySelector(`#${menuId}`).hidden);
            closeAll();
            if (active) host.querySelector(`#${active[0]}`).focus();
        }, options);
        window.matchMedia('(max-width: 1023px)').addEventListener('change',closeAll,options);
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                const mobMenu = host.querySelector('#ahMobileMenu');
                if (mobMenu && !mobMenu.hidden) {
                    mobMenu.hidden = true;
                    host.querySelector('#ahMobileButton')?.setAttribute('aria-expanded', 'false');
                }
            }
        }, options);
        const toggleTheme = (keepMenuOpen = false) => {
            const wasAccountMenuOpen = !host.querySelector('#ahAccountMenu')?.hidden;
            const wasMobileMenuOpen = !host.querySelector('#ahMobileMenu')?.hidden;
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            render();
            if (keepMenuOpen) {
                if (wasAccountMenuOpen) {
                    const menu = host.querySelector('#ahAccountMenu');
                    const btn = host.querySelector('#ahAccountButton');
                    if (menu && btn) {
                        menu.hidden = false;
                        btn.setAttribute('aria-expanded', 'true');
                    }
                }
                if (wasMobileMenuOpen) {
                    const menu = host.querySelector('#ahMobileMenu');
                    const btn = host.querySelector('#ahMobileButton');
                    if (menu && btn) {
                        menu.hidden = false;
                        btn.setAttribute('aria-expanded', 'true');
                    }
                }
            }
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { dark: isDark } }));
        };
        host.querySelector('#ahTheme')?.addEventListener('click', (e) => { e.stopPropagation(); toggleTheme(false); }, options);
        host.querySelector('#ahMenuThemeToggle')?.addEventListener('click', (e) => { e.stopPropagation(); toggleTheme(true); }, options);
        host.querySelector('#ahMobileTheme')?.addEventListener('click', (e) => { e.stopPropagation(); toggleTheme(true); }, options);
        host.querySelector('#ahMobileLogout')?.addEventListener('click', async () => { await logout(); navigateTo('/'); }, options);
        host.querySelectorAll('[data-ah-lang]').forEach(button => button.addEventListener('click',() => switchLang(button.dataset.ahLang),options));
        host.querySelector('#ahLogout')?.addEventListener('click',async () => { await logout(); navigateTo('/'); },options);
        updateActiveLinks();
        window.updateHeaderCompare();
    }

    function updateActiveLinks() {
        const path = window.location.pathname.replace(import.meta.env.BASE_URL.replace(/\/$/,''),'') || '/';
        host.querySelectorAll('.ah-nav-link[href]').forEach(link => {
            const active = path === link.getAttribute('href');
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
        });

        const isAuction = ['/drazbe', '/iskanje-drazbe', '/drazba'].some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));
        const isRental = ['/najem', '/iskanje-najem'].some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));
        const isListings = ['/oglasi', '/iskanje', '/oglas'].some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));

        let currentMode = 'oglasi';
        if (isAuction) currentMode = 'drazbe';
        else if (isRental) currentMode = 'najem';
        else if (path === '/') currentMode = window.__currentHomeSearchMode || 'oglasi';

        host.querySelector('#ahListingsButton')?.classList.toggle('is-active', isListings || isAuction || isRental || path === '/');

        // Update mobile pills
        host.querySelectorAll('.ah-mobile-mode-pill').forEach(pill => {
            const active = pill.dataset.mobileMode === currentMode;
            pill.classList.toggle('is-active', active);
            pill.setAttribute('aria-selected', String(active));
        });

        // Contextual search tab in bottom nav
        const searchTab = host.querySelector('[data-bottom-tab="search"]');
        if (searchTab) {
            const searchHref = currentMode === 'drazbe' ? '/iskanje-drazbe' : (currentMode === 'najem' ? '/iskanje-najem' : '/iskanje');
            searchTab.setAttribute('href', searchHref);
        }

        const tab = path === '/' ? 'home' : path === '/novi-oglas' ? 'publish' : path === '/profil' && new URLSearchParams(location.search).get('tab') === 'favourites' ? 'favourites' : ['/profil','/dashboard','/prijava','/registracija'].includes(path) ? 'profile' : (isListings || isAuction || isRental) ? 'search' : '';
        host.querySelectorAll('[data-bottom-tab]').forEach(link => {
            if (link.dataset.bottomTab === tab) link.setAttribute('aria-current','page');
            else link.removeAttribute('aria-current');
        });
        document.body.classList.toggle('ah-focus-flow',path === '/novi-oglas' || path === '/booking');
    }

    window.updateHeaderCompare = () => {
        let count = 0;
        try { count = JSON.parse(localStorage.getItem(lsKey('compare')) || '[]').length; } catch { /* Ignore an invalid cache. */ }
        const badge = host.querySelector('#compareBadgeDropdown');
        if (badge) { badge.textContent = count; badge.hidden = !count; }
        const mobileBadge = host.querySelector('#ahMobileCompareBadge');
        if (mobileBadge) { mobileBadge.textContent = count; mobileBadge.hidden = !count; }
    };

    window.updateHeaderActiveLinks = updateActiveLinks;

    render();
    onAuth(next => { user = window.__mockUser || next; render(); });
    window.__setMockHeaderUser = (u) => { user = u; render(); };
    document.addEventListener('langChanged',render);
    document.addEventListener('routeChanged',updateActiveLinks);
    document.addEventListener('homeModeChanged',updateActiveLinks);
    document.addEventListener('beforeRouteChange',() => {
        host.querySelectorAll('.ah-popover').forEach(menu => { menu.hidden = true; });
        host.querySelectorAll('[aria-expanded]').forEach(button => button.setAttribute('aria-expanded','false'));
    });
}
