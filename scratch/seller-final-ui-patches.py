from pathlib import Path
p=Path('src/components/autohub/sellerWizard.js');s=p.read_text(encoding='utf-8').replace("let dragged=null;", "let dragged=null;let errorMessage='';")
s=s.replace('function error(message){const area=', 'function error(message){errorMessage=message;const area=')
s=s.replace('data-media-error hidden></p>', "data-media-error ${errorMessage?'':'hidden'}>${escHtml(errorMessage)}</p>")
needle=" host.querySelectorAll('.cl-step-title').forEach(title=>title.tabIndex=-1);"
insert=""" if(make&&!host.querySelector('#fVin')){const field=document.createElement('div');field.className='cl-field';field.innerHTML=`<label class="cl-label" for="fVin">${text('sw_vin','VIN (neobvezno)')}</label><input class="cl-input" id="fVin" maxlength="17" value="${escHtml(state.vin||'')}" placeholder="17 znakov"><p class="cl-hint">${text('sw_vin_note','Vnos VIN ni preverjanje vozila ali njegove zgodovine.')}</p>`;host.querySelector('.cl-nav')?.before(field);}
"""
s=s.replace(needle,insert+needle);p.write_text(s,encoding='utf-8')
p=Path('src/pages/dashboard.autohub.js');s=p.read_text(encoding='utf-8').replace('getUserListings,deleteListing', 'getUserListings,deleteListing,updateListing')
s=s.replace('<button class="ah-pill" type="button" data-seller-print=', '<button class="ah-pill" type="button" data-seller-price="${escHtml(row.id)}">${icon(\'edit\')}${text(\'ds_change_price\',\'Spremeni ceno\')}</button><button class="ah-pill" type="button" data-seller-print=')
s=s.replace('button.dataset.sellerDelete||button.dataset.sellerSold||', 'button.dataset.sellerPrice||button.dataset.sellerDelete||button.dataset.sellerSold||')
s=s.replace("if(row){if(button.dataset.sellerDelete", """if(row){if(button.dataset.sellerPrice){openAutoHubDialog({title:text('ds_change_price','Spremeni ceno'),body:`<label class="ah-form-field">${text('ds_price','Cena (€)')}<input name="price" type="number" min="0" step="1" required value="${Number(row.priceEur)||0}"></label>`,signal,onSubmit:async values=>{const price=Number(values.get('price'));if(!Number.isFinite(price)||price<0)throw new Error(text('ds_invalid_price','Vnesite veljavno ceno.'));await updateListing(row.id,{priceEur:price});rows=rows.map(item=>item.id===row.id?{...item,priceEur:price,price}:item);draw();}});return;}if(button.dataset.sellerDelete""")
p.write_text(s,encoding='utf-8')
