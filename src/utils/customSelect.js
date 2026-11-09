import { t } from '../core/i18n.js';
import { icon } from '../components/autohub/icons.js';
import { getBrandLogo, getBrandInitial, isBrandMonochrome } from '../data/brandLogos.js';
import { getBrandRgb } from '../data/brandColors.js';
import { getCountryRgb, getCountryOptionHtml, getCountryTriggerHtml } from '../data/countryFlags.js';
import { getBrandCount } from '../data/popularBrands.js';

function getIconTriggerHtml(text, iconName, isIconOnly = false) {
    if (!iconName) return text;
    if (isIconOnly) {
        return `<span class="custom-select-trigger-icon is-icon-only" title="${text}" aria-label="${text}">${icon(iconName, 'custom-select-active-icon')}</span>`;
    }
    return `<span class="custom-select-trigger-icon">${icon(iconName, 'custom-select-active-icon')}</span><span class="custom-select-trigger-text">${text}</span>`;
}

function getBrandOptionHtml(optText, optValue, customCount) {
    if (!optValue) return optText;
    const logoUrl = getBrandLogo(optValue);
    const brandRgb = getBrandRgb(optValue || optText);
    const initial = getBrandInitial(optText);
    const isAdaptive = isBrandMonochrome(optValue || optText);
    const adaptiveClass = isAdaptive ? 'logo-adaptive' : '';
    const formattedCount = customCount || getBrandCount(optValue || optText) || '';
    const countHtml = formattedCount ? `<span class="custom-select-brand-count">${formattedCount}</span>` : '';
    const watermarkHtml = logoUrl 
        ? `<div class="custom-select-brand-watermark"><img src="${logoUrl}" class="custom-select-brand-logo ${adaptiveClass}" alt="" loading="lazy" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" /><span class="custom-select-brand-badge" style="display:none;">${initial}</span></div>`
        : `<div class="custom-select-brand-watermark"><span class="custom-select-brand-badge">${initial}</span></div>`;

    return `<div class="custom-select-brand-item" style="--brand-rgb: ${brandRgb};"><span class="custom-select-brand-name">${optText}</span><div class="custom-select-brand-right">${countHtml}${watermarkHtml}</div></div>`;
}

function getBrandTriggerHtml(optText, optValue) {
    if (!optValue) return optText;
    const logoUrl = getBrandLogo(optValue);
    const brandRgb = getBrandRgb(optValue || optText);
    const initial = getBrandInitial(optText);
    const isAdaptive = isBrandMonochrome(optValue || optText);
    const adaptiveClass = isAdaptive ? 'logo-adaptive' : '';
    const watermarkHtml = logoUrl 
        ? `<div class="custom-select-brand-watermark"><img src="${logoUrl}" class="custom-select-brand-logo ${adaptiveClass}" alt="" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" /><span class="custom-select-brand-badge" style="display:none;">${initial}</span></div>`
        : `<div class="custom-select-brand-watermark"><span class="custom-select-brand-badge">${initial}</span></div>`;

    return `<div class="custom-select-brand-item trigger-item" style="--brand-rgb: ${brandRgb};"><span class="custom-select-brand-name">${optText}</span>${watermarkHtml}</div>`;
}

function getColorDotHtml(colorName) {
    if (!colorName) return '';
    const map = {
        'Bela': '#ffffff',
        'Črna': '#000000',
        'Siva': '#808080',
        'Srebrna': '#c0c0c0',
        'Modra': '#1e40af',
        'Rdeča': '#dc2626',
        'Zelena': '#16a34a',
        'Rumena': '#facc15',
        'Rjava': '#78350f',
        'Oranžna': '#ea580c',
        'Vijolična': '#7c3aed',
        'Zlata': '#fbbf24',
        'Bronasta': '#cd7f32',
    };
    
    const normalized = colorName.trim();
    let bg = map[normalized];
    if (!bg) {
        const enMap = {
            'white': '#ffffff',
            'black': '#000000',
            'grey': '#808080',
            'silver': '#c0c0c0',
            'blue': '#1e40af',
            'red': '#dc2626',
            'green': '#16a34a',
            'yellow': '#facc15',
            'brown': '#78350f',
            'orange': '#ea580c',
            'purple': '#7c3aed',
            'gold': '#fbbf24',
            'bronze': '#cd7f32',
        };
        bg = enMap[normalized.toLowerCase()];
    }

    if (normalized === 'Druga' || normalized.toLowerCase() === 'druga' || normalized.toLowerCase() === 'other' || !bg) {
        bg = 'linear-gradient(45deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)';
    }

    const borderStyle = (normalized === 'Bela' || normalized.toLowerCase() === 'white')
        ? 'border: 1px solid rgba(0,0,0,0.25);'
        : (normalized === 'Črna' || normalized.toLowerCase() === 'black')
            ? 'border: 1px solid rgba(255,255,255,0.4);'
            : 'border: 1px solid rgba(0,0,0,0.15);';

    return `<span class="custom-select-color-dot" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${bg};${borderStyle}margin-right:8px;vertical-align:middle;flex-shrink:0;"></span>`;
}

