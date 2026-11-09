from pathlib import Path
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8')
s="""import { sellerProgress,sellerCategory,enhanceSellerStep } from '../components/autohub/sellerWizard.js';
import { saveSellerDraft,readSellerDraft,clearSellerDraft } from '../services/sellerDraftService.js';
import { navigateTo } from '../router.js';
import { icon as ahIcon } from '../components/autohub/icons.js';
"""+s
s=s.replace("{ id: 'typeSelect', title: null }", "{ id: 'typeSelect', title: 'cl_step_category', number: PLATFORM.id==='avto' }")
s=s.replace("condition: s => isVehicleItem(s) && !currentUser()", "condition: s => PLATFORM.id!=='avto' && isVehicleItem(s) && !currentUser()")
s=s.replace("{ id: 'category', title: 'cl_step_category', number: true }", "{ id: 'category', title: 'cl_step_category', number: true, condition:s=>PLATFORM.id!=='avto'||!isVehicleItem(s) }")
s=s.replace('let brandModelData = null;', 'const initialState=structuredClone(state);\nlet wizardController=null;\nlet draftSaveVersion=0;\nlet brandModelData = null;')
s=s.replace('function saveDraft(state) {', '''function saveDraft(state) {
    if(PLATFORM.id==='avto'){
        state._stepId=currentStepDef().id;const version=++draftSaveVersion;
        if(editListingId)return Promise.resolve();
        return saveSellerDraft(state).then(()=>{if(version!==draftSaveVersion)return;const label=document.querySelector('[data-draft-status]');if(label)label.textContent=t('sw_saved_tab','Osnutek shranjen v tem zavihku');}).catch(()=>{const label=document.querySelector('[data-draft-status]');if(label)label.textContent=t('sw_save_failed','Osnutka ali fotografij ni mogoče shraniti. Pred odhodom preverite vnos.');});
    }''')
s=s.replace('function clearDraft() {', "function clearDraft() {\n    if(PLATFORM.id==='avto'){clearIntent('create_listing');return clearSellerDraft().catch(()=>{});}")
s=s.replace("    console.log('[CreateListing] init');", """    if(PLATFORM.id==='avto'){
        wizardController?.abort();wizardController=new AbortController();const {signal}=wizardController;const host=document.getElementById('app-container');if(host?.dataset.view!=='create-listing')return;
        document.addEventListener('beforeRouteChange',()=>{wizardController.abort();},{once:true,signal});
        await window.__authReady;if(signal.aborted)return;state=structuredClone(initialState);editListingId=null;_reviewEditSection=null;_mediaTab='exterior';
        try{brandModelData=await fetch('json/brands_models_global.json').then(response=>response.json());}catch{brandModelData=null;}
        if(signal.aborted)return;
        const editId=new URLSearchParams(location.search).get('edit');
        if(editId){try{const {getOwnedListingById}=await import('../services/listingService.js');const listing=await getOwnedListingById(editId);if(signal.aborted)return;editListingId=editId;hydrateStateFromListing(listing);state.currentStep=getActiveSteps().findIndex(step=>step.id==='basic');}catch(error){if(!signal.aborted)setHtml(`<div class="cl-card"><h1>${t('sw_edit_error','Oglasa ni mogoče urediti')}</h1><p role="alert">${escHtml(error.message)}</p><a class="cl-btn cl-btn--primary" href="/dashboard">${t('sw_dashboard','Moji oglasi')}</a></div>`);return;}}
        else{try{const saved=await readSellerDraft();if(saved){Object.assign(state,saved);const savedStep=saved._stepId==='auth'&&currentUser()?'review':saved._stepId;const index=getActiveSteps().findIndex(step=>step.id===savedStep);state.currentStep=index>=0?index:0;}}catch{state._photoLostNotice=true;}}
        if(signal.aborted)return;
        const capture=()=>{const ids={fMake:'make',fModel:'model',fVariant:'variant',fYear:'year',fBodyType:'bodyType',fMileage:'mileageKm',fEngineHours:'engineHours',fColor:'color',fColorType:'colorType',fCondition:'condition',fFuelBasic:'fuel',fFuel:'fuel',fTransmission:'transmission',fPower:'powerKw',fPrice:'priceEur',fDescription:'description',fEngineCc:'engineCc'};for(const [id,key] of Object.entries(ids)){const input=document.getElementById(id);if(input)state[key]=['mileageKm','engineHours','priceEur'].includes(key)?parseFormattedNumber(input.value):input.value;}saveDraft(state);};
        let timer;host.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(capture,180);},{signal});host.addEventListener('change',capture,{signal});signal.addEventListener('abort',()=>clearTimeout(timer),{once:true});
        renderCurrentStep();return;
    }
    console.log('[CreateListing] init');""")
