from pathlib import Path
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8').replace("import { navigateTo } from '../router.js';", "import { navigateTo,registerNavigationGuard } from '../router.js';\nimport { openAutoHubDialog } from '../components/autohub/dialog.js';")
s=s.replace('let wizardController=null;', 'let wizardController=null;let wizardDirty=false;let wizardOwner=null;')
s=s.replace("        if(editListingId)return Promise.resolve();", "        if(editListingId){const label=document.querySelector('[data-draft-status]');if(label)label.textContent=t('sw_edit_unsaved','Spremembe oglasa še niso shranjene');return Promise.resolve();}")
s=s.replace("state=structuredClone(initialState);editListingId=null;", "state=structuredClone(initialState);wizardDirty=false;wizardOwner=currentUser()?.id;editListingId=null;")
needle="        const capture=()=>{"
insert="""        const removeGuard=registerNavigationGuard(()=>{if(!editListingId||!wizardDirty||currentUser()?.id!==wizardOwner)return true;return new Promise(resolve=>{let decided=false;const modal=openAutoHubDialog({title:t('vp_unsaved','Imate neshranjene spremembe'),body:`<p>${t('vp_unsaved_copy','Če nadaljujete, se vnos izgubi.')}</p><button class="ah-orange-button" type="button" data-discard>${t('vp_discard','Zavrži spremembe')}</button>`,signal});modal.dialog.addEventListener('close',()=>{if(!decided)resolve(false);},{once:true});modal.dialog.querySelector('[data-discard]').onclick=()=>{decided=true;wizardDirty=false;modal.close();resolve(true);};});});signal.addEventListener('abort',removeGuard,{once:true});window.addEventListener('beforeunload',event=>{if(editListingId&&wizardDirty){event.preventDefault();event.returnValue='';}},{signal});
"""
s=s.replace(needle,insert+needle)
s=s.replace("host.addEventListener('input',()=>{clearTimeout(timer);", "host.addEventListener('input',()=>{wizardDirty=true;clearTimeout(timer);")
s=s.replace("host.addEventListener('change',capture,{signal});", "host.addEventListener('change',()=>{wizardDirty=true;capture();},{signal});")
s=s.replace("host.addEventListener('click',event=>{if(event.target.closest('.cl-btn'))", "host.addEventListener('click',event=>{if(event.target.closest('[data-seller-category],[data-photo-remove],[data-photo-move],[data-photo-cover]'))wizardDirty=true;if(event.target.closest('.cl-btn'))")
s=s.replace("        editListingId = null;\n        } else", "        editListingId = null;wizardDirty=false;\n        } else")
s=s.replace(";await clearDraft();}", ";if(!wasEditing)await clearDraft();}")
p.write_text(s,encoding='utf-8')
import json
for lang in ['sl','en']:
 p=Path('public/lang/'+lang+'.json');data=json.loads(p.read_text(encoding='utf-8'));data['sw_edit_unsaved']='Spremembe oglasa še niso shranjene' if lang=='sl' else 'Listing changes are not saved yet';p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
