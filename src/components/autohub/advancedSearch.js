import { t } from '../../core/i18n.js';
import { key as lsKey } from '../../config/storageKeys.js';
import { icon } from './icons.js';
import { escHtml } from '../../utils/escHtml.js';
import { parseFormattedNumber } from '../../utils/inputFormatters.js';
import { addFilterSectionNavigation } from './responsive.js';

export function prepareAutoHubAdvancedSearch(){
    const host=document.querySelector('.search-container');if(!host)return;
    const isAuctions=host.dataset.searchKind==='auctions';
    host.classList.add('ah-advanced-search');
    queueMicrotask(() => addFilterSectionNavigation(host.querySelector('form')));
    host.querySelectorAll('.ah-vehicle-art').forEach(image=>{const frame=document.createElement('span');frame.className='ah-vehicle-art-frame';image.before(frame);frame.append(image);});
    const exterior=host.querySelector('[name="color"]')?.closest('.adv-accordion');
    if(exterior){
        const color=document.createElement('div');color.className='adv-accordion glass-card';color.id='acc-color';
        color.innerHTML=`<div class="adv-acc-header"><button type="button" class="adv-acc-trigger"><span class="adv-acc-title">${icon('palette')}${escHtml(t('ah_colour','Barva'))}</span><span class="adv-acc-chevron">${icon('down')}</span></button><label class="remember-toggle"><span class="toggle-label">${escHtml(t('ah_remember','Zapomni'))}</span><input type="checkbox" class="remember-check" data-category="barva"><span class="toggle-slider"></span></label></div><div class="adv-acc-body"></div>`;
        const body=color.querySelector('.adv-acc-body');
        body.append(exterior.querySelector('[name="color"]').closest('.adv-field-group'),exterior.querySelector('[name="paintwork"]').closest('.adv-field-group'));
        exterior.before(color);exterior.classList.add('car-only-field');
    }
    const engine=host.querySelector('#acc-engine .adv-acc-body');
    if(engine){
        const field=(name,key,fallback,unit)=>`<div class="adv-field-group"><label class="adv-label" for="ah-${name}">${escHtml(t(key,fallback))} (${unit})</label><input type="number" id="ah-${name}" name="${name}" min="0" step="1" class="adv-input" placeholder="${escHtml(t('ah_unlimited','Brez omejitve'))}"></div>`;
        const electric=document.createElement('div');electric.className='ah-electric-filters car-only-field';electric.hidden=true;
        electric.innerHTML=`<h3>${icon('fuel')}${escHtml(t('ah_electric_drive','Električni pogon'))}</h3><div class="adv-grid-2">${field('rangeKmFrom','ah_wltp_range','Domet WLTP od','km')}${field('batteryKwhFrom','ah_battery_capacity','Kapaciteta baterije od','kWh')}</div><div class="adv-grid-2"><div class="adv-field-group"><label class="adv-label">${escHtml(t('ah_charge_time','Polnjenje 0–80 %'))}</label><select name="chargeTimeTo" class="glass-select"><option value="">${escHtml(t('ah_all','Vsi'))}</option>${[20,30,45].map(value=>`<option value="${value}">${value} min</option>`).join('')}</select></div><div class="adv-field-group"><label class="adv-label">${escHtml(t('ah_connector','Priključek'))}</label><div class="adv-chip-group">${['CCS2','Type 2','CHAdeMO','Tesla (NACS)'].map(value=>`<label class="adv-chip"><input type="checkbox" name="connector" value="${value}">${value}</label>`).join('')}</div></div></div>`;
        const power=engine.querySelector('.power-unit-toggle-wrapper');if(power)power.before(electric);else engine.prepend(electric);
        const sync=()=>{const selected=[...host.querySelectorAll('[name="fuel"]:checked')].map(el=>el.value);const active=host.querySelector('[data-tab].active')?.dataset.tab;electric.hidden=active==='moto'||!selected.some(value=>['Elektrika','Electric','Plug-in hibrid','Priključni hibrid'].includes(value));};
        host.addEventListener('change',sync);host.addEventListener('click',()=>queueMicrotask(sync));sync();
    }
    if(isAuctions){
        host.insertAdjacentHTML('afterbegin',`<div class="ah-breadcrumb"><a href="/">${escHtml(t('home','Domov'))}</a> / <a href="/drazbe">${escHtml(t('nav_auctions','Dražbe'))}</a> / ${escHtml(t('ah_advanced_auctions_title','Napredno iskanje dražb'))}</div><div class="ah-advanced-heading" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;"><div><h1>${escHtml(t('ah_advanced_auctions_title','Napredno iskanje dražb'))}</h1><p>${escHtml(t('ah_auctions_search_copy','Filtrirajte dražbe po vrsti dražbe, rezervni ceni, času do zaključka in tehničnih podatkih vozila.'))}</p></div><a href="/drazbe" class="ah-pill" style="align-self:center;">${icon('gavel')}<span>${escHtml(t('ah_all_active_auctions','Vse aktivne dražbe'))}</span></a></div>`);
    } else {
        host.insertAdjacentHTML('afterbegin',`<div class="ah-breadcrumb"><a href="/">${escHtml(t('home','Domov'))}</a> / <a href="/oglasi">${escHtml(t('header_listings','Oglasi'))}</a> / ${escHtml(t('ah_advanced_title','Napredno iskanje'))}</div><div class="ah-advanced-heading"><h1>${escHtml(t('ah_advanced_title','Napredno iskanje'))}</h1><p>${escHtml(t('ah_remember_copy','Pri vsakem razdelku lahko vklopite ZAPOMNI in izbrani filtri ostanejo shranjeni za naslednji obisk v tem brskalniku.'))}</p></div>`);
    }
    const vehicleTabs=host.querySelector('#vehicleTypeTabs');
    if(vehicleTabs){
        const categoryItems=[...vehicleTabs.querySelectorAll('.tab-btn')];
        const activeTab=()=>categoryItems.find(button=>button.classList.contains('active'))||categoryItems[0];
        const picker=document.createElement('button');picker.type='button';picker.className='ah-category-picker ah-advanced-category-picker';picker.setAttribute('aria-haspopup','dialog');picker.setAttribute('aria-expanded','false');
        picker.innerHTML=`<span class="ah-category-picker-icon">${icon('car')}</span><span class="ah-category-picker-copy"><small>${escHtml(t('ah_vehicle_type','Vrsta vozila'))}</small><strong></strong></span>${icon('down','ah-category-picker-chevron')}`;
        const dialog=document.createElement('dialog');dialog.className='ah-category-sheet ah-advanced-category-sheet';dialog.setAttribute('aria-label',t('ah_vehicle_type','Vrsta vozila'));
        dialog.innerHTML=`<div class="ah-category-sheet-handle" aria-hidden="true"></div><div class="ah-category-sheet-heading"><h2>${escHtml(t('ah_vehicle_type','Vrsta vozila'))}</h2><button type="button" class="ah-icon-button" aria-label="${escHtml(t('close','Zapri'))}">${icon('close')}</button></div><div class="ah-category-sheet-options"></div>`;
        const options=dialog.querySelector('.ah-category-sheet-options');
        const selectedLabel=picker.querySelector('strong');
        const glyphs=['car','bike','truck','tent'];
        const sync=()=>{const active=activeTab();selectedLabel.textContent=active?.textContent.trim()||'';options.querySelectorAll('.ah-category-choice').forEach((choice,index)=>{const isActive=categoryItems[index]===active;choice.classList.toggle('active',isActive);choice.setAttribute('aria-pressed',String(isActive));});};
        categoryItems.forEach((tab,index)=>{const choice=document.createElement('button');choice.type='button';choice.className=`ah-category-choice${tab.classList.contains('active')?' active':''}`;choice.setAttribute('aria-pressed',String(tab.classList.contains('active')));choice.innerHTML=`${icon(glyphs[index]||'car')}<span></span>${icon('check')}`;choice.querySelector('span').textContent=tab.textContent.trim();choice.addEventListener('click',()=>{tab.click();sync();dialog.close();});options.append(choice);tab.addEventListener('click',sync);});
        dialog.querySelector('.ah-category-sheet-heading button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>picker.setAttribute('aria-expanded','false'));picker.addEventListener('click',()=>{sync();dialog.showModal();picker.setAttribute('aria-expanded','true');});
        vehicleTabs.after(picker,dialog);sync();
    }
    host.querySelectorAll('.adv-accordion').forEach((acc,index)=>{
        acc.classList.remove('persistent-open');
        const trigger=acc.querySelector('.adv-acc-trigger');const body=acc.querySelector('.adv-acc-body');
        if(!trigger||!body)return;
        body.id=`ah-advanced-section-${index}`;trigger.setAttribute('aria-controls',body.id);
        const open=index===0;trigger.setAttribute('aria-expanded',String(open));acc.setAttribute('aria-expanded',String(open));body.style.display=open?'flex':'none';
        trigger.querySelector('.adv-acc-chevron')?.style.removeProperty('display');
        trigger.insertAdjacentHTML('beforeend','<span class="ah-section-count" aria-label="Selected filters" hidden></span>');
    });
    const form=host.querySelector('form');
    const cityInput=form.querySelector('[name="city"]');
    if(cityInput){const quick=document.createElement('div');quick.className='ah-quick-cities';quick.innerHTML=`<span>${escHtml(t('ah_quick_city','Hitra izbira mesta'))}</span>${['Ljubljana','Maribor','Celje','Koper','Kranj','Novo mesto'].map(city=>`<button type="button" class="ah-pill">${city}</button>`).join('')}<small>${escHtml(t('ah_radius_hint','Radij merimo od središča kraja za oglase z označeno lokacijo. Ostale iščemo po imenu kraja.'))}</small>`;cityInput.closest('.adv-grid-2')?.after(quick);quick.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;cityInput.value=button.textContent;cityInput.dispatchEvent(new Event('input',{bubbles:true}));});}
    const powerGrid=form.querySelector('[name="powerFrom"]')?.closest('.adv-grid-2');
    const displacementGrid=form.querySelector('[name="displacementFrom"]')?.closest('.adv-grid-2');
    if(powerGrid&&displacementGrid){const group=document.createElement('div');group.className='ah-engine-ranges';powerGrid.before(group);group.append(powerGrid,displacementGrid);}
    const price=form.querySelector('[name="priceFrom"]')?.closest('.adv-grid-2');
    const startPrice=form.querySelector('[name="startPriceFrom"]')?.closest('.adv-grid-2');
    const year=form.querySelector('[name="yearFrom"]')?.closest('.adv-grid-2');
    const mileage=form.querySelector('[name="mileageFrom"]')?.closest('.adv-grid-2');
    if(price&&year&&mileage){const ranges=document.createElement('div');ranges.className='ah-basic-ranges';price.before(ranges);ranges.append(...[price,startPrice,year,mileage].filter(Boolean));}
    const rangeSpecs=[['priceFrom','priceTo',0,300000,1000,'€'],['startPriceFrom','startPriceTo',0,300000,1000,'€'],['yearFrom','yearTo',1980,new Date().getFullYear(),1,''],['mileageFrom','mileageTo',0,300000,5000,'km'],['powerFrom','powerTo',0,600,5,'kW'],['displacementFrom','displacementTo',0,6000,100,'ccm'],['seatsFrom','seatsTo',1,9,1,'']];
    rangeSpecs.forEach(([from,to,min,max,step,unit])=>{
        const low=form.querySelector(`[name="${from}"]`);const high=form.querySelector(`[name="${to}"]`);const parent=low?.closest('.adv-grid-2');if(!low||!high||!parent)return;
        const row=document.createElement('div');row.className='ah-range-control';
        const headings={priceFrom:isAuctions?['ah_current_bid','Trenutna ponudba']:['ah_price','Cena'],startPriceFrom:['ah_start_price','Izklicna cena'],yearFrom:['ah_registration','1. registracija'],mileageFrom:['ah_mileage','Prevoženi kilometri'],powerFrom:['ah_engine_power','Moč motorja'],displacementFrom:['ah_displacement','Prostornina motorja'],seatsFrom:['ah_seats','Število sedežev']};
        const [key,fallback]=headings[from];
        row.innerHTML=`<div class="ah-range-heading"><strong>${escHtml(t(key,fallback))}</strong><span data-range-summary></span><small>${unit}</small></div><div class="ah-dual-range"><input type="range" min="${min}" max="${max}" step="${step}" value="${min}" aria-label="${escHtml(low.closest('.adv-field-group')?.querySelector('label')?.textContent||from)}"><input type="range" min="${min}" max="${max}" step="${step}" value="${max}" aria-label="${escHtml(high.closest('.adv-field-group')?.querySelector('label')?.textContent||to)}"></div><div class="ah-range-ticks"><span>${min.toLocaleString('sl-SI')}</span><span>${Math.round((min+max)/2).toLocaleString('sl-SI')}</span><span>${max.toLocaleString('sl-SI')}+</span></div>`;
        parent.prepend(row);parent.classList.add('ah-has-range');
        const sliders=row.querySelectorAll('input');
        const sync=()=>{const a=low.value?parseFormattedNumber(low.value):min;const b=high.value?parseFormattedNumber(high.value):max;sliders[0].value=a;sliders[1].value=b;row.querySelector('[data-range-summary]').textContent=low.value||high.value?`${a.toLocaleString('sl-SI')} – ${b.toLocaleString('sl-SI')}`:t('ah_unlimited','Brez omejitve');low.setCustomValidity(a>b?t('ah_invalid_range','Spodnja meja mora biti manjša od zgornje.'): '');};
        sliders.forEach((slider,index)=>slider.addEventListener('input',()=>{const input=index?high:low;const other=Number(sliders[index?0:1].value);if(index&&Number(slider.value)<other||!index&&Number(slider.value)>other)slider.value=other;input.value=slider.value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));sync();}));
        low.addEventListener('input',sync);high.addEventListener('input',sync);low.addEventListener('change',sync);high.addEventListener('change',sync);sync();
    });
    const equipment=form.querySelector('#car-equipment-chips')?.closest('.adv-acc-body');
    if(equipment){equipment.insertAdjacentHTML('afterbegin',`<label class="ah-equipment-search">${icon('search')}<input type="search" data-equipment-search placeholder="${escHtml(t('ah_find_equipment','Poiščite opremo …'))}"></label>`);form.querySelector('[data-equipment-search]').addEventListener('input',event=>{const query=event.target.value.toLowerCase();equipment.querySelectorAll('.adv-chip').forEach(chip=>{chip.hidden=!chip.textContent.toLowerCase().includes(query);});});}
    if(equipment){
        function compact(){equipment.querySelectorAll('[data-eq-group]').forEach(group=>{
            if(group.dataset.ahCompact)return;group.dataset.ahCompact='true';
            const chips=[...group.querySelectorAll('.adv-chip')];if(chips.length<=5)return;
            const more=document.createElement('button');more.type='button';more.className='ah-equipment-more';
            let expanded=false;
            function draw(){const query=form.querySelector('[data-equipment-search]').value.toLowerCase();chips.forEach((chip,index)=>{chip.hidden=query?!chip.textContent.toLowerCase().includes(query):index>=5&&!expanded&&!chip.querySelector('input')?.checked;});more.textContent=expanded?t('ah_show_less','Prikaži manj'):`+ ${t('ah_more','še')} ${chips.slice(5).filter(chip=>!chip.querySelector('input')?.checked).length}`;more.setAttribute('aria-expanded',String(expanded));more.hidden=!!query;}
            more.addEventListener('click',()=>{expanded=!expanded;draw();});group.append(more);form.addEventListener('change',draw);form.querySelector('[data-equipment-search]').addEventListener('input',draw);draw();
        });}
        const observer=new MutationObserver(compact);observer.observe(equipment,{childList:true,subtree:true});compact();
        document.addEventListener('beforeRouteChange',()=>observer.disconnect(),{once:true});
    }
}

