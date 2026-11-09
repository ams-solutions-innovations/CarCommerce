import {test,expect} from '@playwright/test';
const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'design@example.com',user_metadata:{display_name:'Testni'},app_metadata:{provider:'email'},created_at:'2026-01-01T00:00:00Z'};
const vehicles=[{id:'rav4',make:'Toyota',model:'RAV4',year:2021,nickname:'Družinski RAV4',plate:'LJ AH-123',tires:{winter:{width:225,profile:65,rim:17,loadIndex:106,speedRating:'H'}}},{id:'tesla',make:'Tesla',model:'Model S',year:2024,tires:{winter:{width:245,profile:45,rim:19}}},{id:'unknown',make:'Toyota',model:'RAV4',year:2021,tires:{winter:{width:225,profile:65,rim:17}}}];
const catalog=[
 {id:'tire-1',item_type:'tire',vehicle_category:'avto',status:'active',title:'Michelin Alpin 6',brand:'Michelin',image_url:'',lowest_price:999,attributes:{size:'225/65 R17',width:225,aspect:65,rim:17,season:'zimske',loadIndex:'106',speedRating:'H',xl:true,snow3PMSF:true,fuelEfficiency:'C',wetGrip:'B',noiseDb:70},offers:[{shop:'Prvi ponudnik',domain:'first.example',price:142,url:'https://first.example/product',in_stock:true},{shop:'Najnižja ponudba',domain:'best.example',price:139,url:'https://best.example/product',in_stock:true},{shop:'Razprodano',price:100,url:'https://out.example/product',in_stock:false},{shop:'Neveljavna povezava',price:50,url:'javascript:alert(1)',in_stock:true}]},
 {id:'tire-2',itemType:'tire',vehicleCategory:'avto',status:'active',title:'Continental WinterContact',brand:'Continental',attributes:{size:'205/55 R16',width:205,aspect:55,rim:16,season:'zimske',loadIndex:'91',speedRating:'H',fuelEfficiency:'B',wetGrip:'C',noiseDb:72},offers:[{shop:'Trgovina',price:99,url:'https://shop.example/continental',inStock:true}]},
 {id:'part-1',itemType:'part',vehicleCategory:'avto',status:'active',title:'Bosch zavorne ploščice',brand:'Bosch',attributes:{partGroup:'zavore',partType:'ploscice',oemNumber:'0986494104',compatibility:[{make:'Toyota',model:'RAV4',yearFrom:2019,yearTo:2023}]},offers:[{shop:'Trgovina',price:45,url:'https://shop.example/brakes',inStock:true}]},
];
const part={id:'headlight-1',platform:'avto',item_type:'part',status:'active',title:'Žaromet LED, levi',brand:'Toyota',price:189,created_at:'2026-10-13T08:00:00Z',data:{vehicleCategory:'avto',partGroup:'razsvetljava',partType:'zarometi',condition:'Rabljeno',oemNumber:'81150-42M30',seller:'Avtodeli Rudnik',contact:{phone:'+386 41 123 456',email:'seller@example.com'},compatibility:[{make:'Toyota',model:'RAV4',yearFrom:2019,yearTo:2023,verified:true}],images:{exterior:['/brand/autohub/headlight-illustration.svg','/brand/autohub/headlight-illustration.svg']}}};
const peerTire={...part,id:'peer-tire',item_type:'tire',title:'Michelin rabljene gume',price:60,data:{vehicleCategory:'avto',tireWidth:225,tireAspect:65,tireRim:17,tireSeason:'zimske',tireSize:'225/65 R17',brand:'Michelin',condition:'Rabljeno'}};
async function fixtures(page,{signed=false,sold=false,error=false,extra=[]}={}){
 await page.addInitScript(({user,signed})=>{
  if(!localStorage.getItem('avto_lang'))localStorage.setItem('avto_lang','sl');localStorage.removeItem('theme');
  if(signed){const encode=value=>btoa(JSON.stringify(value)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');const exp=Math.floor(Date.now()/1000)+3600;localStorage.setItem('sb-placeholder-auth-token',JSON.stringify({access_token:`${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,aud:'authenticated',role:'authenticated',exp})}.fixture`,refresh_token:'fixture',expires_at:exp,expires_in:3600,token_type:'bearer',user}));}
 },{user,signed});
 await page.route(/supabase\.co/,route=>{
  const url=new URL(route.request().url());let body=[];
  if(url.pathname==='/auth/v1/user')body=user;
  if(url.pathname==='/rest/v1/profiles')body={id:user.id,prefs:{vehicles},updated_at:'2026-10-13T08:00:00Z'};
  if(url.pathname==='/rest/v1/listings')body=[part,peerTire];
  if(url.pathname==='/rest/v1/parts_catalog'){
   if(error)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'unavailable'})});
   const products=[...catalog,...extra];const id=url.searchParams.get('id')?.replace('eq.','');body=id?products.find(value=>value.id===id):products;
   if(id&&!body)return route.fulfill({status:404,contentType:'application/json',body:JSON.stringify({message:'missing'})});
  }
  return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});
 });
 await page.route(/\/api\/listings\//,route=>route.fulfill({contentType:'application/json',body:JSON.stringify({...part,status:sold?'sold':'active'})}));
}
test('parts filters merge normalized catalog and peer listings and persist the URL',async({page})=>{
 await fixtures(page);await page.goto('/gume-in-deli');await expect(page.locator('.ah-product-card')).toHaveCount(3);
 await page.locator('.ah-parts-hero [data-filter="width"]').selectOption('225');await page.locator('[data-filter="source"]').selectOption('catalog');await expect(page.locator('.ah-product-card')).toHaveCount(1);await expect(page.locator('.ah-product-price')).toContainText('139');
 await page.reload();await expect(page.locator('.ah-product-card')).toHaveCount(1);await page.locator('[data-product-layout="list"]').click();await expect(page.locator('.ah-product-grid')).toHaveClass(/is-list/);
 await page.locator('[data-reset-products]').first().click();await page.locator('[data-product-category="zavore"]').click();await expect(page.locator('.ah-product-card')).toHaveCount(1);await expect(page.locator('.ah-product-info h3')).toHaveText('Bosch zavorne ploščice');
});
test('garage vehicle fills dimensions and registration only searches the private garage',async({page})=>{
 await fixtures(page,{signed:true});await page.goto('/gume-in-deli');await page.locator('[data-parts-vehicle="rav4"]').click();await expect(page.locator('.ah-parts-hero [data-filter="width"]')).toHaveValue('225');await expect(page.locator('.ah-parts-hero [data-filter="aspect"]')).toHaveValue('65');await expect(page.locator('.ah-product-card')).toHaveCount(2);
 await page.locator('.ah-product-info h3 a').filter({hasText:'Michelin Alpin 6'}).click();await expect(page.locator('.ah-product-fit')).toHaveClass(/is-yes/);await expect(page.locator('.ah-product-fit strong')).toHaveText('Ujemanje podatkov');
 await page.locator('[data-choose-vehicle]').click();await page.locator('dialog [name="vehicle"]').selectOption('tesla');await page.locator('dialog button[type="submit"]').click();await expect(page.locator('.ah-product-fit')).toHaveClass(/is-no/);
 await expect(page.locator('dialog')).toHaveCount(0);await page.locator('[data-choose-vehicle]').click();await page.locator('dialog [name="vehicle"]').selectOption('unknown');await page.locator('dialog button[type="submit"]').click();await expect(page.locator('.ah-product-fit strong')).toContainText('preverite indekse');
 await page.goto('/gume-in-deli');await page.locator('[data-parts-mode="plate"]').click();await page.locator('dialog [name="plate"]').fill('LJ AH123');await page.locator('dialog button[type="submit"]').click();await expect(page.locator('[data-parts-vehicle="rav4"]')).toHaveAttribute('aria-pressed','true');
});
test('catalog tyre has correct cheapest available price, safe shop links and a working gallery',async({page})=>{
 await fixtures(page);await page.goto('/katalog?id=tire-1');await expect(page.locator('.ah-catalog-price-heading strong')).toContainText('139');await expect(page.locator('.ah-offer-row')).toHaveCount(4);await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);await expect(page.locator('.ah-offer-row').filter({hasText:'Razprodano'}).locator('a')).toHaveCount(0);
 await page.locator('[data-label-panel]').click();await expect(page.locator('.ah-product-label')).toContainText('70 dB');await page.locator('[data-product-photo="0"]').click();await expect(page.locator('.ah-catalog-photo>img')).toBeVisible();
 await page.locator('[data-offer-sort]').selectOption('stock');await expect(page.locator('.ah-offer-row').first()).not.toContainText('Razprodano');await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'scratch/autohub-qa/catalog-tire-desktop.png',fullPage:true});
});
test('part compatibility, VIN question and sold state do not fake verification or checkout',async({page,context})=>{
 await fixtures(page,{signed:true,sold:true});await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/katalog?id=headlight-1&source=peer&vehicle=rav4');await expect(page.locator('.ah-product-sold')).toBeVisible();await expect(page.locator('[data-compare-product]')).toHaveCount(0);
 await page.locator('[data-vin]').click();await page.locator('dialog [name="vin"]').fill('WVWZZZ1JZXW000001');await expect(page.locator('dialog')).toContainText('Samodejno preverjanje VIN ni na voljo');await page.locator('dialog button[type="submit"]').click();await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toContain('WVWZZZ1JZXW000001');
 await page.setViewportSize({width:390,height:844});await expect(page.locator('dialog')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'scratch/autohub-qa/catalog-part-mobile.png',fullPage:true});
});
test('save and product comparison persist without mixing vehicle comparison',async({page})=>{
 await fixtures(page);await page.goto('/katalog?id=tire-1');await page.locator('.ah-catalog-photo-actions [data-save-product]').click();await page.reload();await expect(page.locator('.ah-catalog-photo-actions [data-save-product]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-compare-product]').click();await expect(page.locator('dialog .ah-product-compare')).toContainText('Michelin Alpin 6');expect(await page.evaluate(()=>localStorage.getItem('avto_compare'))).toBeNull();await page.locator('[data-remove-compared]').click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('avto_catalog_compare')))).toHaveLength(0);
});
test('mobile filters stay open while filtering, reset and reduced motion work',async({page})=>{
 await fixtures(page);await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/gume-in-deli');await page.locator('[data-mobile-filter]').click();await page.locator('.ah-parts-filters [data-filter="width"]').selectOption('225');await expect(page.locator('.ah-product-filter-form')).toBeVisible();await page.locator('[data-flag="snow"]').check();await expect(page.locator('.ah-product-card')).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await page.locator('.ah-product-card').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');await page.screenshot({path:'scratch/autohub-qa/parts-mobile.png',fullPage:true});
});
test('data failures are shown and missing products have a recovery link',async({page})=>{
 test.setTimeout(30000);await fixtures(page,{error:true});await page.goto('/gume-in-deli');await expect(page.locator('.ah-parts-errors')).toContainText('Ponudb trgovin',{timeout:12000});await expect(page.locator('.ah-product-card')).toHaveCount(1);await page.goto('/katalog?id=missing');await expect(page.locator('#catalog-root')).toContainText('Izdelek ni najden',{timeout:12000});await expect(page.locator('#catalog-root a[href="/gume-in-deli"]')).toBeVisible();
});
test('pagination and English labels remain functional',async({page})=>{
 const extra=Array.from({length:10},(_,index)=>({...catalog[1],id:`extra-${index}`,title:`Guma ${index}`}));await fixtures(page,{extra});await page.goto('/gume-in-deli');await expect(page.locator('.ah-product-card')).toHaveCount(9);await page.locator('[data-products-more]').click();await expect(page.locator('.ah-product-card')).toHaveCount(13);await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'scratch/autohub-qa/parts-desktop.png',fullPage:true});await page.evaluate(()=>localStorage.setItem('avto_lang','en'));await page.reload();await expect(page.locator('.ah-parts-hero h1')).toContainText('Tyres and parts');
});

