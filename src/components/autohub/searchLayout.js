import { t } from '../../core/i18n.js';
import { icon } from './icons.js';
import { listingDisplayPrice } from './listingCard.js';

// Reuse the original inputs and their identifiers so URL/filter handlers retain
// one source of truth. Only the avto search page receives this layout.
export function enhanceSearchLayout(options = {}) {
    const layout=document.querySelector('.oglasi-layout');
    const form=document.getElementById('sidebarFiltersForm');
    if(!layout||!form||layout.classList.contains('ah-search-layout'))return;
    layout.classList.add('ah-search-layout');
    const top=document.createElement('section');top.className='ah-search-top';
    if (!options.hideBreadcrumb) {
        const crumbs=document.createElement('nav');crumbs.className='ah-search-breadcrumb';crumbs.setAttribute('aria-label',t('breadcrumb','Pot'));
        const breadcrumbLabel = options.breadcrumbLabel || (options.isAuctions ? t('nav_auctions', 'Dražbe vozil') : t('ah_search_results','Rezultati iskanja'));
        crumbs.innerHTML=`<a href="/">${t('home','Domov')}</a>${icon('right')}<span>${breadcrumbLabel}</span>`;
        top.append(crumbs);
    }
    const rHeader = layout.querySelector('.results-header');
    const aTopbar = document.getElementById('activeFiltersTopbar');
    if (rHeader) top.append(rHeader);
    if (aTopbar) top.append(aTopbar);
    layout.before(top);
    const filterHeader = document.querySelector('.sidebar-filters-header');
    if (filterHeader) {
        filterHeader.className = 'ah-sidebar-header';
        filterHeader.removeAttribute('style');
        filterHeader.innerHTML = `
            <div class="ah-sidebar-header-title">
                ${icon('sliders', 'ah-sidebar-header-icon')}
                <span data-i18n-key="sidebar_filters_title">${t('sidebar_filters_title', 'Filtri')}</span>
            </div>
            <button type="button" id="sidebarCollapseAllBtn" class="ah-sidebar-collapse-all-btn" aria-label="${t('collapse_all', 'Skrči vse')}" data-collapsed="false">
                <span class="ah-collapse-label" data-i18n-key="collapse_all">${t('collapse_all', 'Skrči vse')}</span>
                ${icon('down', 'ah-sidebar-collapse-icon')}
            </button>
        `;
    }
    const sections=[];
    const group=id=>document.getElementById(id)?.closest('.form-group');
    const taken=new Set();
    function section(title,ids,iconName='car',open=true){
        const node=document.createElement('div');node.className='adv-accordion';
        node.innerHTML=`<div class="adv-acc-header"><button type="button" class="adv-acc-trigger" aria-expanded="${open}"><span class="adv-acc-title">${icon(iconName,'ah-acc-icon')}<span>${title}</span></span>${icon('down','ah-acc-chevron')}</button></div><div class="adv-acc-body"><div class="adv-acc-body-inner"></div></div>`;
        const body=node.querySelector('.adv-acc-body-inner');
        ids.forEach(id=>{const field=group(id);if(field&&!taken.has(field)){taken.add(field);body.append(field);}});
        if(body.childElementCount)sections.push(node);
    }

    if (options.isAuctions) {
        section(t('nav_auctions', 'Dražba'), ['sidebarAucType', 'sidebarAucStatus', 'sidebarAucReserve', 'sidebarAucBinding', 'sidebarAucCash'], 'gavel', true);
    }

    section(t('ah_brand_model','Znamka in model'),['sidebarMake','sidebarModel','sidebarVariant','sidebarLine'],'car', true);
    const brandSectionBody = sections.find(s => s.querySelector('#sidebarMake'))?.querySelector('.adv-acc-body-inner');
    if (brandSectionBody) {
        const actionsRow = document.createElement('div');
        actionsRow.className = 'ah-sidebar-vehicle-actions';
        actionsRow.innerHTML = `
            <button type="button" id="sidebarAddVehicleBtn" class="ah-vehicle-action-btn ah-vehicle-add-btn">
                <span class="ah-btn-plus">+</span>
                <span data-i18n-key="adv_add_btn">${t('adv_add_btn', 'Dodaj')}</span>
            </button>
            <button type="button" id="sidebarExcludeVehicleBtn" class="ah-vehicle-action-btn ah-vehicle-exclude-btn" title="${t('adv_exclude_vehicle_title', 'Izloči izbrano vozilo iz rezultatov')}">
                <span class="ah-btn-ban">⊘</span>
                <span data-i18n-key="adv_exclude_btn">${t('adv_exclude_btn', 'Izloči')}</span>
            </button>
        `;
        const existingCards = document.getElementById('sidebarVehicleCards') || document.createElement('div');
        existingCards.id = 'sidebarVehicleCards';
        existingCards.className = 'ah-sidebar-vehicle-cards';
        existingCards.removeAttribute('style');

        const excludedWrap = document.createElement('div');
        excludedWrap.id = 'sidebarExcludedVehiclesSection';
        excludedWrap.className = 'ah-sidebar-excluded-section';
        excludedWrap.style.display = 'none';
        excludedWrap.innerHTML = `
            <div class="ah-sidebar-excluded-label">⊘ <span data-i18n-key="adv_excluded_vehicles">${t('adv_excluded_vehicles', 'Izločena vozila')}</span></div>
            <div id="sidebarExcludedVehicleCards" class="ah-sidebar-vehicle-cards"></div>
        `;
        brandSectionBody.append(actionsRow, existingCards, excludedWrap);
    }
    section(options.isAuctions ? t('ah_search_price_bid', 'Cena in ponudba') : t('ah_search_price','Cena'),['sidebarPriceFrom','sidebarPriceTo'],'tag', false);
    section(t('ah_search_year','Letnik in kilometri'),['sidebarYearFrom','sidebarYearTo','sidebarMileageTo'],'calendar', false);
    section(t('filter_fuel','Gorivo in pogon'),['sidebarFuelHibrid','sidebarFuel','sidebarDriveType','sidebarTransmission'],'fuel', false);
    section(t('cl_label_body_type','Karoserija'),['sidebarBodyType'],'grid', false);
    section(t('location','Lokacija'),['sidebarCountry','sidebarRegion'],'pin', false);

    // Keep all category-specific engine fields and the original filter options.
    const original=[...form.querySelectorAll('.adv-accordion')];
    for(const node of original){
        const body=node.querySelector('.adv-acc-body-inner');
        if(body?.querySelector('input,select'))sections.push(node);
    }
    const resetBtn = document.getElementById('sidebarResetBtn');
    const advSearchBtn = document.getElementById('drazbeSidebarAdvBtn');
    const footer = document.createElement('div');
    footer.className = 'ah-sidebar-footer';
    if (advSearchBtn) {
        advSearchBtn.className = 'ah-sidebar-adv-btn';
        advSearchBtn.removeAttribute('style');
        advSearchBtn.innerHTML = `${icon('sliders', 'ah-icon')}<span>${t('nav_advanced_search_auctions', 'Napredno iskanje dražb')}</span>`;
        footer.append(advSearchBtn);
    }
    if (resetBtn) {
        resetBtn.removeAttribute('style');
        resetBtn.removeAttribute('data-i18n-key');
        resetBtn.innerHTML = `${icon('reset')}<span data-i18n-key="sidebar_reset">${t('sidebar_reset', 'Ponastavi')}</span>`;
        footer.append(resetBtn);
    }
    form.replaceChildren(...sections, footer);
    const priceField=document.getElementById('sidebarPriceTo');
    if(priceField){
        const priceBody=priceField.closest('.adv-acc-body-inner');
        const chart=document.createElement('div');chart.className='ah-search-price-chart';chart.setAttribute('aria-hidden','true');
        const range=document.createElement('input');range.type='range';range.className='ah-search-price-range';range.min='0';range.max='500000';range.step='100';range.setAttribute('aria-label',t('ah_search_max_price','Najvišja cena'));
        range.addEventListener('input',()=>{priceField.value=range.value;priceField.dispatchEvent(new Event('input',{bubbles:true}));});
        priceField.addEventListener('input',()=>{range.value=priceField.value.replace(/\D/g,'')||range.max;});
        priceBody.prepend(chart,range);
    }
    const bodySelect=document.getElementById('sidebarBodyType');
    if(bodySelect){
        const tiles=document.createElement('div');tiles.className='ah-search-body-tiles';
        const shapes=[['Limuzina','dac15b24c64a4c96063768274c2416d1.svg'],['Karavan','f651b91c8ef360202df783be6b03eeb5.svg'],['SUV','a2007272c1633d9ea61164607b88d5de.svg'],['Kombilimuzina','9ce576494b3d76568df65f7beeb3c9e2.svg'],['Coupe','066a949bc40bb4da4ac61cfbaf7c6a78.svg'],['Kabriolet','b27642fd338841fdb35c6a672c5be70f.svg']];
        const resolveTarget=(val)=>{
            const hasSuv=[...bodySelect.options].some(opt=>opt.value==='SUV');
            return (val==='SUV'&&!hasSuv)?'Terensko':val;
        };
        const getActiveBodyList=()=>{
            if(Array.isArray(window._sidebarBodyTypes))return window._sidebarBodyTypes;
            const raw=bodySelect.dataset.multiValue??bodySelect.value??'';
            return raw.split(',').map(s=>s.trim()).filter(Boolean);
        };
        shapes.forEach(([value,file])=>{
            const button=document.createElement('button');button.type='button';button.dataset.body=value;button.setAttribute('aria-pressed','false');
            button.innerHTML=`<span><img src="/brand/autohub/${file}" alt=""></span>${value}`;
            button.addEventListener('click',()=>{
                const target=resolveTarget(value);
                if(typeof window._toggleSidebarBodyType==='function'){
                    window._toggleSidebarBodyType(target);
                }else{
                    const current=getActiveBodyList();
                    const exists=current.includes(target)||(value==='SUV'&&current.includes('Terensko'));
                    const next=exists?current.filter(x=>x!==target&&!(value==='SUV'&&x==='Terensko')):[...current,target];
                    window._sidebarBodyTypes=next;
                    bodySelect.dataset.multiValue=next.join(',');
                    bodySelect.value=next[next.length-1]||'';
                    bodySelect._syncCustomSelect?.();
                    bodySelect.dispatchEvent(new Event('change',{bubbles:true}));
                }
            });
            tiles.append(button);
        });
        const sync=()=>{
            const activeList=getActiveBodyList();
            tiles.querySelectorAll('button').forEach(button=>{
                const bVal=button.dataset.body;
                const target=resolveTarget(bVal);
                const matches=activeList.includes(target)||activeList.includes(bVal)||(bVal==='SUV'&&activeList.includes('Terensko'));
                button.setAttribute('aria-pressed',String(matches));
            });
        };
        bodySelect._syncBodyTiles=sync;
        bodySelect.addEventListener('change',sync);bodySelect.before(tiles);
        sync();
    }
    const remainingBasic=sections.find(node=>node.querySelector('#sidebarOnlySale'));
    if(remainingBasic){
        const title=remainingBasic.querySelector('.adv-acc-title');
        if(title){title.removeAttribute('data-i18n-key');title.textContent=t('ah_special_features','Posebnosti');}
    }
    sections.forEach(acc=>{
        const trigger=acc.querySelector('.adv-acc-trigger');
        if(!trigger||trigger.querySelector('.ah-acc-chevron'))return;
        const titleEl=trigger.querySelector('.adv-acc-title');
        const titleText=(titleEl?titleEl.textContent:trigger.textContent).trim();
        let iconName='sliders';
        if(acc.querySelector('#sidebarOnlySale'))iconName='spark';
        else if(acc.querySelector('#sidebarAucType'))iconName='gavel';
        else if(titleText.toLowerCase().includes('motor'))iconName='gear';
        else if(titleText.toLowerCase().includes('prodajalec')||titleText.toLowerCase().includes('lokacija'))iconName='pin';
        const isOpen=trigger.getAttribute('aria-expanded')==='true';
        trigger.innerHTML=`<span class="adv-acc-title">${icon(iconName,'ah-acc-icon')}<span>${titleText}</span></span>${icon('down','ah-acc-chevron')}`;
        trigger.setAttribute('aria-expanded',String(isOpen));
    });
    form.querySelectorAll('.adv-acc-body-inner').forEach(body=>{
        const labels=body.querySelectorAll('.form-group>label:not(.adv-chip)');
        if(labels.length===1&&labels[0].textContent.trim()===body.closest('.adv-accordion').querySelector('.adv-acc-title').textContent.trim())labels[0].classList.add('ah-search-redundant-label');
    });
    document.querySelectorAll('.view-toggle-btn').forEach(button=>{
        const label=document.createElement('span');label.textContent=button.dataset.view==='list'?t('list_view','Seznam'):t('grid_view','Mreža');button.append(label);
    });
}

export function updateSearchPriceDistribution(cars) {
    const chart=document.querySelector('.ah-search-price-chart');if(!chart)return;
    const prices=cars.map(listingDisplayPrice).filter(price=>price>0);
    const max=Math.ceil(Math.max(10000,...prices)/10000)*10000;
    const bins=Array(24).fill(0);prices.forEach(price=>bins[Math.min(23,Math.floor(price/max*24))]++);
    const peak=Math.max(1,...bins);chart.replaceChildren(...bins.map(count=>{const bar=document.createElement('i');bar.style.height=`${count/peak*100}%`;return bar;}));
    const range=document.querySelector('.ah-search-price-range');range.max=String(max);range.value=document.getElementById('sidebarPriceTo').value.replace(/\D/g,'')||String(max);
}