export function installAdvancedSearchMemory({form,getCategory,getState,setState,onChange,signal}){
    let restoring=false;let pending=null;
    const sections=[...form.querySelectorAll('.adv-accordion')];
    const extras=section=>section.querySelector('#vehicleSelectorRow')?['vehicles','excludedVehicles']:section.id==='acc-engine'?['cylFilters']:[];
    const fields=(section)=>new Set([...section.querySelectorAll('[name]')].map(el=>el.name).concat(extras(section)));
    const storage=(section)=>lsKey(`advanced_${getCategory()}_${section.querySelector('.remember-check[data-category]')?.dataset.category}`);
    function persist(){
        if(restoring||signal.aborted)return;
        const state=getState();
        sections.forEach((section,index)=>{
            const toggle=section.querySelector('.remember-check[data-category]');if(!toggle)return;
            if(toggle.checked){const names=fields(section,index);const saved=new URLSearchParams([...state].filter(([key])=>names.has(key)));localStorage.setItem(storage(section),saved.toString());}
            else localStorage.removeItem(storage(section));
        });
        summarize();
    }
    function summarize(){sections.forEach(section=>{
        const controls=[...section.querySelectorAll('input[name],select[name]')].filter(el=>!el.disabled&&el.type!=='hidden'&&(el.type==='checkbox'||el.type==='radio'?el.checked:el.value));
        const badge=section.querySelector('.ah-section-count');if(badge){badge.textContent=controls.length;badge.hidden=!controls.length;}
    });}
    async function restore(includeUrl=false){
        restoring=true;
        const params=new URLSearchParams();
        sections.forEach(section=>{const toggle=section.querySelector('.remember-check[data-category]');if(!toggle)return;const saved=localStorage.getItem(storage(section));toggle.checked=saved!==null;if(saved!==null)for(const [key,value] of new URLSearchParams(saved))params.set(key,value);});
        if(includeUrl)for(const [key,value] of new URLSearchParams(location.search))params.set(key,value);
        await setState(params);restoring=false;summarize();onChange();
    }
    const queue=()=>{clearTimeout(pending);pending=setTimeout(persist,0);};
    form.addEventListener('input',queue,{signal});form.addEventListener('change',queue,{signal,capture:true});form.addEventListener('click',queue,{signal});
    form.addEventListener('reset',()=>{if(restoring)return;setTimeout(()=>{if(signal.aborted)return;form.querySelectorAll('input[type="hidden"]').forEach(el=>{if(!['cat','sub','searchType','vtype','najem'].includes(el.name))el.value='';});form.querySelectorAll('.unit-btn').forEach(el=>el.classList.toggle('active',el.dataset.unit==='kw'||el.dataset.a2==='all'));form.querySelectorAll('.remember-check[data-category]').forEach(el=>{el.checked=false;});persist();form.querySelectorAll('input[name],select[name]').forEach(el=>el.dispatchEvent(new Event('change',{bubbles:true})));},1);},{signal});
    signal.addEventListener('abort',()=>clearTimeout(pending),{once:true});
    return {restore,persist,suspend:()=>{restoring=true;clearTimeout(pending);}};
}