s=s.replace('function updateProgress() {', "function updateProgress() {\n    if(PLATFORM.id==='avto')return sellerProgress(state,getNumberedSteps(),currentStepDef().id);")
s=s.replace('    if (fn) fn();', "    if (fn) fn();\n    if(PLATFORM.id==='avto'){enhanceSellerStep(state);saveDraft(state);}")
s=s.replace('function renderTypeSelectStep() {', "function renderTypeSelectStep() {\n    if(PLATFORM.id==='avto')return sellerCategory(state,CATEGORIES,{render:renderCurrentStep,next:()=>{if(isVehicleItem(state))goNext();else goNext();},importAi:()=>openAiImportOverlay({onApply:applyAiImport})});")
s=s.replace('function renderAuthStep() {', '''function renderAuthStep() {
    if(PLATFORM.id==='avto'){
        setHtml(`<div class="cl-card"><h1 class="cl-step-title">${t('sw_signin_publish','Prijavite se za objavo')}</h1><p class="cl-step-sub">${t('sw_signin_copy','Osnutek in fotografije se ohranijo v tem brskalniku. Po prijavi ponovno preglejte oglas in potrdite objavo.')}</p><button class="cl-btn cl-btn--primary" id="ahSellerSignin">${t('login_title','Prijava')}</button></div>`);
        document.getElementById('ahSellerSignin').onclick=async()=>{await saveDraft(state);navigateTo('/prijava?next=%2Fnovi-oglas');};return;
    }''')
s=s.replace('function renderPromotionStep() {', '''function renderPromotionStep() {
    if(PLATFORM.id==='avto'){
        if(!editListingId)state.promotionTier='free';
        setHtml(`<div class="cl-card"><h1 class="cl-step-title">${t('cl_promo_title','Vidnost oglasa')}</h1><p class="cl-step-sub">${t('sw_visibility_copy','Izberite običajno objavo. Plačljiva izpostavitev zahteva potrjen nakup.')}</p><div class="cl-promo-grid"><div class="cl-promo-card selected">${ahIcon('list')}<h3>${t('cl_tier_free','Brezplačno')}</h3><strong>0 €</strong><p>${t('sw_standard_visibility','Oglas v običajnem seznamu rezultatov.')}</p></div>${['homepage','sponsored'].map(tier=>`<div class="cl-promo-card"><span>${ahIcon('spark')}</span><h3>${t(tier==='homepage'?'cl_tier_featured':'cl_tier_sponsored')}</h3><p>${t('sw_paid_unconnected','Nakup izpostavitve še ni povezan s tem čarovnikom.')}</p></div>`).join('')}</div><p class="cl-promo-note">${t('sw_no_fake_boost','Izbira v obrazcu ne aktivira plačljive promocije. Obstoječa potrjena promocija pri urejanju ostane v podatkih oglasa.')}</p><div class="cl-nav"><button class="cl-btn cl-btn--ghost" id="btnPromoBack">${t('cl_back')}</button><button class="cl-btn cl-btn--primary" id="btnPromoNext">${t('cl_continue')}</button></div></div>`);
        document.getElementById('btnPromoBack').onclick=goPrev;document.getElementById('btnPromoNext').onclick=goNext;return;
    }''')
