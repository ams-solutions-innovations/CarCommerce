from pathlib import Path
import json
p=Path('src/pages/accounts.autohub.js');s=p.read_text(encoding='utf-8').replace("icon('calculator')", "icon('spark')")
s=s.replace("<strong>${text(key,label)}</strong></div>`)", "<div><strong>${text(key,label)}</strong>${!business?`<small>${text(key+'_copy',{'ac_saved':'Zberite priljubljene oglase in jih uredite v mapah.','ac_compare':'Poglejte podatke izbranih vozil na enem mestu.','ac_garage':'Shranite vozila in njihove pnevmatike.','ac_auctions':'Preglejte vozila v ponudbi dražb.'}[key])}</small>`:''}</div></div>`)")
p.write_text(s,encoding='utf-8')
p=Path('tests/e2e/autohub-accounts.spec.js');s=p.read_text(encoding='utf-8').replace("await page.screenshot({", "await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.target?.matches?.('.ah-account-panel,.ah-onboarding-card')).map(a=>a.finished.catch(()=>{}))));await page.screenshot({")
p.write_text(s,encoding='utf-8')
sl=['Zberite priljubljene oglase in jih uredite v mapah.','Poglejte podatke izbranih vozil na enem mestu.','Shranite vozila in njihove pnevmatike.','Preglejte vozila v ponudbi dražb.'];en=['Collect favourite listings and organise them in folders.','See details of selected vehicles in one place.','Save your vehicles and their tyres.','Browse vehicles offered at auction.']
for lang in ['sl','en']:
 p=Path('public/lang/'+lang+'.json');data=json.loads(p.read_text(encoding='utf-8'));data.update(dict(zip(['ac_saved_copy','ac_compare_copy','ac_garage_copy','ac_auctions_copy'],sl if lang=='sl' else en)));p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