test('part type and price bounds filter the same products as the category tiles',async({page})=>{
 await fixtures(page);await page.goto('/gume-in-deli');await page.locator('[data-product-category="luci"]').click();await expect(page.locator('.ah-product-card')).toHaveCount(1);await expect(page.locator('[data-filter="partType"]')).toHaveValue('zarometi');
 await page.locator('[data-item-type="part"]').click();await expect(page.locator('.ah-product-card')).toHaveCount(2);await page.locator('[data-filter="group"]').selectOption('zavore');await page.locator('[data-filter="partType"]').selectOption('ploscice');await expect(page.locator('.ah-product-card')).toHaveCount(1);
 await page.locator('[data-reset-products]').first().click();await page.locator('input[type="number"][data-filter="priceTo"]').fill('100');await page.locator('input[type="number"][data-filter="priceTo"]').dispatchEvent('change');await expect(page.locator('.ah-product-card')).toHaveCount(1);await expect(page.locator('.ah-product-info h3')).toHaveText('Bosch zavorne ploščice');
 await page.locator('input[type="range"][data-filter="priceFrom"]').fill('150');await page.locator('input[type="range"][data-filter="priceFrom"]').dispatchEvent('change');await expect(page.locator('input[type="number"][data-filter="priceTo"]')).toHaveValue('150');await expect(page.locator('.ah-product-card')).toHaveCount(0);
});

