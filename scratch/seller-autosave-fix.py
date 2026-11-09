from pathlib import Path
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8')
s=s.replace("if(editListingId)return Promise.resolve();", "if(editListingId)return Promise.resolve();\n        const saving=document.querySelector('[data-draft-status]');if(saving)saving.textContent=t('sw_saving','Shranjujem osnutek …');")
s=s.replace("fEngineCc:'engineCc'", "fEngineCC:'engineCc',fEngineCCBasic:'engineCc',fConsCombined:'fuelL100kmCombined',fConsCity:'fuelL100kmCity',fConsHighway:'fuelL100kmHighway',fDrive:'driveType',fEuro:'emissionClass',fTow:'towingKg'")
s=s.replace("saveDraft(state);};\n        let timer;", "for(const [id,key] of [['fCountry','country'],['fRegion','region']]){const input=document.getElementById(id);if(input)state.location={...state.location,[key]:input.value};}for(const [id,key] of [['fContactName','name'],['fPhone','phone']]){const input=document.getElementById(id);if(input)state.contact={...state.contact,[key]:input.value};}saveDraft(state);};\n        let timer;")
p.write_text(s,encoding='utf-8')
p=Path('src/services/listingService.js');s=p.read_text(encoding='utf-8').replace(".filter(k => !draft[k]);", ".filter(k => !draft[k]&&!(k==='priceEur'&&draft.callForPrice));")
p.write_text(s,encoding='utf-8')
import json
for lang in ['sl','en']:
 p=Path('public/lang/'+lang+'.json');data=json.loads(p.read_text(encoding='utf-8'));data['sw_saving']='Shranjujem osnutek …' if lang=='sl' else 'Saving draft …';p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
