import { key as lsKey } from '../config/storageKeys.js';
import { openAutoHubDialog } from '../components/autohub/dialog.js';
import { getAllBusinesses,getDistance } from '../services/businessService.js';
import { BUSINESS_TYPES,businessType,businessIcon } from '../components/autohub/businessIcons.js';
import { icon } from '../components/autohub/icons.js';
import { text } from '../components/autohub/collectionUi.js';
import { escHtml } from '../utils/escHtml.js';
import { PLATFORM } from '../config/platform.js';
import { navigateTo } from '../router.js';

export function initBusinessDirectoryPage({mapPage=false}={}){
    if(PLATFORM.id!=='avto'){navigateTo('/zemljevid');return;}
    const host=document.getElementById('app-container');const controller=new AbortController();
    const businesses=getAllBusinesses();let remembered=null;try{remembered=JSON.parse(localStorage.getItem(lsKey('business_map_area')));}catch{/* Default area. */}
    const params=new URLSearchParams(location.search||(mapPage&&remembered?.filters)||'');
    const state={query:params.get('q')||'',type:params.get('type')||'',city:params.get('city')||'',brand:params.get('brand')||'',radius:params.get('radius')||'50',mode:params.get('mode')||'split',authorized:params.has('authorized'),leasing:params.has('leasing'),storage:params.has('storage'),booking:params.has('booking'),rated:params.has('rated')};
    const cities=[...new Set(businesses.map(b=>b.location.city))].sort();
    const brands=[...new Set(businesses.flatMap(b=>b.authorizedBrands||[]))].sort();
    let map=null;let layer=null;let selected=null;let userOrigin=null;let observer=null;let visible=[];const markersMap=new Map();
    document.addEventListener('beforeRouteChange',()=>{controller.abort();observer?.disconnect();map?.remove();},{once:true,signal:controller.signal});
    const typePill=type=>{const value=businessType(type);return `<span class="ah-business-type" style="--type-rgb:${value.rgb};--ac:rgb(${value.rgb});--af:rgba(${value.rgb},.16)">${businessIcon(value.icon)}${escHtml(value.label)}</span>`;};
    const options=(values,current,first)=>`<option value="">${first}</option>${values.map(value=>`<option value="${escHtml(value)}" ${value===current?'selected':''}>${escHtml(value)}</option>`).join('')}`;
    host.innerHTML=`<section class="ah-container ah-workspace ah-directory ${mapPage?'ah-business-map-page':''}"><div class="ah-breadcrumb"><a href="/">${text('home','Domov')}</a> / ${text('ah_directory','Avtohiše in servisi')}</div><div class="ah-workspace-heading"><div><h1>${mapPage?text('map_title','Zemljevid'):text('ah_directory','Avtohiše in servisi')}</h1><p>${businesses.length} ${text('ah_businesses_copy','podjetij za vaš avto. Izberite pravega partnerja.')}</p></div><div class="ah-actions">${mapPage?`<label class="ah-product-switch">${text('vm_remember','Zapomni si območje')}<input type="checkbox" data-remember-area ${remembered?'checked':''}></label><button class="ah-pill" data-map-filters>${icon('sliders')}${text('sidebar_filters_title','Filtri')}</button>`:''}<div class="ah-segment"><button data-directory-mode="list" aria-pressed="${state.mode==='list'}">${icon('list')}${text('ah_list','Seznam')}</button><button data-directory-mode="split" aria-pressed="${state.mode!=='list'}">${icon('pin')}${mapPage?text('map_title','Zemljevid'):text('ah_list_map','Seznam + zemljevid')}</button></div></div></div><form class="ah-directory-search"><label class="ah-form-field">${text('ah_company_search','Podjetje ali storitev')}<input name="q" type="search" value="${escHtml(state.query)}" placeholder="${text('ah_company_placeholder','Ime podjetja …')}"></label><label class="ah-form-field">${text('ah_location','Lokacija')}<select name="city">${options(cities,state.city,text('ah_all_slovenia','Vsa Slovenija'))}</select></label><label class="ah-form-field">${text('ah_radius','Radij')}<select name="radius">${[10,25,50,100].map(value=>`<option value="${value}" ${String(value)===state.radius?'selected':''}>${value} km</option>`).join('')}</select></label><label class="ah-form-field">${text('ah_authorized_brand','Pooblaščena znamka')}<select name="brand">${options(brands,state.brand,text('ah_all_brands','Vse znamke'))}</select></label><button class="ah-orange-button" type="submit">${icon('search')}${text('search','Išči')}</button></form><div class="ah-directory-types"><button class="ah-type-filter" data-type="" aria-pressed="${!state.type}">${businessIcon('multi')}${text('ah_all','Vsi')}</button>${BUSINESS_TYPES.map(type=>`<button class="ah-type-filter" data-type="${type.id}" aria-pressed="${state.type===type.id}" style="--type-rgb:${type.rgb};--ac:rgb(${type.rgb});--af:rgba(${type.rgb},.16)">${businessIcon(type.icon)}${escHtml(businessType(type.id).label)}</button>`).join('')}</div><div class="ah-directory-filters">${[['authorized','authorized','ah_authorized','Pooblaščeni'],['leasing','leasing','ah_leasing','Leasing'],['storage','tyrehotel','ah_tyre_hotel','Hotel za gume'],['booking','booking','ah_booking','Spletno naročanje'],['rated','multi','ah_high_rating','Ocena 4,5+']].map(([key,art,label,fallback])=>`<label class="ah-filter-check"><input type="checkbox" data-directory-filter="${key}" ${state[key]?'checked':''}>${businessIcon(art)}${text(label,fallback)}</label>`).join('')}<button class="ah-text-button" data-location>${icon('pin')}${text('ah_near_me','V moji bližini')}</button><button class="ah-text-button" data-reset>${text('ah_reset','Ponastavi')}</button></div><p role="alert" data-directory-error hidden></p><div class="ah-directory-results-bar"><strong data-result-count></strong><label>${text('ah_sort','Razvrsti')}<select data-directory-sort><option value="rating">${text('ah_best_rated','Najbolje ocenjeni')}</option><option value="name">${text('ah_name','Ime')}</option><option value="distance">${text('ah_distance','Oddaljenost')}</option></select></label></div><div class="ah-directory-layout ${state.mode==='list'?'is-list':''}"><div class="ah-business-list"></div><div class="ah-directory-map-panel"><div id="ah-directory-map" aria-label="${text('ah_business_map','Zemljevid podjetij')}"></div><div class="ah-map-detail" data-map-detail hidden></div><div class="ah-map-legend">${BUSINESS_TYPES.slice(0,3).map(item=>typePill(item.id)).join('')}</div></div></div><section class="ah-directory-brands"><h2>${text('ah_authorized_by_brand','Pooblaščeni partnerji po znamki')}</h2><p>${text('ah_brand_copy','Poiščite podjetje, ki pozna vašo znamko.')}</p><div>${brands.map(brand=>`<button class="ah-brand-directory" data-brand="${escHtml(brand)}"><strong>${escHtml(brand)}</strong><small>${businesses.filter(b=>b.authorizedBrands.includes(brand)).length} ${text('ah_partners','partnerjev')}</small>${icon('arrow')}</button>`).join('')}</div></section>${mapPage?`<p class="ah-map-demo">${text('vm_demo','Prikazan je obstoječi vzorčni imenik podjetij; živi imenik še ni povezan.')}</p>`:''}</section>`;
    const error=message=>{const area=host.querySelector('[data-directory-error]');area.textContent=message;area.hidden=false;};
    function origin(){if(userOrigin)return userOrigin;const matches=businesses.filter(b=>b.location.city===state.city);return matches.length?{lat:matches.reduce((sum,b)=>sum+b.location.lat,0)/matches.length,lng:matches.reduce((sum,b)=>sum+b.location.lng,0)/matches.length}:null;}
    function select(id,fromMap=false){
        selected=id;
        host.querySelectorAll('[data-business-id]').forEach(el=>el.classList.toggle('is-selected',el.dataset.businessId===id));
        markersMap.forEach((m,mId)=>{
            const el=m.getElement();
            if(el){
                el.classList.toggle('is-active',mId===id);
                el.style.zIndex=mId===id?'1000':'';
            }
        });
        const business=visible.find(b=>b.id===id);
        if(mapPage){
            const pane=host.querySelector('[data-map-detail]');
            pane.hidden=!business;
            pane.innerHTML=business?`<button class="ah-icon-button" data-close-map-detail aria-label="${text('close','Zapri')}">${icon('close')}</button><h2>${escHtml(business.name)}</h2><div class="ah-business-tags">${business.businessTypes.map(typePill).join('')}</div><p>${escHtml(business.contact.address)}</p><p>★ ${business.rating} · ${business.reviewCount} ${text('ah_reviews','ocen')}</p><div class="ah-authorized-brands">${business.authorizedBrands.map(brand=>`<b>${escHtml(brand)}</b>`).join('')}</div><div class="ah-actions">${business.bookingMode?`<a class="ah-blue-button" href="/booking?businessId=${encodeURIComponent(business.id)}">${text('ah_book','Naroči se')}</a>`:''}<a class="ah-pill" href="/poslovni-profil?id=${encodeURIComponent(business.id)}">${text('ah_view_profile','Poglej profil')}</a><a class="ah-icon-button" href="tel:${escHtml(business.contact.phone.replace(/\s/g,''))}" aria-label="${text('ah_call','Pokliči')}">${icon('phone')}</a><a class="ah-icon-button" href="https://www.google.com/maps/dir/?api=1&destination=${business.location.lat},${business.location.lng}" target="_blank" rel="noopener" aria-label="${text('ah_directions','Navodila za pot')}">${icon('pin')}</a></div>`:'';
        }
        if(business&&map&&!fromMap)map.panTo([business.location.lat,business.location.lng],{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
        if(fromMap)host.querySelector(`[data-business-id="${id}"]`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
    }
    function syncUrl(){const query=new URLSearchParams();for(const key of ['type','city','brand','radius','mode'])if(state[key])query.set(key,state[key]);if(state.query)query.set('q',state.query);for(const key of ['authorized','leasing','storage','booking','rated'])if(state[key])query.set(key,'1');history.replaceState(history.state,'',`${mapPage?'/zemljevid':'/avtohise'}?${query}`);}
    function draw(){
        const near=origin();
        visible=businesses.filter(b=>(!state.type||b.businessTypes.includes(state.type))&&(!state.brand||b.authorizedBrands.includes(state.brand))&&(!state.query||`${b.name} ${b.contact.address} ${b.businessTypes.map(type=>businessType(type).label).join(' ')}`.toLowerCase().includes(state.query.toLowerCase()))&&(!state.authorized||b.authorizedBrands.length>0)&&(!state.leasing||b.offersLeasing)&&(!state.storage||b.offersTyreStorage)&&(!state.booking||b.bookingMode)&&(!state.rated||b.rating>=4.5)&&(!near||getDistance(near.lat,near.lng,b.location.lat,b.location.lng)<=Number(state.radius)));
        const sort=host.querySelector('[data-directory-sort]').value;
        visible.sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='distance'&&near?getDistance(near.lat,near.lng,a.location.lat,a.location.lng)-getDistance(near.lat,near.lng,b.location.lat,b.location.lng):b.rating-a.rating);
        host.querySelector('[data-result-count]').textContent=`${visible.length} ${text('ah_results','rezultatov')}`;
        host.querySelector('.ah-business-list').innerHTML=visible.length?visible.map(b=>{
            const info=businessType(b.businessTypes.length>1?'multi':b.businessTypes[0]);const distance=near?getDistance(near.lat,near.lng,b.location.lat,b.location.lng):null;
            return `<article class="ah-business-card ${selected===b.id?'is-selected':''}" data-business-id="${b.id}"><div class="ah-business-card-heading"><div class="ah-business-avatar" style="--type-rgb:${info.rgb}">${escHtml(b.name.split(' ').slice(0,2).map(word=>word[0]).join(''))}</div><div><h2><button class="ah-text-button" data-select-business="${b.id}">${escHtml(b.name)}</button>${b.verified?`<span class="ah-verified" title="${text('ah_verified','Preverjeno')}">${icon('check')}</span>`:''}</h2><p><span class="ah-rating">★ <strong class="ah-rating-score">${b.rating.toFixed(1)}</strong></span> <span>(${b.reviewCount} ${text('ah_reviews','ocen')})</span></p><p>${icon('pin')}${escHtml(b.contact.address)}${distance!==null?` · ${distance.toFixed(1)} km`:''}</p></div></div><div class="ah-business-tags">${b.businessTypes.map(typePill).join('')}</div>${b.authorizedBrands.length?`<div class="ah-authorized-brands">${businessIcon('authorized')}<span>${text('ah_authorized','Pooblaščeni')}:</span>${b.authorizedBrands.map(brand=>`<b>${escHtml(brand)}</b>`).join('')}</div>`:''}<div class="ah-business-services">${b.offersLeasing?`<span>${businessIcon('leasing')}${text('ah_leasing','Leasing')}</span>`:''}${b.offersTyreStorage?`<span>${businessIcon('tyrehotel')}${text('ah_tyre_hotel','Hotel za gume')}</span>`:''}${b.bookingMode?`<span>${businessIcon('booking')}${text('ah_booking','Spletno naročanje')}</span>`:''}</div><div class="ah-business-card-actions"><a class="ah-blue-button" href="/poslovni-profil?id=${encodeURIComponent(b.id)}">${text('ah_view_profile','Poglej profil')}${icon('arrow')}</a>${b.bookingMode?`<a class="ah-pill" href="/booking?businessId=${encodeURIComponent(b.id)}">${text('ah_book','Naroči se')}</a>`:''}<a class="ah-icon-button" href="tel:${escHtml(b.contact.phone.replace(/\s/g,''))}" aria-label="${text('ah_call','Pokliči')} ${escHtml(b.name)}">${icon('phone')}</a><a class="ah-icon-button" href="https://www.google.com/maps/dir/?api=1&destination=${b.location.lat},${b.location.lng}" target="_blank" rel="noopener" aria-label="${text('ah_directions','Navodila za pot')}">${icon('pin')}</a></div></article>`;
        }).join(''):`<div class="ah-empty-state">${businessIcon('dealer')}<h2>${text('ah_no_businesses','Ni podjetij za izbrane filtre')}</h2><button class="ah-pill" data-reset>${text('ah_reset','Ponastavi')}</button></div>`;
        host.querySelectorAll('[data-type]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.type===state.type)));
        layer?.clearLayers();
        markersMap.clear();
        if(map&&layer){
            const L=window.L;
            visible.forEach(b=>{
                const info=businessType(b.businessTypes.length>1?'multi':b.businessTypes[0]);
                const marker=L.marker([b.location.lat,b.location.lng],{icon:L.divIcon({className:`ah-map-marker ${selected===b.id?'is-active':''}`,html:`<span style="--type-rgb:${info.rgb};--ac:rgb(${info.rgb});--af:rgba(${info.rgb},.16)">${businessIcon(info.icon)}</span>`,iconSize:[38,44],iconAnchor:[19,44]})}).addTo(layer);
                marker.bindTooltip(escHtml(b.name));
                marker.on('click',()=>select(b.id,true));
                markersMap.set(b.id,marker);
            });
            if(visible.length)map.fitBounds(L.latLngBounds(visible.map(b=>[b.location.lat,b.location.lng])),{padding:[45,45],maxZoom:12,animate:false});
        }
        if(mapPage&&selected&&!visible.some(b=>b.id===selected)){selected=null;host.querySelector('[data-map-detail]').hidden=true;}
        syncUrl();
    }
    if(window.L){const L=window.L;map=L.map('ah-directory-map',{scrollWheelZoom:false}).setView([46.1,14.8],8);const tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(map);tiles.on('tileerror',()=>{if(!controller.signal.aborted)error(text('vm_tiles_failed','Podlage zemljevida ni mogoče naložiti. Seznam podjetij in kontakti ostanejo na voljo.'));});layer=L.layerGroup().addTo(map);observer=new ResizeObserver(()=>map?.invalidateSize());observer.observe(host.querySelector('.ah-directory-map-panel'));}
    else host.querySelector('#ah-directory-map').innerHTML=`<div class="ah-empty-state"><p>${text('ah_map_unavailable','Zemljevid trenutno ni na voljo. Podjetja si lahko ogledate na seznamu.')}</p></div>`;
    host.addEventListener('submit',event=>{if(!event.target.matches('.ah-directory-search'))return;event.preventDefault();const values=new FormData(event.target);state.query=String(values.get('q')).trim();state.city=String(values.get('city'));state.radius=String(values.get('radius'));state.brand=String(values.get('brand'));userOrigin=null;draw();},{signal:controller.signal});
    host.addEventListener('change',event=>{if(event.target.hasAttribute('data-remember-area')){if(event.target.checked&&map){const center=map.getCenter();localStorage.setItem(lsKey('business_map_area'),JSON.stringify({center:[center.lat,center.lng],zoom:map.getZoom(),filters:location.search}));}else localStorage.removeItem(lsKey('business_map_area'));}if(event.target.dataset.directoryFilter){state[event.target.dataset.directoryFilter]=event.target.checked;draw();}else if(event.target.matches('[data-directory-sort]'))draw();},{signal:controller.signal});
    host.addEventListener('click',event=>{
        const button=event.target.closest('button');
        if(button){
            if(button.hasAttribute('data-type')){state.type=button.dataset.type;draw();}
            else if(button.dataset.selectBusiness)select(button.dataset.selectBusiness);
            else if(button.hasAttribute('data-close-map-detail')){selected=null;host.querySelector('[data-map-detail]').hidden=true;host.querySelectorAll('[data-business-id]').forEach(el=>el.classList.remove('is-selected'));markersMap.forEach(m=>m.getElement()?.classList.remove('is-active'));}
            else if(button.hasAttribute('data-map-filters')){openAutoHubDialog({title:text('sidebar_filters_title','Filtri'),body:`<div class="ah-editor-grid"><label class="ah-form-field">${text('ah_location','Lokacija')}<select name="city">${options(cities,state.city,text('ah_all_slovenia','Vsa Slovenija'))}</select></label><label class="ah-form-field">${text('ah_radius','Radij')}<select name="radius">${[5,10,20,25,50,100].map(value=>`<option value="${value}" ${String(value)===state.radius?'selected':''}>${value} km</option>`).join('')}</select></label><label class="ah-form-field">${text('ah_authorized_brand','Pooblaščena znamka')}<select name="brand">${options(brands,state.brand,text('ah_all_brands','Vse znamke'))}</select></label></div>${[['authorized','ah_authorized','Pooblaščeni'],['leasing','ah_leasing','Leasing'],['storage','ah_tyre_hotel','Hotel za gume'],['booking','ah_booking','Spletno naročanje'],['rated','ah_high_rating','Ocena 4,5+']].map(([key,label,fallback])=>`<label class="ah-product-switch">${text(label,fallback)}<input type="checkbox" name="${key}" ${state[key]?'checked':''}></label>`).join('')}`,submitLabel:text('vm_apply','Pokaži podjetja'),signal:controller.signal,onSubmit:values=>{for(const key of ['city','radius','brand']){state[key]=String(values.get(key)||'');host.querySelector(`[name="${key}"]`).value=state[key];}for(const key of ['authorized','leasing','storage','booking','rated']){state[key]=values.has(key);host.querySelector(`[data-directory-filter="${key}"]`).checked=state[key];}userOrigin=null;draw();}});}
            else if(button.dataset.directoryMode){state.mode=button.dataset.directoryMode;host.querySelector('.ah-directory-layout').classList.toggle('is-list',state.mode==='list');host.querySelectorAll('[data-directory-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.directoryMode===state.mode)));map?.invalidateSize();syncUrl();}
            else if(button.dataset.brand){state.brand=button.dataset.brand;host.querySelector('[name="brand"]').value=state.brand;draw();host.querySelector('.ah-directory-search').scrollIntoView({block:'start'});}
            else if(button.hasAttribute('data-reset')){Object.assign(state,{query:'',type:'',city:'',brand:'',radius:'50',authorized:false,leasing:false,storage:false,booking:false,rated:false});userOrigin=null;host.querySelectorAll('.ah-directory-search input,.ah-directory-search select').forEach(el=>{el.value=el.name==='radius'?'50':'';});host.querySelectorAll('[data-directory-filter]').forEach(el=>{el.checked=false;});draw();}
            else if(button.hasAttribute('data-location')){if(!navigator.geolocation){error(text('ah_location_failed','Lokacije ni mogoče določiti. Izberite kraj v iskalniku.'));return;}button.disabled=true;navigator.geolocation.getCurrentPosition(position=>{if(controller.signal.aborted)return;userOrigin={lat:position.coords.latitude,lng:position.coords.longitude};state.city='';host.querySelector('[name="city"]').value='';button.disabled=false;draw();},()=>{if(controller.signal.aborted)return;button.disabled=false;error(text('ah_location_failed','Lokacije ni mogoče določiti. Izberite kraj v iskalniku.'));},{timeout:10000});}
        } else {
            const interactive=event.target.closest('a,input,label,select');
            if(!interactive){
                const card=event.target.closest('.ah-business-card');
                if(card?.dataset?.businessId)select(card.dataset.businessId);
            }
        }
    },{signal:controller.signal});
    host.addEventListener('mouseenter',event=>{
        const card=event.target.closest?.('.ah-business-card');
        if(card?.dataset?.businessId){
            const m=markersMap.get(card.dataset.businessId);
            m?.getElement()?.classList.add('is-hovered');
        }
    },true);
    host.addEventListener('mouseleave',event=>{
        const card=event.target.closest?.('.ah-business-card');
        if(card?.dataset?.businessId){
            const m=markersMap.get(card.dataset.businessId);
            m?.getElement()?.classList.remove('is-hovered');
        }
    },true);
    draw();
    if(mapPage&&map){if(remembered?.center&&Array.isArray(remembered.center))map.setView(remembered.center,remembered.zoom||10,{animate:false});map.on('moveend',()=>{if(!host.querySelector('[data-remember-area]')?.checked)return;const center=map.getCenter();localStorage.setItem(lsKey('business_map_area'),JSON.stringify({center:[center.lat,center.lng],zoom:map.getZoom(),filters:location.search}));});}
}