# Existing server images remain valid media even when no new File was added.
s=s.replace("if (state._exteriorFiles.length === 0) return alert", "if (state._exteriorUrls.length === 0) return alert")
s=s.replace("if (files.length === 0) {", "if (urls.length === 0) {")
s=s.replace('state._exteriorFiles.length}</span>', 'state._exteriorUrls.length}</span>').replace('state._interiorFiles.length}</span>', 'state._interiorUrls.length}</span>')
s=s.replace('extCount.textContent = state._exteriorFiles.length;', 'extCount.textContent = state._exteriorUrls.length;').replace('intCount.textContent = state._interiorFiles.length;', 'intCount.textContent = state._interiorUrls.length;')
s=s.replace('if (file.size > 10 * 1024 * 1024)', "if(PLATFORM.id==='avto'&&!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type))return alert(t('sw_image_type','Uporabite JPG, PNG, WebP ali AVIF.'));\n        if(state._exteriorUrls.length+state._interiorUrls.length>=40)return alert(t('sw_photo_limit','Največ 40 fotografij.'));\n        if (file.size > 10 * 1024 * 1024)")
s=s.replace('    renderThumbs();\n    // Update tab counts', '    renderThumbs();\n    if(PLATFORM.id===\'avto\')saveDraft(state);\n    // Update tab counts')
s=s.replace('            files.splice(idx, 1);', "            const existing=urls.filter(url=>!url.startsWith('blob:')).length;\n            if(urls[idx]?.startsWith('blob:'))files.splice(idx-existing,1);")
s=s.replace('            if (isExterior && state.coverIndex >= files.length) state.coverIndex = 0;', '            if(isExterior){if(idx<state.coverIndex)state.coverIndex--;else if(idx===state.coverIndex||state.coverIndex>=urls.length)state.coverIndex=0;}\n            if(PLATFORM.id===\'avto\')saveDraft(state);')
s=s.replace("        if (currentUser()) {\n            submitListing(currentUser());", "        if (currentUser()) {\n            document.getElementById('btnRevNext').disabled=true;\n            submitListing(currentUser());")
s=s.replace("async function submitListing(user) {", "async function submitListing(user) {\n    const submitSignal=wizardController?.signal;\n    await saveDraft(state);")
s=s.replace("        // Invalidate the dashboard listings cache", "        if(PLATFORM.id==='avto'&&submitSignal?.aborted)return;\n        // Invalidate the dashboard listings cache")
s=s.replace("        document.getElementById('clProgress').style.display = 'none';", "        document.getElementById('clProgress').style.display = 'none';\n        if(PLATFORM.id==='avto'){const link=`/${state.entryType==='auction'?'drazba':'oglas'}?id=${encodeURIComponent(listingId)}`;container.innerHTML=`<div class=\"cl-card ah-seller-success\"><span class=\"ah-seller-success-icon\">${ahIcon('check')}</span><h1>${t(wasEditing?'sw_updated':'cl_success_title',wasEditing?'Oglas je posodobljen':'Oglas je objavljen')}</h1><p>${escHtml(`${state.make} ${state.model}`.trim())}</p><div class=\"ah-actions\"><a class=\"cl-btn cl-btn--primary\" href=\"${link}\">${t('cl_btn_view_listing')}</a><a class=\"cl-btn cl-btn--ghost\" href=\"/dashboard\">${t('sw_dashboard','Moji oglasi')}</a></div></div>`;await clearDraft();}")
s=s.replace("        console.error('[CreateListing] submit error:', err);", "        console.error('[CreateListing] submit error:', err);\n        if(PLATFORM.id==='avto'){if(submitSignal?.aborted)return;container.innerHTML=`<div class=\"cl-card\"><h1>${t('cl_error_title')}</h1><p role=\"alert\">${escHtml(err.message)}</p><button class=\"cl-btn cl-btn--primary\" id=\"ahSellerRetry\">${t('sw_back_review','Nazaj na pregled')}</button></div>`;document.getElementById('ahSellerRetry').onclick=renderCurrentStep;return;}")
p.write_text(s,encoding='utf-8')
