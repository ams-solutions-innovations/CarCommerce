import { COLLECTION_COLORS, getCollections, createCollectionFolder, updateCollectionFolder, deleteCollectionFolder, addListingToFolder, removeListingFromFolder, saveCollectionNote } from '../services/collectionsService.js';
import { collectionContext, text, money, price, title, image, openListingPicker, shareListings, failure, workspaceWarning } from '../components/autohub/collectionUi.js';
import { openAutoHubDialog } from '../components/autohub/dialog.js';
import { icon } from '../components/autohub/icons.js';
import { escHtml } from '../utils/escHtml.js';
import { renderCarCard, bindCardEvents } from './oglasi.js';
import { getBrandRgb } from '../data/brandColors.js';

export async function initCollectionsPage() {
    const context = await collectionContext();
    if (!context) return;

    let selected = new URLSearchParams(location.search).get('folder') || 'all';
    let query = '';
    let filter = 'all';
    let layout = 'grid';
    let sortOption = localStorage.getItem('autohub_collections_sort') || 'newest';
    let folderSort = localStorage.getItem('autohub_folders_sort') || 'recent';
    const selectedForCompare = new Set();

    const savedIds = () => context.data.favourites.map(item => String(item.listingId));

    const dropAmount = id => {
        const previous = context.data.favourites.find(item => String(item.listingId) === id)?.priceEur;
        const car = context.cars.get(id);
        const current = price(car || {});
        if (previous && car && !car.unrefreshed && current > 0 && current < previous) {
            return previous - current;
        }
        return 0;
    };

    const dropped = id => dropAmount(id) > 0;

    const isArchived = id => {
        const car = context.cars.get(id);
        return !car || car.unrefreshed || car.status === 'sold' || car.status === 'archived';
    };

    const folderForm = folder => `
        <label class="ah-form-field">
            ${text('ah_folder_name', 'Ime mape')}
            <input name="name" maxlength="80" required value="${escHtml(folder?.name || '')}" placeholder="${text('ah_folder_placeholder', 'Npr. Družinski SUV')}">
        </label>
        <fieldset class="ah-colors">
            <legend>${text('ah_color', 'Barva')}</legend>
            ${COLLECTION_COLORS.map((color, index) => `
                <label style="--folder-color:${color}">
                    <input type="radio" name="color" value="${color}" ${(folder?.color || COLLECTION_COLORS[0]) === color ? 'checked' : ''} aria-label="${text('ah_color', 'Barva')} ${index + 1}">
                    <span></span>
                </label>
            `).join('')}
        </fieldset>
    `;

    const newFolder = () => openAutoHubDialog({
        title: text('ah_new_folder', 'Nova mapa'),
        body: folderForm(),
        signal: context.signal,
        onSubmit: async values => {
            context.data = await createCollectionFolder(context.uid, Object.fromEntries(values));
            selected = context.data.folders.at(-1).id;
            draw();
        }
    });

    function getDominantFolderColor(folder) {
        if (folder.color && folder.color !== COLLECTION_COLORS[0]) return folder.color;
        const makes = (folder.listingIds || []).map(id => {
            const c = context.cars.get(id);
            return c?.make || c?.brand;
        }).filter(Boolean);
        if (!makes.length) return folder.color || COLLECTION_COLORS[0];
        const counts = {};
        for (const m of makes) counts[m] = (counts[m] || 0) + 1;
        const dominant = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
        const rgb = getBrandRgb(dominant);
        return rgb ? `rgb(${rgb})` : folder.color || COLLECTION_COLORS[0];
    }

    function sortCarList(carsList) {
        const sorted = [...carsList];
        if (sortOption === 'price_asc') {
            sorted.sort((a, b) => price(a) - price(b));
        } else if (sortOption === 'price_desc') {
            sorted.sort((a, b) => price(b) - price(a));
        } else if (sortOption === 'drop_desc') {
            sorted.sort((a, b) => dropAmount(b.id) - dropAmount(a.id));
        } else if (sortOption === 'mileage_asc') {
            sorted.sort((a, b) => (Number(a.mileageKm || a.mileage || 0)) - (Number(b.mileageKm || b.mileage || 0)));
        } else if (sortOption === 'year_desc') {
            sorted.sort((a, b) => (Number(b.year || 0)) - (Number(a.year || 0)));
        } else if (sortOption === 'best_value') {
            sorted.sort((a, b) => {
                const dA = dropAmount(a.id) / (price(a) || 1);
                const dB = dropAmount(b.id) / (price(b) || 1);
                if (dB !== dA) return dB - dA;
                return price(a) - price(b);
            });
        }
        return sorted;
    }

    function sortFoldersList(folderList) {
        const list = [...folderList];
        if (folderSort === 'name') {
            list.sort((a, b) => a.name.localeCompare(b.name, 'sl'));
        } else if (folderSort === 'count') {
            list.sort((a, b) => (b.listingIds?.length || 0) - (a.listingIds?.length || 0));
        } else {
            list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        }
        return list;
    }

    function draw() {
        if (context.signal.aborted) return;

        const folder = context.data.folders.find(item => item.id === selected);
        if (!folder && !['all', 'drops', 'notes', 'archive'].includes(selected)) selected = 'all';

        let baseIds = folder ? folder.listingIds : savedIds();
        if (selected === 'archive') {
            baseIds = savedIds().filter(isArchived);
        }

        const countAll = baseIds.length;
        const countDrops = baseIds.filter(dropped).length;
        const countNotes = baseIds.filter(id => Boolean(context.data.notes[id])).length;

        let filteredIds = baseIds.filter(id => {
            if (selected === 'drops' || filter === 'drops') {
                if (!dropped(id)) return false;
            }
            if (selected === 'notes' || filter === 'notes') {
                if (!context.data.notes[id]) return false;
            }
            const car = context.cars.get(id) || {};
            const searchHaystack = `${title(car)} ${car.make || ''} ${car.model || ''} ${context.data.notes[id] || ''}`.toLowerCase();
            return searchHaystack.includes(query.toLowerCase());
        });

        const rawCars = filteredIds.map(id => context.cars.get(id)).filter(Boolean);
        const sortedCars = sortCarList(rawCars);

        const heading = folder?.name || (
            selected === 'drops' ? text('ah_price_drops', 'Padci cen') :
            selected === 'notes' ? text('ah_with_notes', 'Z opombami') :
            selected === 'archive' ? text('ah_archive', 'Arhiv') :
            text('ah_all_saved', 'Vsi shranjeni')
        );

        history.replaceState(history.state, '', `/mape${folder ? `?folder=${encodeURIComponent(folder.id)}` : ''}`);

        const sortedFolders = sortFoldersList(context.data.folders);
        const allDropped = savedIds().filter(dropped);
        const allArchived = savedIds().filter(isArchived);

        // Top notification banner items
        const topDroppedCars = allDropped.slice(0, 2).map(id => context.cars.get(id)).filter(Boolean);
        const topDropText = topDroppedCars.map(c => `${title(c)} −${money(dropAmount(c.id))}`).join(', ');

        const bannersHtml = `
            <section class="ah-workspace-banners" aria-label="${text('ah_overview_banners', 'Novosti v mapah')}">
                <div class="ah-banner-card is-teal">
                    <span class="ah-banner-icon">${icon('trend')}</span>
                    <div>
                        <h2>${allDropped.length} ${text('ah_price_drops', 'padcev cen')}</h2>
                        <p>${topDropText ? escHtml(topDropText) : text('ah_no_drops_yet', 'Cene vaših shranjenih oglasov se niso spremenile.')}</p>
                        <button type="button" class="ah-banner-link" data-folder="drops">${text('ah_view_drops', 'Poglej padce')} ${icon('right')}</button>
                    </div>
                </div>
                <div class="ah-banner-card is-orange">
                    <span class="ah-banner-icon">${icon('archive')}</span>
                    <div>
                        <h2>${allArchived.length} ${text('ah_unavailable_listings', 'oglasov v arhivu')}</h2>
                        <p>${allArchived.length ? text('ah_sold_moved_archive', 'Oglasi so bili prodani ali arhivirani. Opombe so ohranjene.') : text('ah_all_available', 'Vsi shranjeni oglasi so trenutno aktivni.')}</p>
                        <button type="button" class="ah-banner-link" data-folder="archive">${text('ah_open_archive', 'Odpri arhiv')} ${icon('right')}</button>
                    </div>
                </div>
                <div class="ah-banner-card is-blue">
                    <span class="ah-banner-icon">${icon('board')}</span>
                    <div>
                        <h2>${context.data.boards.length} ${text('ah_boards', 'oglasnih desk')}</h2>
                        <p>${text('ah_boards_collaborate_copy', 'Sodelujte z družino ali prijatelji pri izbiri naslednjega avtomobila.')}</p>
                        <a href="/oglasne-deske" class="ah-banner-link">${text('ah_view_boards', 'Odpri deske')} ${icon('right')}</a>
                    </div>
                </div>
            </section>
        `;

        // Render Compare Matrix if layout is 'compare'
        const compareCars = sortedCars.filter(c => selectedForCompare.has(String(c.id)));
        const carsToCompare = compareCars.length >= 2 ? compareCars : sortedCars.slice(0, 4);

        let compareViewHtml = '';
        if (layout === 'compare' && carsToCompare.length >= 1) {
            const minPrice = Math.min(...carsToCompare.map(price).filter(p => p > 0));
            const minMileage = Math.min(...carsToCompare.map(c => Number(c.mileageKm || c.mileage || 9999999)));
            const maxYear = Math.max(...carsToCompare.map(c => Number(c.year || 0)));
            const maxPower = Math.max(...carsToCompare.map(c => Number(c.powerKw || 0)));

            const colTemplate = `minmax(120px, 1.1fr) repeat(${carsToCompare.length}, minmax(0, 1.3fr))`;

            compareViewHtml = `
                <div class="ah-quick-compare-wrapper">
                    <div class="ah-quick-compare-header">
                        <div>
                            <h3>${icon('compare')} ${text('ah_quick_compare', 'Hitra primerjava')}</h3>
                            <span>${text('ah_compare_winner_info', 'Najboljša vrednost v vsaki vrstici je obarvana zeleno.')}</span>
                        </div>
                        <button type="button" class="ah-pill" data-share-compare>${icon('share')}${text('ah_share_compare', 'Deli primerjavo')}</button>
                    </div>
                    <div class="ah-quick-compare-table" style="grid-template-columns: ${colTemplate};">
                        <div class="ah-cmp-row">
                            <div class="ah-cmp-cell ah-cmp-label"></div>
                            ${carsToCompare.map(c => `
                                <div class="ah-cmp-cell ah-cmp-card-cell">
                                    ${image(c)}
                                    <strong>${escHtml(title(c))}</strong>
                                    <button type="button" class="ah-text-button" data-compare-toggle="${escHtml(c.id)}" style="font-size:11px;color:#ef4444">${icon('close')} ${text('remove', 'Odstrani')}</button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="ah-cmp-row">
                            <div class="ah-cmp-cell ah-cmp-label">${text('price', 'Cena')}</div>
                            ${carsToCompare.map(c => {
                                const p = price(c);
                                const isWin = p > 0 && p === minPrice;
                                return `<div class="ah-cmp-cell ${isWin ? 'is-win' : ''}">${isWin ? icon('check') : ''}${money(p)}</div>`;
                            }).join('')}
                        </div>
                        <div class="ah-cmp-row">
                            <div class="ah-cmp-cell ah-cmp-label">${text('ah_price_evaluation', 'Ocena cene')}</div>
                            ${carsToCompare.map(c => {
                                const drop = dropAmount(c.id);
                                return `<div class="ah-cmp-cell">${drop > 0 ? `<span style="color:#0f766e;font-weight:700">−${money(drop)}</span>` : text('ah_price_unchanged', 'Nespremenjena')}</div>`;
                            }).join('')}
                        </div>
                        <div class="ah-cmp-row">
                            <div class="ah-cmp-cell ah-cmp-label">${text('mileage', 'Prevoženo')}</div>
                            ${carsToCompare.map(c => {
                                const km = Number(c.mileageKm || c.mileage || 0);
                                const isWin = km > 0 && km === minMileage;
                                return `<div class="ah-cmp-cell ${isWin ? 'is-win' : ''}">${isWin ? icon('check') : ''}${km ? `${km.toLocaleString('sl-SI')} km` : '/'}</div>`;
                            }).join('')}
                        </div>
                        <div class="ah-cmp-row">
                            <div class="ah-cmp-cell ah-cmp-label">${text('year', 'Letnik')}</div>
                            ${carsToCompare.map(c => {
                                const y = Number(c.year || 0);
                                const isWin = y > 0 && y === maxYear;
                                return `<div class="ah-cmp-cell ${isWin ? 'is-win' : ''}">${isWin ? icon('check') : ''}${y || '/'}</div>`;
                            }).join('')}
                        </div>
                        <div class="ah-cmp-row">
                            <div class="ah-cmp-cell ah-cmp-label">${text('power', 'Moč')}</div>
                            ${carsToCompare.map(c => {
                                const kw = Number(c.powerKw || 0);
                                const isWin = kw > 0 && kw === maxPower;
                                return `<div class="ah-cmp-cell ${isWin ? 'is-win' : ''}">${isWin ? icon('check') : ''}${kw ? `${kw} kW (${Math.round(kw * 1.36)} KM)` : '/'}</div>`;
                            }).join('')}
                        </div>
                        <div class="ah-cmp-row">
                            <div class="ah-cmp-cell ah-cmp-label">${text('fuel_trans', 'Gorivo / Menjalnik')}</div>
                            ${carsToCompare.map(c => `
                                <div class="ah-cmp-cell">${escHtml([c.fuel, c.transmission].filter(Boolean).join(' · ') || '/')}</div>
                            `).join('')}
                        </div>
                        <div class="ah-cmp-row">
                            <div class="ah-cmp-cell ah-cmp-label">${text('actions', 'Ogled')}</div>
                            ${carsToCompare.map(c => `
                                <div class="ah-cmp-cell">
                                    <a href="/oglas?id=${encodeURIComponent(c.id)}" class="ah-blue-button" style="padding:6px 14px;font-size:11px">${text('ah_open_listing', 'Odpri oglas')}</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        // Floating compare bar
        let floatingCompareBar = '';
        if (selectedForCompare.size > 0) {
            const selectedCars = [...selectedForCompare].map(id => context.cars.get(id)).filter(Boolean);
            const totalEur = selectedCars.reduce((sum, c) => sum + price(c), 0);
            floatingCompareBar = `
                <div class="ah-compare-floating-bar" role="region" aria-label="${text('ah_compare_bar', 'Primerjava oglasov')}">
                    <div class="ah-compare-bar-thumbs">
                        ${selectedCars.map(c => image(c)).join('')}
                    </div>
                    <div class="ah-compare-bar-info">
                        <strong>${selectedForCompare.size} ${text('ah_cars_selected', 'oglasov izbranih')}</strong>
                        <span>Skupaj ${money(totalEur)}. Primerjate lahko do 4 oglase.</span>
                    </div>
                    <div class="ah-compare-bar-actions">
                        <button type="button" class="ah-text-button" data-clear-compare>${text('ah_clear_selection', 'Počisti izbor')}</button>
                        <button type="button" class="ah-blue-button" data-run-compare>${icon('compare')}${text('ah_compare', 'Primerjaj')}</button>
                    </div>
                </div>
            `;
        }

        context.host.innerHTML = `
            <section class="ah-container ah-workspace">
                <div class="ah-breadcrumb">
                    <a href="/">${text('home', 'Domov')}</a> / ${text('ah_saved', 'Shranjeno')}
                </div>
                <div class="ah-workspace-heading">
                    <div>
                        <h1>${text('ah_my_folders', 'Moje mape')}</h1>
                        <p>${savedIds().length} ${text('ah_saved_listings', 'shranjenih oglasov')} · ${context.data.folders.length} ${text('ah_folders', 'map')}</p>
                        <p>${text('ah_folders_copy', 'Organizirajte izbiro, zabeležite vtise in primerjajte svoje favorite.')}</p>
                    </div>
                    <div class="ah-actions">
                        <a class="ah-pill" href="/oglasne-deske">${icon('board')}${text('ah_boards', 'Moje oglasne deske')}</a>
                        <button class="ah-blue-button" data-new-folder>${icon('plus')}${text('ah_new_folder', 'Nova mapa')}</button>
                    </div>
                </div>

                ${workspaceWarning(context)}
                ${bannersHtml}

                <div class="ah-folders-layout">
                    <aside class="ah-folder-sidebar">
                        <label class="ah-form-field">
                            <span class="sr-only">${text('search', 'Iskanje')}</span>
                            <input type="search" data-folder-search value="${escHtml(query)}" placeholder="${text('ah_search_notes', 'Išči po mapah in opombah …')}">
                        </label>
                        <button class="ah-folder-nav ${selected === 'all' ? 'is-active' : ''}" data-folder="all">
                            ${icon('heart')}<span>${text('ah_all_saved', 'Vsi shranjeni')}</span><b>${savedIds().length}</b>
                        </button>
                        
                        <h3>${text('ah_my_folders', 'Moje mape')}</h3>
                        ${sortedFolders.map(item => `
                            <button class="ah-folder-nav ${selected === item.id ? 'is-active' : ''}" data-folder="${item.id}" style="--folder-color:${getDominantFolderColor(item)}">
                                ${icon('folder')}<span>${escHtml(item.name)}</span><b>${item.listingIds.length}</b>
                            </button>
                        `).join('')}
                        <button class="ah-folder-nav" data-new-folder>${icon('plus')}<span>${text('ah_new_folder', 'Nova mapa')}</span></button>

                        <h3>${text('ah_smart_folders', 'Pametne mape')}</h3>
                        <button class="ah-folder-nav ${selected === 'drops' ? 'is-active' : ''}" data-folder="drops">
                            ${icon('trend')}<span>${text('ah_price_drops', 'Padci cen')}</span><b>${allDropped.length}</b>
                        </button>
                        <button class="ah-folder-nav ${selected === 'notes' ? 'is-active' : ''}" data-folder="notes">
                            ${icon('edit')}<span>${text('ah_with_notes', 'Z opombami')}</span><b>${Object.keys(context.data.notes).length}</b>
                        </button>
                        <button class="ah-folder-nav ${selected === 'archive' ? 'is-active' : ''}" data-folder="archive">
                            ${icon('archive')}<span>${text('ah_archive', 'Arhiv')}</span><b>${allArchived.length}</b>
                        </button>

                        <h3>${text('ah_boards', 'Oglasne deske')}</h3>
                        <a class="ah-folder-nav" href="/oglasne-deske">${icon('board')}<span>${text('ah_boards', 'Oglasne deske')}</span><b>${context.data.boards.length}</b></a>
                    </aside>

                    <div class="ah-folder-main">
                        <div class="ah-folder-grid-bar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px">
                            <div>
                                <span style="font-size:16px;font-weight:800;color:var(--ah-ink)">${text('ah_all_folders', 'Vse mape')}</span>
                                <p style="margin:2px 0 0;font-size:12px;color:var(--ah-muted)">${text('ah_brand_color_hint', 'Barva mape se samodejno prevzame po prevladujoči znamki.')}</p>
                            </div>
                            <div class="ah-sort-control">
                                <label for="ah-folder-sort-select">${icon('down')}</label>
                                <select id="ah-folder-sort-select" class="ah-sort-select" data-folder-sort>
                                    <option value="recent" ${folderSort === 'recent' ? 'selected' : ''}>${text('ah_sort_recent', 'Nazadnje spremenjeno')}</option>
                                    <option value="name" ${folderSort === 'name' ? 'selected' : ''}>${text('ah_sort_name', 'Po imenu')}</option>
                                    <option value="count" ${folderSort === 'count' ? 'selected' : ''}>${text('ah_sort_count', 'Število oglasov')}</option>
                                </select>
                            </div>
                        </div>

                        <div class="ah-folder-grid">
                            ${sortedFolders.map(item => {
                                const vehicles = item.listingIds.map(id => context.cars.get(id)).filter(Boolean);
                                const prices = vehicles.map(price).filter(Boolean);
                                const folderColor = getDominantFolderColor(item);
                                return `
                                    <button class="ah-folder-tile ${selected === item.id ? 'is-active' : ''}" data-folder="${item.id}" style="--folder-color:${folderColor}">
                                        <div class="ah-folder-collage">
                                            ${[0, 1, 2].map(index => vehicles[index] ? image(vehicles[index]) : `<div class="ah-photo-placeholder">${icon('car')}</div>`).join('')}
                                        </div>
                                        <div class="ah-folder-tile-body">
                                            <h3>${icon('folder')}${escHtml(item.name)}</h3>
                                            <p>${vehicles.length} ${text('ah_listings', 'oglasov')}${prices.length ? ` · ${money(Math.min(...prices))}–${money(Math.max(...prices))}` : ''}</p>
                                            <small>${icon('lock')}${text('ah_private_folder', 'Zasebna mapa')}</small>
                                        </div>
                                    </button>
                                `;
                            }).join('')}
                            <button class="ah-folder-add" data-new-folder>
                                ${icon('plus')}<strong>${text('ah_new_folder', 'Nova mapa')}</strong>
                                <span>${text('ah_new_folder_copy', 'Za vašo naslednjo izbiro')}</span>
                            </button>
                        </div>

                        <div class="ah-section-heading">
                            <div>
                                <h2>${heading}</h2>
                                <p>${sortedCars.length} ${text('ah_listings', 'oglasov')}</p>
                            </div>
                            <div class="ah-actions">
                                ${folder ? `
                                    <button class="ah-pill" data-add>${icon('plus')}${text('ah_add_listing', 'Dodaj oglas')}</button>
                                    <button class="ah-icon-button" data-edit aria-label="${text('ah_edit_folder', 'Uredi mapo')}">${icon('edit')}</button>
                                    <button class="ah-icon-button" data-delete aria-label="${text('ah_delete_folder', 'Izbriši mapo')}">${icon('trash')}</button>
                                ` : ''}
                                <button class="ah-icon-button" data-share aria-label="${text('ah_share_list', 'Deli seznam oglasov')}" ${filteredIds.length ? '' : 'disabled'}>${icon('share')}</button>
                            </div>
                        </div>

                        <div class="ah-collection-toolbar">
                            <div class="ah-segment">
                                <button data-filter="all" aria-pressed="${filter === 'all'}">${text('ah_all', 'Vsi')} <span class="ah-filter-count">${countAll}</span></button>
                                <button data-filter="drops" aria-pressed="${filter === 'drops'}">${icon('trend')}${text('ah_price_drops', 'Padec cene')} <span class="ah-filter-count">${countDrops}</span></button>
                                <button data-filter="notes" aria-pressed="${filter === 'notes'}">${icon('edit')}${text('ah_with_notes', 'Z opombo')} <span class="ah-filter-count">${countNotes}</span></button>
                            </div>
                            <div class="ah-segment">
                                <button data-layout="grid" aria-pressed="${layout === 'grid'}">${icon('grid')}${text('ah_grid', 'Mreža')}</button>
                                <button data-layout="list" aria-pressed="${layout === 'list'}">${icon('list')}${text('ah_list', 'Seznam')}</button>
                                <button data-layout="compare" aria-pressed="${layout === 'compare'}">${icon('compare')}${text('ah_compare', 'Primerjava')}</button>
                            </div>
                            <div class="ah-sort-control">
                                <label for="ah-sort-select">${text('ah_sort_by', 'Razvrsti:')}</label>
                                <select id="ah-sort-select" class="ah-sort-select" data-car-sort>
                                    <option value="newest" ${sortOption === 'newest' ? 'selected' : ''}>${text('ah_sort_newest', 'Nazadnje dodano')}</option>
                                    <option value="best_value" ${sortOption === 'best_value' ? 'selected' : ''}>${text('ah_sort_best_value', 'Najboljša vrednost')}</option>
                                    <option value="price_asc" ${sortOption === 'price_asc' ? 'selected' : ''}>${text('ah_sort_price_asc', 'Najnižja cena')}</option>
                                    <option value="price_desc" ${sortOption === 'price_desc' ? 'selected' : ''}>${text('ah_sort_price_desc', 'Najvišja cena')}</option>
                                    <option value="drop_desc" ${sortOption === 'drop_desc' ? 'selected' : ''}>${text('ah_sort_drop_desc', 'Največji padec cene')}</option>
                                    <option value="mileage_asc" ${sortOption === 'mileage_asc' ? 'selected' : ''}>${text('ah_sort_mileage_asc', 'Najmanj km')}</option>
                                    <option value="year_desc" ${sortOption === 'year_desc' ? 'selected' : ''}>${text('ah_sort_year_desc', 'Najnovejši letnik')}</option>
                                </select>
                            </div>
                        </div>

                        ${layout === 'compare' ? compareViewHtml : `
                            <div class="ah-collection-cars ${layout === 'list' ? 'is-list' : ''}">
                                ${sortedCars.length ? sortedCars.map(car => {
                                    const drop = dropAmount(car.id);
                                    const isChecked = selectedForCompare.has(String(car.id));
                                    return `
                                        <div class="ah-saved-car">
                                            <button type="button" class="ah-card-compare-check ${isChecked ? 'is-selected' : ''}" data-compare-toggle="${escHtml(car.id)}" aria-label="${text('ah_select_compare', 'Izberi za primerjavo')}">
                                                ${icon('check')}
                                            </button>
                                            ${car.unrefreshed ? `
                                                <div class="ah-unrefreshed-card">
                                                    ${image(car)}
                                                    <h3>${escHtml(title(car))}</h3>
                                                    <p>${text('ah_unrefreshed', 'Podatki trenutno niso osveženi.')}</p>
                                                    <a href="/oglas?id=${encodeURIComponent(car.id)}">${text('ah_open_listing', 'Odpri oglas')}</a>
                                                </div>
                                            ` : `
                                                ${renderCarCard(car)}
                                                ${drop > 0 ? `
                                                    <div class="ah-price-drop-pill">
                                                        ${icon('trend')}<span>−${money(drop)} od shranitve</span>
                                                    </div>
                                                ` : ''}
                                            `}
                                            <div class="ah-saved-actions">
                                                <button class="ah-pill" data-note="${escHtml(car.id)}">${icon('edit')}${text('ah_note', 'Opomba')}</button>
                                                ${folder ? `<button class="ah-icon-button" data-remove="${escHtml(car.id)}" aria-label="${text('ah_remove_from_folder', 'Odstrani iz mape')}">${icon('close')}</button>` : ''}
                                            </div>
                                            ${context.data.notes[car.id] ? `<p class="ah-saved-note">${escHtml(context.data.notes[car.id])}</p>` : ''}
                                        </div>
                                    `;
                                }).join('') : `
                                    <div class="ah-empty-state">
                                        ${icon('folder')}
                                        <h3>${text('ah_empty_folder', 'Tukaj še ni oglasov')}</h3>
                                        <p>${text('ah_empty_copy', 'Shranite oglase ali jih dodajte v svojo mapo.')}</p>
                                        <a class="ah-blue-button" href="/oglasi">${text('ah_find_listings', 'Poišči oglase')}</a>
                                    </div>
                                `}
                            </div>
                        `}

                        ${floatingCompareBar}
                    </div>
                </div>
            </section>
        `;

        if (layout !== 'compare') {
            bindCardEvents(context.host.querySelector('.ah-collection-cars'), sortedCars.filter(car => !car.unrefreshed));
        }
    }

    context.host.addEventListener('input', event => {
        if (!event.target.matches('[data-folder-search]')) return;
        query = event.target.value;
        const position = event.target.selectionStart;
        draw();
        const field = context.host.querySelector('[data-folder-search]');
        if (field) {
            field.focus();
            field.setSelectionRange(position, position);
        }
    }, { signal: context.signal });

    context.host.addEventListener('change', event => {
        if (event.target.matches('[data-car-sort]')) {
            sortOption = event.target.value;
            localStorage.setItem('autohub_collections_sort', sortOption);
            draw();
        } else if (event.target.matches('[data-folder-sort]')) {
            folderSort = event.target.value;
            localStorage.setItem('autohub_folders_sort', folderSort);
            draw();
        }
    }, { signal: context.signal });

    context.host.addEventListener('click', async event => {
        const button = event.target.closest('button, [data-folder]');
        if (!button) return;

        const folder = context.data.folders.find(item => item.id === selected);

        if (button.hasAttribute('data-new-folder')) {
            newFolder();
        } else if (button.dataset.compareToggle) {
            const id = String(button.dataset.compareToggle);
            if (selectedForCompare.has(id)) {
                selectedForCompare.delete(id);
            } else {
                if (selectedForCompare.size >= 4) {
                    alert(text('ah_compare_max_four', 'Za primerjavo lahko izberete največ 4 oglase.'));
                    return;
                }
                selectedForCompare.add(id);
            }
            draw();
        } else if (button.hasAttribute('data-clear-compare')) {
            selectedForCompare.clear();
            if (layout === 'compare') layout = 'grid';
            draw();
        } else if (button.hasAttribute('data-run-compare')) {
            layout = 'compare';
            draw();
        } else if (button.hasAttribute('data-share-compare')) {
            const ids = [...selectedForCompare];
            shareListings(context, ids.length ? ids : savedIds().slice(0, 4));
        } else if (button.dataset.folder) {
            selected = button.dataset.folder;
            filter = 'all';
            draw();
        } else if (button.dataset.filter) {
            filter = button.dataset.filter;
            draw();
        } else if (button.dataset.layout) {
            layout = button.dataset.layout;
            draw();
        } else if (button.hasAttribute('data-edit') && folder) {
            openAutoHubDialog({
                title: text('ah_edit_folder', 'Uredi mapo'),
                body: folderForm(folder),
                signal: context.signal,
                onSubmit: async values => {
                    context.data = await updateCollectionFolder(context.uid, folder.id, Object.fromEntries(values));
                    draw();
                }
            });
        } else if (button.hasAttribute('data-delete') && folder) {
            openAutoHubDialog({
                title: text('ah_delete_folder', 'Izbriši mapo'),
                body: `<p>${text('ah_delete_folder_copy', 'Izbrisana bo le mapa. Oglasi ostanejo med shranjenimi.')}</p>`,
                signal: context.signal,
                submitLabel: text('delete', 'Izbriši'),
                onSubmit: async () => {
                    context.data = await deleteCollectionFolder(context.uid, folder.id);
                    selected = 'all';
                    draw();
                }
            });
        } else if (button.hasAttribute('data-add') && folder) {
            openListingPicker(context, async car => {
                context.data = await addListingToFolder(context.uid, folder.id, car);
                draw();
            });
        } else if (button.dataset.note) {
            openAutoHubDialog({
                title: text('ah_note', 'Opomba'),
                body: `<label class="ah-form-field">${text('ah_your_note', 'Vaša opomba')}<textarea name="note" maxlength="2000" rows="5">${escHtml(context.data.notes[button.dataset.note] || '')}</textarea></label>`,
                signal: context.signal,
                onSubmit: async values => {
                    context.data = await saveCollectionNote(context.uid, button.dataset.note, values.get('note'));
                    draw();
                }
            });
        } else if (button.dataset.remove && folder) {
            button.disabled = true;
            try {
                context.data = await removeListingFromFolder(context.uid, folder.id, button.dataset.remove);
                draw();
            } catch (error) {
                failure(context, error);
                button.disabled = false;
            }
        } else if (button.hasAttribute('data-share')) {
            shareListings(context, folder ? folder.listingIds : savedIds());
        }
    }, { signal: context.signal });

    document.addEventListener('autohubFavouritesChanged', async event => {
        if (event.detail.uid !== context.uid) return;
        try {
            context.data = await getCollections(context.uid);
            draw();
        } catch (error) {
            failure(context, error);
        }
    }, { signal: context.signal });

    draw();
}