const BODY_TYPE_ICONS = {
    'limuzina': 'brand/autohub/dac15b24c64a4c96063768274c2416d1.svg',
    'kombilimuzina': 'brand/autohub/9ce576494b3d76568df65f7beeb3c9e2.svg',
    'karavan': 'brand/autohub/f651b91c8ef360202df783be6b03eeb5.svg',
    'terensko': 'brand/autohub/a2007272c1633d9ea61164607b88d5de.svg',
    'terensko vozilo': 'brand/autohub/a2007272c1633d9ea61164607b88d5de.svg',
    'suv': 'brand/autohub/a2007272c1633d9ea61164607b88d5de.svg',
    'enoprostorec': 'brand/autohub/2aa77b38835e0b66283e034412bbe85d.svg',
    'kabriolet': 'brand/autohub/b27642fd338841fdb35c6a672c5be70f.svg',
    'coupe': 'brand/autohub/066a949bc40bb4da4ac61cfbaf7c6a78.svg',
    'kupe': 'brand/autohub/066a949bc40bb4da4ac61cfbaf7c6a78.svg',
    'sportni': 'brand/autohub/5939d5787677d064b674911faec8f4db.svg',
    'sportni avto': 'brand/autohub/5939d5787677d064b674911faec8f4db.svg',
    'športni avto': 'brand/autohub/5939d5787677d064b674911faec8f4db.svg',
    'pick-up': 'brand/autohub/69ddafb159e04009fb0057af0f6ab012.svg',
    'pickup': 'brand/autohub/69ddafb159e04009fb0057af0f6ab012.svg',
    'kombi': 'icons/vehicles-custom.svg#vc-panel-van',
    'kombi / dostavnik': 'icons/vehicles-custom.svg#vc-panel-van',
    'dostavnik': 'icons/vehicles-custom.svg#vc-panel-van',
    'avtodom': 'icons/vehicles.svg#v-camper',
    'pocitniskaprikolica': 'icons/vehicles.svg#v-caravan',
    'pocitniska prikolica': 'icons/vehicles.svg#v-caravan'
};

function getBodyTypeIconHtml(val, text) {
    const raw = (val || text || '').trim();
    if (!raw) return '';
    const norm = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm === '' || norm === 'vse' || norm.startsWith('vse oblike') || norm.startsWith('all')) {
        return `<svg class="custom-select-body-icon custom-select-body-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>`;
    }
    const relPath = BODY_TYPE_ICONS[norm] || BODY_TYPE_ICONS[raw];
    if (relPath) {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/';
        const cleanBase = base.endsWith('/') ? base : base + '/';
        const fullUrl = `${cleanBase}${relPath}`;
        if (relPath.includes('#')) {
            return `<svg class="custom-select-body-icon custom-select-body-svg" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><use href="${fullUrl}"></use></svg>`;
        }
        return `<img src="${fullUrl}" class="custom-select-body-icon" alt="" aria-hidden="true" />`;
    }
    return '';
}

function getBodyTypeOptionHtml(optText, optValue) {
    const iconHtml = getBodyTypeIconHtml(optValue, optText);
    if (!iconHtml) return optText;
    return `<div class="custom-select-body-item">${iconHtml}<span class="custom-select-body-name">${optText}</span></div>`;
}

function getBodyTypeTriggerHtml(optText, optValue) {
    const iconHtml = getBodyTypeIconHtml(optValue, optText);
    if (!iconHtml) return optText;
    return `<div class="custom-select-body-item trigger-item">${iconHtml}<span class="custom-select-body-name">${optText}</span></div>`;
}

/**
 * CustomSelect - Transforms standard HTML selects into searchable, pill-shaped dropdowns.
 */
let selectBackdrop = null;
function getSelectBackdrop() {
    if (!selectBackdrop) {
        selectBackdrop = document.createElement('div');
        selectBackdrop.className = 'custom-select-backdrop';
        selectBackdrop.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllMenus();
        });
        document.body.appendChild(selectBackdrop);
    }
    return selectBackdrop;
}

export function initCustomSelects(scope = document) {
    const selects = scope.querySelectorAll('select');
    selects.forEach(select => {
        if (select.dataset.customSelectInit) {
            select._syncCustomSelect?.();
        } else {
            createCustomSelect(select);
        }
    });
}

