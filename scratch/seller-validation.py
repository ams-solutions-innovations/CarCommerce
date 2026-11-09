from pathlib import Path
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8')
s=s.replace('alert(', 'wizardAlert(')
s += """\nfunction wizardAlert(message){if(PLATFORM.id!=='avto'){window.alert(message);return;}const host=document.querySelector('#clStepContainer .cl-card');if(!host)return;let area=host.querySelector('[data-wizard-error]');if(!area){area=document.createElement('p');area.dataset.wizardError='';area.setAttribute('role','alert');area.tabIndex=-1;host.querySelector('.cl-nav')?.before(area);if(!area.isConnected)host.append(area);}area.textContent=String(message);area.focus();}\n"""
s=s.replace("if (!engineCc) return wizardAlert(t('cl_err_displacement'));", "if(fuelSel.value!=='Elektrika'&&!engineCc)return wizardAlert(t('cl_err_displacement'));")
s=s.replace("if (!make) return wizardAlert(t('cl_err_make'));", "if (!make) return wizardAlert(t('cl_err_make'));\n        if(PLATFORM.id==='avto'&&!modelSel.value)return wizardAlert(t('cl_err_model','Izberite model vozila.'));")
# Request identity must be persisted before the API call, including a failed response.
s=s.replace('    const submitSignal=wizardController?.signal;', "    const submitSignal=wizardController?.signal;\n    if(PLATFORM.id==='avto')state._requestId ||= crypto.randomUUID();")
s=s.replace("<p role=\"alert\">${escHtml(err.message)}</p><button", "<p role=\"alert\">${escHtml(err.message)}</p>${err.listingId?`<p>${t('sw_auction_partial','Oglas je shranjen, dražba pa še ni ustvarjena. Ponovni poskus uporabi isti oglas.')}</p>`:''}<button")
p.write_text(s,encoding='utf-8')