test('a full comparison permits removal before adding another product',async({page})=>{
 await fixtures(page);await page.addInitScript(()=>localStorage.setItem('avto_catalog_compare',JSON.stringify([1,2,3].map(id=>({key:`catalog:old-${id}`,title:`Izdelek ${id}`,price:100,a:{},url:`/katalog?id=old-${id}`})))));
 await page.goto('/katalog?id=tire-1');await page.locator('[data-compare-product]').click();await expect(page.locator('dialog')).toContainText('največ 3');await page.locator('[data-remove-compared]').first().click();await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);await page.locator('[data-compare-product]').click();await expect(page.locator('dialog')).toContainText('Michelin Alpin 6');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('avto_catalog_compare')).length)).toBe(3);
});

test('responsive catalogue and card motion preserve geometry and keyboard dialog behavior',async({browser})=>{
 const context=await browser.newContext({baseURL:'http://localhost:4173',viewport:{width:1440,height:1000},recordVideo:{dir:'scratch/autohub-qa/catalog-motion',size:{width:1440,height:1000}}});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));await fixtures(page);await page.goto('/gume-in-deli');const card=page.locator('.ah-product-card').first();await expect(card).toBeVisible();await card.hover();await expect.poll(()=>card.evaluate(el=>getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, -3)');await page.mouse.move(0,0);await expect.poll(()=>card.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
 for(const width of [360,768,1024,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.goto('/katalog?id=headlight-1&source=peer');await expect(page.locator('h1')).toHaveText('Žaromet LED, levi');await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'scratch/autohub-qa/catalog-part-desktop.png',fullPage:true});await page.locator('[data-inquiry]').first().click();await expect(page.locator('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);await expect(page.locator('[data-inquiry]').first()).toBeFocused();
 for(const width of [360,768,1024]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect(errors).toEqual([]);await context.close();
});