export function createCustomSelect(select) {
    if (!select || select.dataset.customSelectInit) return;
    select.dataset.customSelectInit = "true";
    select.classList.add('custom-select-hidden');
    select.style.display = 'none';

    // Hide any hardcoded static sibling select-icon to prevent double chevron arrows
    if (select.parentNode && typeof select.parentNode.querySelector === 'function') {
        const staticChevron = select.parentNode.querySelector(':scope > .select-icon');
        if (staticChevron) {
            staticChevron.style.display = 'none';
        }
    }

    const isCompact = select.dataset.compact === "true";
    const isIconOnly = select.dataset.iconOnly === "true";

    const container = document.createElement('div');
    container.className = `custom-select-container ${isCompact ? 'custom-select-compact' : 'custom-select-sheet-mode'}`;

    const isColorSelect = select.id === 'fColor';
    const isBrandSelect = select.name === 'make' ||
                          select.id === 'home-make' ||
                          select.id === 'nav-home-make' ||
                          select.id === 'make' ||
                          select.id === 'sidebarMake' ||
                          select.id === 'eval-make' ||
                          select.id === 'fMake' ||
                          select.id === 'brandSelect' ||
                          select.id === 'brand' ||
                          select.name === 'brand' ||
                          select.id === 'vf-make' ||
                          select.name === 'engineMake' ||
                          select.id === 'advEngineMake' ||
                          select.id === 'sidebarEngineMake' ||
                          select.dataset.type === 'make' ||
                          select.dataset.type === 'brand';
    const isCountrySelect = select.name === 'country' ||
                            select.id === 'home-country' ||
                            select.id === 'sidebarCountry' ||
                            select.id === 'vendor-country' ||
                            select.id === 'country' ||
                            select.id === 'reCountry' ||
                            select.dataset.type === 'country';
    const isBodyTypeSelect = select.name === 'bodyType' ||
                             select.id === 'sidebarBodyType' ||
                             select.id === 'bodyType' ||
                             select.id === 'fBody' ||
                             select.id === 'fBodyType' ||
                             select.dataset.type === 'bodyType';
    const initialOpt = select.options[select.selectedIndex];
    let initialValHtml = initialOpt?.text || '';
    if (isColorSelect && initialOpt && initialOpt.value) {
        initialValHtml = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(initialOpt.value)}<span>${initialOpt.text}</span></div>`;
    } else if (isBrandSelect && initialOpt && initialOpt.value) {
        initialValHtml = getBrandTriggerHtml(initialOpt.text, initialOpt.value);
    } else if (isCountrySelect && initialOpt && initialOpt.value) {
        initialValHtml = getCountryTriggerHtml(initialOpt.text, initialOpt.value);
    } else if (isBodyTypeSelect && initialOpt) {
        initialValHtml = getBodyTypeTriggerHtml(initialOpt.text, initialOpt.value);
    } else if (initialOpt && initialOpt.dataset.icon) {
        initialValHtml = getIconTriggerHtml(initialOpt.text, initialOpt.dataset.icon, isIconOnly);
    }

    const noChevron = select.dataset.noChevron === "true";

    const trigger = document.createElement('div');
    trigger.className = `custom-select-trigger${isIconOnly ? ' is-icon-only' : ''}`;
    trigger.innerHTML = `
        <span class="custom-select-value">${initialValHtml}</span>
        ${noChevron ? '' : '<i data-lucide="chevron-down" class="select-icon"></i>'}
    `;

    function syncTriggerBrand(opt) {
        if (!isBrandSelect || !trigger) return;
        if (opt && opt.value) {
            const rgb = getBrandRgb(opt.value || opt.text);
            trigger.style.setProperty('--brand-rgb', rgb);
            trigger.classList.add('brand-selected');
        } else {
            trigger.style.removeProperty('--brand-rgb');
            trigger.classList.remove('brand-selected');
        }
    }
    syncTriggerBrand(initialOpt);

    function syncTriggerCountry(opt) {
        if (!isCountrySelect || !trigger) return;
        if (opt && opt.value) {
            const rgb = getCountryRgb(opt.value || opt.text);
            trigger.style.setProperty('--country-rgb', rgb);
            trigger.classList.add('country-selected');
        } else {
            trigger.style.removeProperty('--country-rgb');
            trigger.classList.remove('country-selected');
        }
    }
    syncTriggerCountry(initialOpt);

    const menu = document.createElement('div');
    menu.className = `custom-select-menu ${isCompact ? 'custom-select-compact-menu' : 'custom-select-sheet'}`;
    menu.addEventListener('click', (e) => e.stopPropagation());

    // Mobile bottom sheet handle and header
    const sheetHandle = document.createElement('div');
    sheetHandle.className = 'custom-select-sheet-handle';
    menu.appendChild(sheetHandle);

    const sheetHeader = document.createElement('div');
    sheetHeader.className = 'custom-select-sheet-header';

    let sheetTitleText = '';
    if (select.dataset.sheetTitle) {
        sheetTitleText = select.dataset.sheetTitle;
    } else if (isBrandSelect) {
        sheetTitleText = t('select_brand', 'Izberite znamko');
    } else if (select.name === 'model' || select.id?.toLowerCase().includes('model')) {
        sheetTitleText = t('select_model', 'Izberite model');
    } else if (isBodyTypeSelect) {
        sheetTitleText = t('select_body', 'Oblika vozila');
    } else if (isColorSelect) {
        sheetTitleText = t('select_color', 'Barva vozila');
    } else if (isCountrySelect) {
        sheetTitleText = t('select_country', 'Država');
    } else {
        const associatedLabel = select.id ? document.querySelector(`label[for="${select.id}"]`) : null;
        const fieldGroupLabel = select.closest?.('.ah-field, .form-group, .field-group, .adv-field-group')?.querySelector('label, .ah-field-label');
        sheetTitleText = associatedLabel?.textContent?.trim() || fieldGroupLabel?.textContent?.trim() || initialOpt?.text || t('select_option', 'Izberite');
    }

    const sheetTitle = document.createElement('span');
    sheetTitle.className = 'custom-select-sheet-title';
    sheetTitle.textContent = sheetTitleText;

    const sheetClose = document.createElement('button');
    sheetClose.type = 'button';
    sheetClose.className = 'custom-select-sheet-close';
    sheetClose.setAttribute('aria-label', t('close', 'Zapri'));
    sheetClose.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    sheetClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
    });

    sheetHeader.appendChild(sheetTitle);
    sheetHeader.appendChild(sheetClose);
    menu.appendChild(sheetHeader);

    const noSearch = select.dataset.noSearch === "true";
    let searchInput = null;

    if (!noSearch) {
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'custom-select-search-wrapper';
        
        const searchIcon = document.createElement('span');
        searchIcon.className = 'custom-select-search-icon';
        searchIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'custom-select-search';
        searchInput.placeholder = isBrandSelect 
            ? t('search_brand_placeholder', 'Iskanje znamke ...')
            : (select.name === 'model' || select.id?.toLowerCase().includes('model'))
                ? t('search_model_placeholder', 'Išči model...')
                : t('search_placeholder', 'Iskanje...');
        searchInput.autocomplete = 'off';
        searchInput.autocapitalize = 'none';
        searchInput.spellcheck = false;

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'custom-select-search-clear';
        clearBtn.setAttribute('aria-label', t('clear', 'Počisti'));
        clearBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        clearBtn.style.display = 'none';
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchInput.value = '';
            clearBtn.classList.remove('active');
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });

        searchInput.addEventListener('input', () => {
            clearBtn.classList.toggle('active', Boolean(searchInput.value));
        });

        searchWrapper.appendChild(searchIcon);
        searchWrapper.appendChild(searchInput);
        searchWrapper.appendChild(clearBtn);
        menu.appendChild(searchWrapper);
    }

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';

    menu.appendChild(optionsContainer);

    let allBrandsBtn = null;
    let showingAllBrands = false;

    function applyBrandSectionVisibility() {
        if (!isBrandSelect || !allBrandsBtn) return;
        const term = searchInput ? normStr(searchInput.value.trim()) : '';
        if (term) {
            allBrandsBtn.style.display = 'none';
            return;
        }
        const hasPopular = Boolean(optionsContainer.querySelector('.custom-select-option[data-popular="true"]'));
        if (!hasPopular) {
            allBrandsBtn.style.display = 'none';
            return;
        }
        allBrandsBtn.style.display = 'flex';
        const options = optionsContainer.querySelectorAll('.custom-select-option');
        options.forEach(opt => {
            if (!opt.dataset.value && !opt.classList.contains('popular-label')) {
                opt.classList.add('hidden');
                opt.style.display = 'none';
                return;
            }
            if (opt.classList.contains('popular-label')) {
                opt.classList.remove('hidden');
                opt.style.display = '';
                return;
            }
            if (opt.dataset.popular === 'true') {
                opt.classList.remove('hidden');
                opt.style.display = '';
            } else if (opt.dataset.value) {
                if (showingAllBrands || opt.classList.contains('selected')) {
                    opt.classList.remove('hidden');
                    opt.style.display = '';
                } else {
                    opt.classList.add('hidden');
                    opt.style.display = 'none';
                }
            }
        });
    }

    if (isBrandSelect) {
        allBrandsBtn = document.createElement('button');
        allBrandsBtn.type = 'button';
        allBrandsBtn.className = 'custom-select-all-brands-btn';
        allBrandsBtn.innerHTML = `<span>${t('all_brands_az', 'Vse znamke A–Ž')}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>`;
        allBrandsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showingAllBrands = !showingAllBrands;
            applyBrandSectionVisibility();
            allBrandsBtn.querySelector('span').textContent = showingAllBrands 
                ? t('popular_brands_only', 'Priljubljene znamke ←') 
                : t('all_brands_az', 'Vse znamke A–Ž →');
        });
        menu.appendChild(allBrandsBtn);
    }
    container.appendChild(trigger);
    container.appendChild(menu);

    select.parentNode.insertBefore(container, select);

    let liftedAncestors = [];

    function openMenu() {
        const isMobile = window.innerWidth < 768;
        const isSheet = isMobile && !container.classList.contains('custom-select-compact');

        if (isSheet) {
            clearTimeout(container._closeTimer);
            menu.classList.remove('closing');

            if (menu.parentElement !== document.body) {
                if (!container._menuPlaceholder) {
                    container._menuPlaceholder = document.createComment('custom-select-menu-placeholder');
                    menu.parentElement.insertBefore(container._menuPlaceholder, menu);
                }
                document.body.appendChild(menu);
            }

            container.classList.add('open');
            trigger.classList.add('open');
            const backdrop = getSelectBackdrop();
            backdrop.classList.add('active');
            document.body.classList.add('custom-select-sheet-open');

            menu.classList.remove('open');
            void menu.offsetHeight;

            requestAnimationFrame(() => {
                menu.classList.add('open');
            });

            // Scroll selected option into view within bottom sheet
            const selectedOpt = optionsContainer.querySelector('.custom-select-option.selected');
            if (selectedOpt) {
                setTimeout(() => {
                    selectedOpt.scrollIntoView({ block: 'center', behavior: 'instant' });
                }, 80);
            }
        } else {
            container.classList.add('open');
            menu.classList.add('open');
            trigger.classList.add('open');

            // Check if menu would overflow viewport bottom, open upward if needed
            const rect = container.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            if (spaceBelow < 280 && spaceAbove > spaceBelow) {
                menu.classList.add('open-up');
            } else {
                menu.classList.remove('open-up');
            }

            // Lift ancestor elements to ensure dropdown is not clipped and displays above other sections
            liftedAncestors = [];
            let curr = container.parentElement;
            const z = 99999;
            while (curr && curr !== document.body && curr !== document.documentElement) {
                const comp = window.getComputedStyle(curr);
                const overflowHidden = comp.overflow !== 'visible' || comp.overflowX !== 'visible' || comp.overflowY !== 'visible';
                const positionStatic = comp.position === 'static';

                liftedAncestors.push({
                    el: curr,
                    hadZIndex: curr.style.zIndex,
                    hadOverflow: curr.style.overflow,
                    hadPosition: curr.style.position
                });
                curr.style.zIndex = String(z);
                if (overflowHidden) {
                    curr.style.overflow = 'visible';
                }
                if (positionStatic) {
                    curr.style.position = 'relative';
                }
                curr = curr.parentElement;
            }

            // Scroll so the label is visible above the pill — mobile only for compact
            if (isMobile) {
                const fieldGroup = container.closest('.form-group, .field-group, .adv-field-group');
                const scrollTarget = fieldGroup || container;
                const stickyNav = document.querySelector('.sticky-nav');
                const navHeight = stickyNav ? stickyNav.getBoundingClientRect().height : 0;
                const targetRect = scrollTarget.getBoundingClientRect();
                const absoluteTop = targetRect.top + window.scrollY - navHeight - 8;
                window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
            }
        }

        if (searchInput) {
            searchInput.value = '';
            const clearBtn = menu.querySelector('.custom-select-search-clear');
            if (clearBtn) clearBtn.classList.remove('active');
            searchInput.dispatchEvent(new Event('input'));
            if (!isMobile) {
                searchInput.focus({ preventScroll: true });
            }
        }
        applyBrandSectionVisibility();
    }

    function closeMenu() {
        container.classList.remove('open');
        trigger.classList.remove('open');

        if (allBrandsBtn && showingAllBrands) {
            showingAllBrands = false;
            allBrandsBtn.querySelector('span').textContent = t('all_brands_az', 'Vse znamke A–Ž →');
        }
        applyBrandSectionVisibility();

        const isSheet = menu && (menu.classList.contains('custom-select-sheet') || menu.parentElement === document.body);

        if (isSheet) {
            menu.classList.remove('open');
            menu.classList.add('closing');

            if (selectBackdrop) {
                selectBackdrop.classList.remove('active');
            }
            document.body.classList.remove('custom-select-sheet-open');

            clearTimeout(container._closeTimer);
            container._closeTimer = setTimeout(() => {
                menu.classList.remove('closing');
                if (container._menuPlaceholder && container._menuPlaceholder.parentElement) {
                    container._menuPlaceholder.parentElement.insertBefore(menu, container._menuPlaceholder);
                    container._menuPlaceholder.remove();
                    container._menuPlaceholder = null;
                }
            }, 300);
        } else {
            if (menu) {
                menu.classList.remove('open');
                menu.classList.remove('open-up');
            }
            if (container._menuPlaceholder && container._menuPlaceholder.parentElement) {
                container._menuPlaceholder.parentElement.insertBefore(menu, container._menuPlaceholder);
                container._menuPlaceholder.remove();
                container._menuPlaceholder = null;
            }
            if (selectBackdrop) {
                selectBackdrop.classList.remove('active');
            }
            document.body.classList.remove('custom-select-sheet-open');
        }

        liftedAncestors.forEach(({ el, hadZIndex, hadOverflow, hadPosition }) => {
            el.style.zIndex = hadZIndex || '';
            el.style.overflow = hadOverflow || '';
            el.style.position = hadPosition || '';
        });
        liftedAncestors = [];

        if (searchInput) {
            searchInput.value = '';
            const clearBtn = menu.querySelector('.custom-select-search-clear');
            if (clearBtn) clearBtn.classList.remove('active');
            if (document.activeElement === searchInput) {
                searchInput.blur();
            }
            optionsContainer.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.classList.remove('hidden');
                opt.style.display = '';
            });
            const noRes = optionsContainer.querySelector('.no-results');
            if (noRes) noRes.remove();
        }
        applyBrandSectionVisibility();
    }

    container.__closeMenu = closeMenu;

    function syncDisabledState() {
        const isDisabled = Boolean(select.disabled);
        container.classList.toggle('disabled', isDisabled);
        if (isDisabled) {
            closeMenu();
        }
    }

    // Intercept JS property assignments to select.disabled
    try {
        let disabledVal = select.disabled;
        Object.defineProperty(select, 'disabled', {
            get() {
                return disabledVal;
            },
            set(val) {
                disabledVal = Boolean(val);
                if (val) {
                    select.setAttribute('disabled', '');
                } else {
                    select.removeAttribute('disabled');
                }
                syncDisabledState();
            },
            configurable: true
        });
    } catch (e) {
        // Fallback for non-configurable properties
    }

    // Sync options
    function updateOptions() {
        optionsContainer.innerHTML = '';
        Array.from(select.options).forEach((opt, index) => {
            const optionElem = document.createElement('div');
            optionElem.className = 'custom-select-option';
            if (index === select.selectedIndex) optionElem.classList.add('selected');
            if (opt.dataset.popularLabel) optionElem.classList.add('popular-label');
            if (opt.dataset.popular) {optionElem.dataset.popular = 'true';optionElem.dataset.originalPopular = 'true';}

            if (isBrandSelect && opt.value) {
                optionElem.classList.add('brand-option');
                const brandRgb = getBrandRgb(opt.value || opt.text);
                optionElem.style.setProperty('--brand-rgb', brandRgb);
                optionElem.innerHTML = getBrandOptionHtml(opt.text, opt.value, opt.dataset.count);
            } else if (isCountrySelect && opt.value) {
                optionElem.classList.add('country-option');
                const countryRgb = getCountryRgb(opt.value || opt.text);
                optionElem.style.setProperty('--country-rgb', countryRgb);
                optionElem.innerHTML = getCountryOptionHtml(opt.text, opt.value);
            } else if (isBodyTypeSelect) {
                optionElem.classList.add('body-type-option');
                optionElem.innerHTML = getBodyTypeOptionHtml(opt.text, opt.value);
            } else if (isColorSelect && opt.value) {
                optionElem.innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(opt.value)}<span>${opt.text}</span></div>`;
            } else if (opt.dataset.icon) {
                optionElem.innerHTML = `<div class="custom-select-icon-row">${icon(opt.dataset.icon, 'custom-select-opt-icon')}<span>${opt.text}</span></div>`;
            } else {
                optionElem.textContent = opt.text;
            }
            optionElem.dataset.value = opt.value;

            if (isBrandSelect && !opt.value) {
                optionElem.classList.add('hidden');
                optionElem.style.display = 'none';
            }

            if (!opt.dataset.popularLabel && !isBrandSelect) {
                const checkSpan = document.createElement('span');
                checkSpan.className = 'custom-select-check';
                checkSpan.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                optionElem.appendChild(checkSpan);
            }

            optionElem.addEventListener('click', (e) => {
                e.stopPropagation();
                if (select.disabled || opt.disabled || opt.dataset.popularLabel) return;
                select.selectedIndex = index;
                trigger.classList.toggle('has-value', Boolean(opt && opt.value));
                if (isColorSelect && opt.value) {
                    trigger.querySelector('.custom-select-value').innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(opt.value)}<span>${opt.text}</span></div>`;
                } else if (isBrandSelect && opt.value) {
                    trigger.querySelector('.custom-select-value').innerHTML = getBrandTriggerHtml(opt.text, opt.value);
                    syncTriggerBrand(opt);
                } else if (isCountrySelect && opt.value) {
                    trigger.querySelector('.custom-select-value').innerHTML = getCountryTriggerHtml(opt.text, opt.value);
                    syncTriggerCountry(opt);
                } else if (isBodyTypeSelect) {
                    trigger.querySelector('.custom-select-value').innerHTML = getBodyTypeTriggerHtml(opt.text, opt.value);
                } else if (opt.dataset.icon) {
                    trigger.querySelector('.custom-select-value').innerHTML = getIconTriggerHtml(opt.text, opt.dataset.icon, isIconOnly);
                    if (isIconOnly) trigger.classList.add('is-icon-only');
                } else {
                    trigger.querySelector('.custom-select-value').textContent = opt.text;
                    if (isBrandSelect) syncTriggerBrand(null);
                    if (isCountrySelect) syncTriggerCountry(null);
                }
                closeMenu();
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });
            optionsContainer.appendChild(optionElem);
        });
        // Sync trigger text with currently selected option
        if (trigger.querySelector('.custom-select-value')) {
            const selectedOpt = select.options[select.selectedIndex];
            trigger.classList.toggle('has-value', Boolean(selectedOpt && selectedOpt.value));
            if (isColorSelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(selectedOpt.value)}<span>${selectedOpt.text}</span></div>`;
            } else if (isBrandSelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = getBrandTriggerHtml(selectedOpt.text, selectedOpt.value);
                syncTriggerBrand(selectedOpt);
            } else if (isCountrySelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = getCountryTriggerHtml(selectedOpt.text, selectedOpt.value);
                syncTriggerCountry(selectedOpt);
            } else if (isBodyTypeSelect && selectedOpt) {
                trigger.querySelector('.custom-select-value').innerHTML = getBodyTypeTriggerHtml(selectedOpt.text, selectedOpt.value);
            } else if (selectedOpt && selectedOpt.dataset.icon) {
                trigger.querySelector('.custom-select-value').innerHTML = getIconTriggerHtml(selectedOpt.text, selectedOpt.dataset.icon, isIconOnly);
                if (isIconOnly) trigger.classList.add('is-icon-only');
            } else {
                trigger.querySelector('.custom-select-value').textContent = selectedOpt?.text || '';
                if (isBrandSelect) syncTriggerBrand(null);
                if (isCountrySelect) syncTriggerCountry(null);
            }
        }
        applyBrandSectionVisibility();
        syncDisabledState();
    }

    select._syncCustomSelect = updateOptions;
    updateOptions();

    // Toggle menu
    trigger.addEventListener('click', (e) => {
        syncDisabledState();
        if (select.disabled) return;
        e.stopPropagation();
        const isOpen = menu.classList.contains('open');
        closeAllMenus();
        if (!isOpen) {
            openMenu();
        }
    });

    // Associated label click listener
    if (select.id) {
        const label = document.querySelector(`label[for="${select.id}"]`);
        if (label) {
            label.addEventListener('click', (e) => {
                syncDisabledState();
                if (select.disabled) return;
                e.preventDefault();
                trigger.click();
            });
        }
    }

    // Search logic
    let highlightedIndex = -1;
    function getVisibleOptions() {
        return Array.from(optionsContainer.querySelectorAll('.custom-select-option:not(.hidden):not(.no-results)'));
    }

    function highlightOption(index) {
        const visible = getVisibleOptions();
        visible.forEach(opt => opt.classList.remove('highlighted'));
        if (index >= 0 && index < visible.length) {
            visible[index].classList.add('highlighted');
            visible[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            highlightedIndex = index;
        } else {
            highlightedIndex = -1;
        }
    }

    function normStr(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = normStr(searchInput.value.trim());
            const options = optionsContainer.querySelectorAll('.custom-select-option');
            let hasResults = false;

            if (!term) {
                options.forEach(opt => {
                    opt.classList.remove('hidden');
                    opt.style.display = '';
                });
                applyBrandSectionVisibility();
                hasResults = true;
            } else {
                if (allBrandsBtn) allBrandsBtn.style.display = 'none';
                options.forEach(opt => {
                    const popular = opt.dataset.originalPopular === 'true';
                    const duplicate = popular && Array.from(options).some(other => other !== opt && other.dataset.value === opt.dataset.value && other.dataset.originalPopular !== 'true' && !other.classList.contains('popular-label'));
                    if (popular) { if (term && !duplicate) delete opt.dataset.popular; else opt.dataset.popular = 'true'; }
                    // Hide section labels and duplicated popular entries during search.
                    // A deduplicated popular brand remains a searchable result.
                    if (opt.classList.contains('popular-label') || duplicate) {
                        opt.classList.add('hidden');
                        opt.style.display = 'none';
                        return;
                    }
                    const text = normStr(opt.textContent);
                    const value = normStr(opt.dataset.value);
                    let isAliasMatch = false;
                    if (value === 'dmc' && 'delorean'.includes(term)) isAliasMatch = true;

                    if (text.includes(term) || isAliasMatch) {
                        opt.classList.remove('hidden');
                        opt.style.display = '';
                        if (!opt.classList.contains('popular-label')) {
                            hasResults = true;
                        }
                    } else {
                        opt.classList.add('hidden');
                        opt.style.display = 'none';
                    }
                });
            }

            highlightedIndex = -1;
            options.forEach(opt => opt.classList.remove('highlighted'));

            // No results message
            let noRes = optionsContainer.querySelector('.no-results');
            if (!hasResults) {
                if (!noRes) {
                    noRes = document.createElement('div');
                    noRes.className = 'custom-select-option no-results';
                    noRes.textContent = t('no_results_found', 'No results found');
                    optionsContainer.appendChild(noRes);
                }
            } else if (noRes) {
                noRes.remove();
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            const visible = getVisibleOptions();
            if (visible.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = (highlightedIndex + 1) % visible.length;
                highlightOption(next);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = (highlightedIndex - 1 + visible.length) % visible.length;
                highlightOption(prev);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0 && visible[highlightedIndex]) {
                    visible[highlightedIndex].click();
                } else if (visible.length === 1) {
                    visible[0].click();
                }
            } else if (e.key === 'Escape') {
                closeMenu();
            }
        });

        // Prevent click inside search from closing
        searchInput.addEventListener('click', (e) => e.stopPropagation());
    }

    // Observer to handle dynamic content changes in original select
    const observer = new MutationObserver((mutations) => {
        // Rebuilding a brand list appends dozens of options in the same turn.
        // Render the final list once, preserving an open menu's search term.
        if (mutations.some(mutation => mutation.type === 'childList')) {
            const currentSearch = searchInput ? searchInput.value : '';
            select._syncCustomSelect = updateOptions;
    updateOptions();
            if (container.classList.contains('open') && currentSearch && searchInput) {
                searchInput.value = currentSearch;
                searchInput.dispatchEvent(new Event('input'));
            }
        }
        if (mutations.some(mutation => mutation.type === 'attributes' && mutation.attributeName === 'disabled')) {
            syncDisabledState();
        }
    });
    observer.observe(select, { childList: true, attributes: true });

    // Sync trigger text when original select changes via JS
    select.addEventListener('change', () => {
        const selectedOpt = select.options[select.selectedIndex];
        const selectedText = selectedOpt?.text || '';
        trigger.classList.toggle('has-value', Boolean(selectedOpt && selectedOpt.value));
        if (trigger.querySelector('.custom-select-value')) {
            if (isColorSelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(selectedOpt.value)}<span>${selectedOpt.text}</span></div>`;
            } else if (isBrandSelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = getBrandTriggerHtml(selectedOpt.text, selectedOpt.value);
                syncTriggerBrand(selectedOpt);
            } else if (isCountrySelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = getCountryTriggerHtml(selectedOpt.text, selectedOpt.value);
                syncTriggerCountry(selectedOpt);
            } else if (isBodyTypeSelect && selectedOpt) {
                trigger.querySelector('.custom-select-value').innerHTML = getBodyTypeTriggerHtml(selectedOpt.text, selectedOpt.value);
            } else if (selectedOpt && selectedOpt.dataset.icon) {
                trigger.querySelector('.custom-select-value').innerHTML = getIconTriggerHtml(selectedOpt.text, selectedOpt.dataset.icon, isIconOnly);
                if (isIconOnly) trigger.classList.add('is-icon-only');
            } else {
                trigger.querySelector('.custom-select-value').textContent = selectedText;
                if (isBrandSelect) syncTriggerBrand(null);
                if (isCountrySelect) syncTriggerCountry(null);
            }
        }
        // Highlight correct option
        optionsContainer.querySelectorAll('.custom-select-option').forEach((opt, idx) => {
            opt.classList.toggle('selected', idx === select.selectedIndex);
        });
    });

    if (window.lucide) window.lucide.createIcons({ scope: container });
}

export function closeAllMenus() {
    if (selectBackdrop) {
        selectBackdrop.classList.remove('active');
    }
    document.body.classList.remove('custom-select-sheet-open');
    document.querySelectorAll('.custom-select-container.open').forEach(container => {
        if (typeof container.__closeMenu === 'function') {
            container.__closeMenu();
        } else {
            container.classList.remove('open');
            const menu = container.querySelector('.custom-select-menu');
            const trigger = container.querySelector('.custom-select-trigger');
            if (menu) menu.classList.remove('open');
            if (trigger) trigger.classList.remove('open');
        }
    });
}

document.addEventListener('click', closeAllMenus);
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllMenus();
    }
});

let lastWindowWidth = window.innerWidth;
window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWindowWidth) {
        lastWindowWidth = window.innerWidth;
        closeAllMenus();
    }
});
