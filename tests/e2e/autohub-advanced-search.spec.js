import { test,expect } from '@playwright/test';
const rows=[
 {id:'car-match',brand:'BMW',model:'320',price:25000,title:'BMW 320',year:2022,data:{category:'avto',bodyType:'Limuzina',condition:'Rabljeno',mileageKm:35000,powerKw:140,displacementCc:1998,fuel:'Diesel',transmission:'Avtomatski',features:['ABS','ESP'],color:'Bela',sellerType:'Dealer'}},
 {id:'car-other',brand:'BMW',model:'320',price:15000,title:'BMW 320',year:2017,data:{category:'avto',bodyType:'Karavan',condition:'Rabljeno',mileageKm:150000,powerKw:85,displacementCc:1998,fuel:'Diesel',transmission:'Ročni',features:['ABS'],color:'Črna',sellerType:'Private'}},
 {id:'moto-match',brand:'Honda',model:'CB500F',price:6500,title:'Honda CB500F',year:2023,data:{category:'moto',bodyType:'NakedBike',condition:'Rabljeno',mileageKm:5000,powerKw:35,displacementCc:471,fuel:'Petrol',transmission:'Ročni',features:['ABS'],a2Eligible:true,stroke:'4T',cylinders:'2',engine_code:'I2 180°',drivetrain:'veriga'}},
 {id:'moto-other',brand:'Yamaha',model:'MT-09',price:9500,title:'Yamaha MT-09',year:2023,data:{category:'moto',bodyType:'NakedBike',condition:'Rabljeno',mileageKm:10000,powerKw:87,displacementCc:890,fuel:'Petrol',transmission:'Ročni',features:['ABS'],a2Eligible:false,stroke:'4T',cylinders:'3',engine_code:'I3',drivetrain:'veriga'}},
].map(row=>({...row,platform:'avto',status:'active',item_type:'vehicle',created_at:'2026-10-13T08:00:00Z',data:{...row.data,images:{exterior:['brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg']},location:{country:'SI',city:'Ljubljana'}}}));
test.beforeEach(async({page})=>{
 page.on('pageerror',error=>console.error('Page error:',error.message));
 page.on('console',message=>{if(message.type()==='error'||message.text().includes('Live count error')||message.text().includes('Brand data unavailable'))console.error(message.text());});
 await page.route(/supabase\.co/,route=>route.fulfill({contentType:'application/json',body:JSON.stringify(new URL(route.request().url()).pathname==='/rest/v1/listings'?rows:[])}));
 await page.addInitScript(()=>{try{if(!localStorage.getItem('avto_lang'))localStorage.setItem('avto_lang','sl');localStorage.removeItem('theme');}catch(_){}});
});
test('advanced car filters agree with the result count and survive navigation',async({page})=>{
 await page.goto('/iskanje');await expect(page.locator('#searchBtnText')).toHaveText('Prikaži rezultate · 2');
 await page.locator('#grid-cars [data-value="Limuzina"]').click();await page.locator('[name="priceFrom"]').fill('20000');await page.locator('[name="priceTo"]').fill('30000');await page.locator('[name="powerFrom"]').fill('100');
 await page.locator('[name="condition"][value="Rabljeno"]').check();await page.locator('[name="features"][value="ESP"]').check();
 await expect(page.locator('#searchBtnText')).toHaveText('Prikaži rezultate · 1');await page.locator('#searchBtn').click();
 await expect(page).toHaveURL(/\/oglasi\?/);const params=new URL(page.url()).searchParams;expect(params.get('features')).toContain('ESP');expect(params.get('condition')).toBe('Rabljeno');expect(params.get('powerFrom')).toBe('100');
 await expect(page.locator('.listing-card')).toHaveCount(1);await expect(page.locator('.listing-card')).toHaveAttribute('data-car-id','car-match');
});
test('remember saves each section independently and reset clears it',async({page})=>{
 await page.goto('/iskanje');await expect(page.locator('#searchBtnText')).toContainText('2');await page.locator('[name="priceTo"]').fill('30000');await page.locator('[name="powerFrom"]').fill('100');await page.locator('[data-category="osnovni"]').check();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('avto_advanced_avto_osnovni'))).toContain('priceTo=30000');
 const brand=page.locator('.custom-select-container:has(+ #make)');await brand.locator('.custom-select-trigger').click();await brand.locator('.custom-select-option').filter({hasText:'BMW'}).first().click();await expect.poll(()=>page.evaluate(()=>localStorage.getItem('avto_advanced_avto_osnovni'))).toContain('make=BMW');
 await page.reload();await expect(page.locator('[name="priceTo"]')).toHaveValue('30000');await expect(page.locator('#make')).toHaveValue('BMW');await expect(page.locator('[name="powerFrom"]')).toHaveValue('');await expect(page.locator('[data-category="osnovni"]')).toBeChecked();
 await page.locator('button[type="reset"]').click();await expect(page.locator('[name="priceTo"]')).toHaveValue('');await expect(page.locator('[data-category="osnovni"]')).not.toBeChecked();await page.reload();await expect(page.locator('[name="priceTo"]')).toHaveValue('');
});
test('motorcycle A2, stroke and drivetrain reach the results',async({page})=>{
 await page.goto('/iskanje?cat=motor');await expect(page.locator('#searchBtnText')).toHaveText('Prikaži rezultate · 2');await expect(page.locator('#motoMainGrid')).toBeVisible();
 await page.setViewportSize({width:1440,height:1000});expect(await page.locator('#motoMainGrid').evaluate(el=>getComputedStyle(el).display)).toBe('grid');expect(await page.locator('#motoMainGrid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(9);
 await page.locator('#motoMainGrid [data-value="NakedBike"]').click();await page.locator('#advA2Toggle [data-a2="yes"]').click();await page.locator('[name="powerTo"]').fill('35');await page.locator('[name="motoDrivetrain"][value="veriga"]').check();
 await expect(page.locator('#searchBtnText')).toHaveText('Prikaži rezultate · 1');await page.locator('#searchBtn').click();await expect(page.locator('.listing-card')).toHaveCount(1);await expect(page.locator('.listing-card')).toHaveAttribute('data-car-id','moto-match');expect(new URL(page.url()).searchParams.get('a2Eligible')).toBe('yes');
});
test('keyboard accordion, range validation and reduced motion stay usable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/iskanje');await page.locator('#advancedSearchForm[data-ready="true"]').waitFor();const trigger=page.locator('.adv-acc-trigger').first();await trigger.focus();await trigger.press('Enter');await expect(trigger).toHaveAttribute('aria-expanded','false');await trigger.press('Enter');await expect(trigger).toHaveAttribute('aria-expanded','true');
 await page.locator('[name="priceFrom"]').fill('50000');await page.locator('[name="priceTo"]').fill('20000');expect(await page.locator('[name="priceFrom"]').evaluate(el=>el.validity.valid)).toBe(false);
 expect(await page.locator('.adv-acc-body').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
test('mobile sticky search submits and layout fits the viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/iskanje?cat=moto');await expect(page.locator('#searchBtnText')).toContainText('2');await page.locator('#acc-engine .adv-acc-trigger').click();await page.locator('[name="powerTo"]').fill('35');await expect(page.locator('#advStickyBar')).toHaveClass(/visible/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'scratch/autohub-qa/stage3-moto-mobile.png',fullPage:true});await page.locator('#advStickySubmit').click();await expect(page).toHaveURL(/\/oglasi\?/);await expect(page.locator('.listing-card')).toHaveCount(1);
});
test('source vehicle illustrations and English labels appear in the native form',async({page})=>{
 await page.goto('/iskanje');await expect(page.locator('#searchBtnText')).toContainText('2');expect(await page.locator('#grid-cars .ah-vehicle-art').count()).toBeGreaterThan(7);await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'scratch/autohub-qa/stage3-cars-desktop.png',fullPage:true});
 await page.evaluate(()=>localStorage.setItem('avto_lang','en'));await page.reload();await expect(page.locator('.ah-advanced-heading h1')).toHaveText('Advanced search');await expect(page.locator('#searchBtnText')).toHaveText('Show results · 2');
});
test('switching categories restores their own remembered filters',async({page})=>{
 test.setTimeout(30000); // Includes three category loads and a full reload.
 await page.goto('/iskanje');await expect(page.locator('#searchBtnText')).toContainText('2');await page.locator('[name="priceTo"]').fill('30000');await page.locator('[data-category="osnovni"]').check();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('avto_advanced_avto_osnovni'))).toContain('priceTo=30000');
 await page.locator('[data-tab="moto"]').click();await expect(page.locator('#motoMainGrid')).toBeVisible();await expect(page.locator('[name="priceTo"]')).toHaveValue('');await page.locator('[name="priceTo"]').fill('7000');await page.locator('[data-category="osnovni"]').check();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('avto_advanced_moto_osnovni'))).toContain('priceTo=7000');
 await page.locator('[data-tab="avto"]').click();await expect(page.locator('[name="priceTo"]')).toHaveValue('30000');await page.locator('[data-tab="moto"]').click();await expect(page.locator('[name="priceTo"]')).toHaveValue('7000');await page.reload();await expect(page.locator('[name="priceTo"]')).toHaveValue('7000');await expect(page.locator('#motoMainGrid')).toBeVisible();
});
test('five included vehicles persist and removing one restores the add action',async({page})=>{
 test.setTimeout(30000); // Five picker interactions followed by a full reload.
 await page.goto('/iskanje');await expect(page.locator('#searchBtnText')).toContainText('2');
 for(let i=0;i<5;i++){
  const select=page.locator('.custom-select-container:has(+ #make)');await select.locator('.custom-select-trigger').click();await select.locator('.custom-select-option').filter({hasText:'BMW'}).first().click();await page.locator('#addVehicleBtn').click();await expect(page.locator('#vehicleCards .vehicle-entry-card')).toHaveCount(i+1);
 }
 await expect(page.locator('#addVehicleBtn')).toBeHidden();await page.locator('[data-category="osnovni"]').check();await expect.poll(()=>page.evaluate(()=>localStorage.getItem('avto_advanced_avto_osnovni'))).toContain('vehicles=');await page.reload();await expect(page.locator('#vehicleCards .vehicle-entry-card')).toHaveCount(5);await page.locator('#vehicleCards .vec-remove').first().click();await expect(page.locator('#vehicleCards .vehicle-entry-card')).toHaveCount(4);await expect(page.locator('#addVehicleBtn')).toBeVisible();
});
test('electric filters use recorded range and capacity and clear when hidden',async({page})=>{
 test.setTimeout(30000); // Exercises form, result route and a second form load.
 const ev={...rows[0],id:'electric-match',brand:'Tesla',model:'Model Y',title:'Tesla Model Y',data:{...rows[0].data,fuel:'Elektrika',rangeKm:500,batteryKwh:75,chargeTimeMinutes:25,connector:'CCS2'}};
 await page.route(/\/rest\/v1\/listings/,route=>route.fulfill({contentType:'application/json',body:JSON.stringify([...rows,ev])}));
 await page.goto('/iskanje');await expect(page.locator('#searchBtnText')).toContainText('3');await page.locator('[name="fuel"][value="Elektrika"]').check();await expect(page.locator('.ah-electric-filters')).toBeVisible();await page.locator('[name="rangeKmFrom"]').fill('400');await page.locator('[name="batteryKwhFrom"]').fill('60');await expect(page.locator('#searchBtnText')).toHaveText('Prikaži rezultate · 1');
 await page.locator('#searchBtn').click();await expect(page.locator('.listing-card')).toHaveCount(1);await expect(page.locator('.listing-card')).toHaveAttribute('data-car-id','electric-match');
 await page.goto('/iskanje?fuel=Elektrika&rangeKmFrom=400');await expect(page.locator('.ah-electric-filters')).toBeVisible();await page.locator('[name="fuel"][value="Elektrika"]').uncheck();await expect(page.locator('.ah-electric-filters')).toBeHidden();await expect(page.locator('#searchBtnText')).toHaveText('Prikaži rezultate · 3');
});
test('body type deep links and city radius use the same result rules',async({page})=>{
 await page.goto('/iskanje?vtype=Limuzina');await expect(page.locator('#searchBtnText')).toHaveText('Prikaži rezultate · 1');await expect(page.locator('#grid-cars [data-value="Limuzina"]')).toHaveClass(/active/);
 const near={...rows[0],id:'near-car',data:{...rows[0].data,location:{country:'SI',city:'Domžale',lat:46.1381,lng:14.5972}}};const far={...rows[0],id:'far-car',data:{...rows[0].data,location:{country:'SI',city:'Koper',lat:45.5481,lng:13.7302}}};
 await page.route(/\/rest\/v1\/listings/,route=>route.fulfill({contentType:'application/json',body:JSON.stringify([...rows,near,far])}));await page.goto('/iskanje?city=Ljubljana&radius=40');await expect(page.locator('#searchBtnText')).toHaveText('Prikaži rezultate · 3');await page.locator('#searchBtn').click();await expect(page.locator('.listing-card')).toHaveCount(3);await expect(page.locator('.listing-card[data-car-id="near-car"]')).toBeVisible();await expect(page.locator('.listing-card[data-car-id="far-car"]')).toHaveCount(0);
});
