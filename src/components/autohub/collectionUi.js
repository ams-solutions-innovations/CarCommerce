import { getCollections } from '../../services/collectionsService.js';
import { getListings, getListingById } from '../../services/listingService.js';
import { navigateTo } from '../../router.js';
import { PLATFORM } from '../../config/platform.js';
import { escHtml } from '../../utils/escHtml.js';
import { t } from '../../core/i18n.js';
import { icon } from './icons.js';
import { openAutoHubDialog } from './dialog.js';

export const text=(key,fallback)=>escHtml(t(key,fallback));
export const money=value=>new Intl.NumberFormat('sl-SI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(value)||0);
export const price=car=>Number(car.salePriceEur||car.priceEur||car.priceRaw)||0;
export const photo=car=>car.images?.exterior?.[0]||car.image||'';
export const title=car=>car.title||[car.make,car.model].filter(Boolean).join(' ');
export function image(car,classes='') {
    const url=photo(car);
    return url?`<img class="${classes}" src="${escHtml(url)}" alt="${escHtml(title(car))}" loading="lazy">`:`<div class="ah-photo-placeholder ${classes}">${icon('car')}</div>`;
}
export async function collectionContext() {
    if(PLATFORM.id!=='avto'){navigateTo('/profil');return null;}
    await window.__authReady;
    const user=window.__currentUser;
    if(!user){navigateTo('/prijava');return null;}
    const host=document.getElementById('app-container');
    const controller=new AbortController();
    document.addEventListener('beforeRouteChange',()=>controller.abort(),{once:true,signal:controller.signal});
    host.innerHTML=`<div class="ah-container ah-workspace" role="status">${text('ah_loading','Nalaganje …')}</div>`;
    try {
        const [data,feedResult]=await Promise.all([getCollections(user.id),getListings().then(rows=>({rows})).catch(()=>({rows:[],failed:true}))]);
        const cars=new Map(feedResult.rows.map(car=>[String(car.id),car]));
        const snapshots=new Map(data.favourites.map(item=>[String(item.listingId),item]));
        const ids=new Set([...snapshots.keys(),...data.folders.flatMap(folder=>folder.listingIds||[]),...data.boards.flatMap(board=>(board.cards||[]).map(card=>card.listingId))]);
        let refreshFailed=!!feedResult.failed;
        const missing=[...ids].filter(id=>!cars.has(id));
        for(let i=0;i<missing.length;i+=4)await Promise.all(missing.slice(i,i+4).map(async id=>{
            try{const car=await getListingById(id);if(car?.id)cars.set(id,car);else refreshFailed=true;}
            catch{refreshFailed=true;}
        }));
        for(const id of ids)if(!cars.has(id)){
            const saved=snapshots.get(id)||{};
            cars.set(id,{...saved,id,title:saved.title||text('ah_missing_listing','Shranjeni oglas'),priceEur:saved.priceEur,unrefreshed:true});
        }
        if(controller.signal.aborted)return null;
        return {host,uid:user.id,data,cars,signal:controller.signal,refreshFailed};
    }catch(error){if(!controller.signal.aborted)host.innerHTML=`<div class="ah-container ah-workspace"><h1>${text('ah_load_failed','Podatkov ni mogoče naložiti')}</h1><p role="alert">${escHtml(error.message)}</p><a class="ah-pill" href="${escHtml(location.pathname+location.search)}">${text('ah_retry','Poskusi znova')}</a></div>`;return null;}
}
export function openListingPicker(context,onSelect) {
    const {dialog,close}=openAutoHubDialog({title:text('ah_add_listing','Dodaj oglas'),body:`<label class="ah-form-field">${text('search','Iskanje')}<input type="search" data-picker-search placeholder="${text('ah_search_listings','Poiščite vozilo …')}"></label><div class="ah-picker-list"></div>`,signal:context.signal});
    const list=dialog.querySelector('.ah-picker-list');
    const draw=query=>{
        const cars=[...context.cars.values()].filter(car=>!car.unrefreshed&&title(car).toLowerCase().includes(query.toLowerCase()));
        list.innerHTML=cars.length?cars.slice(0,60).map(car=>`<button type="button" class="ah-picker-item" data-pick="${escHtml(car.id)}">${image(car)}<span><strong>${escHtml(title(car))}</strong><small>${money(price(car))}</small></span>${icon('plus')}</button>`).join(''):`<p>${text('ah_no_matches','Ni ujemanj. Oglase lahko poiščete na strani Oglasi.')}</p>`;
    };
    draw('');dialog.querySelector('input').addEventListener('input',event=>draw(event.target.value));
    list.addEventListener('click',async event=>{
        const button=event.target.closest('[data-pick]');if(!button)return;
        button.disabled=true;
        try{await onSelect(context.cars.get(button.dataset.pick));close();}
        catch(error){const area=dialog.querySelector('[role="alert"]');area.textContent=error.message;area.hidden=false;button.disabled=false;}
    });
}
export function shareListings(context,ids) {
    const urls=ids.map(id=>`${location.origin}/oglas?id=${encodeURIComponent(id)}`).join('\n');
    const {dialog}=openAutoHubDialog({title:text('ah_share_list','Deli seznam oglasov'),body:`<p>${text('ah_share_private','Delite le povezave do javnih oglasov. Mapa, deska in vaše opombe ostanejo zasebne.')}</p><textarea readonly rows="7">${escHtml(urls)}</textarea>`,submitLabel:text('ah_copy_links','Kopiraj povezave'),onSubmit:async()=>{await navigator.clipboard.writeText(urls);},signal:context.signal});
    dialog.querySelector('textarea').addEventListener('focus',event=>event.target.select());
}
export function failure(context,error){const area=context.host.querySelector('[data-workspace-error]');if(area){area.textContent=error.message;area.hidden=false;}}
export const workspaceWarning=context=>`<p data-workspace-error role="alert" class="ah-inline-error" hidden></p>${context.refreshFailed?`<p class="ah-refresh-warning">${text('ah_refresh_warning','Nekaterih oglasov ni bilo mogoče osvežiti. Vaši shranjeni podatki so ohranjeni.')}</p>`:''}`;

export async function openFolderPickerForListing(listing) {
    await window.__authReady;
    const user=window.__currentUser;
    if(!user) return;
    try {
        const data=await getCollections(user.id);
        const folders=data.folders||[];
        const content=folders.length?`<p>${text('ah_choose_folder_prompt','Izberite mapo, v katero želite shraniti ta oglas:')}</p><div class="ah-picker-list" style="margin-top:14px">${folders.map(f=>`<button type="button" class="ah-picker-item" data-folder-add="${escHtml(f.id)}"><span class="ah-icon" style="color:${f.color||'#2563eb'}">${icon('folder')}</span><span><strong>${escHtml(f.name)}</strong><small>${(f.listingIds||[]).length} ${text('ah_listings','oglasov')}</small></span>${(f.listingIds||[]).includes(String(listing.id))?`<span class="ah-filter-count" style="background:#e3f5f2;color:#0f766e">✓ V mapi</span>`:icon('plus')}</button>`).join('')}</div>`:`<p>${text('ah_no_folders_yet','Trenutno še nimate ustvarjenih map.')}</p><div style="margin-top:14px"><a class="ah-blue-button" href="/mape">${text('ah_open_folders','Odpri Moje mape')}</a></div>`;
        const {dialog,close}=openAutoHubDialog({title:text('ah_add_to_folder','Dodaj v mapo'),body:content});
        dialog.addEventListener('click',async event=>{
            const btn=event.target.closest('[data-folder-add]');
            if(!btn)return;
            const folderId=btn.dataset.folderAdd;
            btn.disabled=true;
            try {
                const {addListingToFolder}=await import('../../services/collectionsService.js');
                await addListingToFolder(user.id,folderId,listing);
                close();
                const folderName=folders.find(f=>f.id===folderId)?.name||'';
                const {showToast}=await import('../../utils/toast.js');
                showToast(`Dodano v mapo ${folderName}!`);
            } catch(err) {
                const alertArea=dialog.querySelector('[role="alert"]');
                if(alertArea){alertArea.textContent=err.message;alertArea.hidden=false;}
                btn.disabled=false;
            }
        });
    } catch(err) {
        console.error('[openFolderPickerForListing] Error:', err);
    }
}
