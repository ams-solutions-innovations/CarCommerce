import { test,expect } from '@playwright/test';

const uid='11111111-1111-4111-8111-111111111111';
const user={id:uid,aud:'authenticated',role:'authenticated',email:'design@example.com',user_metadata:{display_name:'Testni uporabnik'},app_metadata:{provider:'email'},created_at:'2026-01-01T00:00:00Z'};
const row={id:'saved-porsche',brand:'Porsche',model:'911',price:215900,title:'Porsche 911',platform:'avto',status:'active',item_type:'vehicle',year:2023,created_at:'2026-10-13T08:00:00Z',data:{category:'avto',salePriceEur:189900,priceRaw:215900,mileageKm:1200,powerKw:375,fuel:'Petrol',transmission:'Avtomatski',variant:'GT3 PDK',seller:'Testni prodajalec',location:{country:'SI',city:'Ljubljana'},images:{exterior:['brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg']}}};

async function signedFixture(page,{conflict=false,reject=false,customRows=null,customFavourites=null}={}){
    let stamp=0;let conflicted=false;let patches=0;
    const activeRows=customRows||[row];
    let prefs={vehicles:[{id:'garage-1',make:'BMW',nickname:'Ohranjena garaža'}],sentinel:'keep',favourites:customFavourites||[{listingId:row.id,title:row.title,priceEur:215900,image:row.data.images.exterior[0],savedAt:'2026-01-01T00:00:00Z'}]};
    const updated=()=>new Date(Date.UTC(2026,9,13,10,0,stamp)).toISOString();
    await page.route(/supabase\.co/,async route=>{
        const request=route.request();const url=new URL(request.url());
        let body=[];
        if(url.pathname==='/auth/v1/user')body=user;
        if(url.pathname==='/rest/v1/listings')body=activeRows;
        if(url.pathname==='/rest/v1/profiles'){
            if(request.method()==='PATCH'){
                patches++;
                if(reject)return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({code:'42501',message:'Test: shranjevanje zavrnjeno'})});
                if(conflict&&!conflicted){conflicted=true;prefs.externalChange='preserve';stamp++;return route.fulfill({contentType:'application/json',body:'[]'});}
                expect(url.searchParams.get('id')).toBe(`eq.${uid}`);
                expect(url.searchParams.get('updated_at')).toBe(`eq.${updated()}`);
                prefs=request.postDataJSON().prefs;stamp++;
            }
            body={id:uid,email:user.email,display_name:'Testni uporabnik',role:'user',prefs,updated_at:updated()};
            if(request.method()==='PATCH'&&!request.headers().accept?.includes('vnd.pgrst.object'))body=[body];
        }
        return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});
    });
    await page.route(/\/api\/listings\//,route=>{
        const match=activeRows.find(r=>route.request().url().includes(r.id))||activeRows[0];
        return route.fulfill({contentType:'application/json',body:JSON.stringify(match)});
    });
    await page.addInitScript(({user})=>{
        const encode=value=>btoa(JSON.stringify(value)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
        const expiry=Math.floor(Date.now()/1000)+3600;
        const token=`${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,aud:'authenticated',role:'authenticated',exp:expiry})}.fixture`;
        localStorage.setItem('sb-placeholder-auth-token',JSON.stringify({access_token:token,refresh_token:'fixture-refresh',expires_at:expiry,expires_in:3600,token_type:'bearer',user}));
        localStorage.setItem('avto_lang','sl');localStorage.removeItem('theme');
    },{user});
    return {prefs:()=>prefs,patches:()=>patches};
}

test('folder persistence retries concurrent updates and preserves garage and favourites',async({page})=>{
    const fixture=await signedFixture(page,{conflict:true});await page.goto('/mape');
    await expect(page.locator('.ah-workspace h1')).toHaveText('Moje mape');
    await page.locator('.ah-workspace-heading [data-new-folder]').click();
    await page.locator('dialog [name="name"]').fill('Družinski avto');
    await page.locator('dialog button[type="submit"]').click();
    await expect(page.locator('.ah-section-heading h2')).toHaveText('Družinski avto');
    expect(fixture.patches()).toBe(2);expect(fixture.prefs().externalChange).toBe('preserve');expect(fixture.prefs().sentinel).toBe('keep');expect(fixture.prefs().vehicles[0].id).toBe('garage-1');
    await page.locator('[data-add]').click();await page.locator('dialog [data-pick]').first().click();
    await expect(page.locator('.ah-saved-car')).toHaveCount(1);
    await page.locator('[data-note]').click();await page.locator('dialog textarea').fill('Preveri servisno zgodovino');await page.locator('dialog button[type="submit"]').click();
    await expect(page.locator('.ah-saved-note')).toHaveText('Preveri servisno zgodovino');
    await expect(page.locator('dialog')).toHaveCount(0);
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:'scratch/autohub-qa/stage2-folders-desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:'scratch/autohub-qa/stage2-folders-mobile.png',fullPage:true});
    await page.reload();await expect(page.locator('.ah-saved-note')).toHaveText('Preveri servisno zgodovino');
    await page.locator('[data-delete]').click();await page.locator('dialog button[type="submit"]').click();
    await expect(page.locator('.ah-section-heading h2')).toHaveText('Vsi shranjeni');expect(fixture.prefs().autohubCollections.folders).toHaveLength(0);expect(fixture.prefs().favourites).toHaveLength(1);expect(fixture.prefs().vehicles).toHaveLength(1);
    await page.locator('.ah-saved-car .ah-list-heart').click();await expect(page.locator('.ah-saved-car')).toHaveCount(0);expect(fixture.prefs().favourites).toHaveLength(0);expect(fixture.prefs().vehicles).toHaveLength(1);
});

test('failed saving keeps dialog input and displays the server error',async({page})=>{
    const fixture=await signedFixture(page,{reject:true});await page.goto('/mape');
    await page.locator('.ah-workspace-heading [data-new-folder]').click();await page.locator('dialog [name="name"]').fill('Ne izgubi vnosa');await page.locator('dialog button[type="submit"]').click();
    await expect(page.locator('dialog [role="alert"]')).toContainText('shranjevanje zavrnjeno');await expect(page.locator('dialog [name="name"]')).toHaveValue('Ne izgubi vnosa');expect(fixture.prefs().autohubCollections).toBeUndefined();
    await page.locator('dialog').press('Escape');await expect(page.locator('dialog')).toHaveCount(0);await expect(page.locator('.ah-workspace-heading [data-new-folder]')).toBeFocused();
});

test('board column, vote, note and drag movement survive reload',async({page})=>{
    const fixture=await signedFixture(page);await page.goto('/oglasne-deske');
    await page.locator('.ah-workspace-heading [data-new-board]').click();await page.locator('dialog [name="name"]').fill('Naslednji avto');await page.locator('dialog [name="maxPrice"]').fill('200000');await page.locator('dialog button[type="submit"]').click();
    await page.locator('.ah-board-banner [data-add-card]').click();await page.locator('dialog [data-pick]').first().click();
    await expect(page.locator('.ah-board-car')).toHaveCount(1);await page.locator('[data-card-column]').selectOption('viewing');
    await expect(page.locator('[data-drop-column="viewing"] .ah-board-car')).toHaveCount(1);
    await page.locator('[data-vote="yes"]').click();await expect(page.locator('[data-vote="yes"]')).toHaveAttribute('aria-pressed','true');
    await page.locator('[data-note-form] textarea').fill('Ogled v soboto');await page.locator('[data-save-note]').click();
    await expect(page.locator('.ah-board-note-preview')).toHaveText('Ogled v soboto');
    await page.locator('.ah-board-car').dragTo(page.locator('[data-drop-column="finalists"] .ah-board-add'));
    await expect(page.locator('[data-drop-column="finalists"] .ah-board-car')).toHaveCount(1);
    await page.reload();await expect(page.locator('[data-drop-column="finalists"] .ah-board-car')).toHaveCount(1);await expect(page.locator('[data-vote="yes"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-note-form] textarea')).toHaveValue('Ogled v soboto');expect(fixture.prefs().vehicles).toHaveLength(1);
    await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'scratch/autohub-qa/stage2-board-desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('directory filters and map selection preserve valid profile and booking links',async({page})=>{
    await page.goto('/avtohise');await expect(page.locator('.ah-business-card').first()).toBeVisible();
    await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'scratch/autohub-qa/stage2-directory-desktop.png',fullPage:true});
    const count=await page.locator('.ah-business-card').count();await page.locator('[data-type="service"]').click();expect(await page.locator('.ah-business-card').count()).toBeLessThan(count);
    await page.locator('[data-directory-filter="booking"]').check();await expect(page.locator('.ah-business-card-actions a[href^="/booking?businessId="]').first()).toBeVisible();
    await page.locator('[data-reset]').first().click();await page.locator('[name="brand"]').selectOption('BMW');await page.locator('.ah-directory-search button[type="submit"]').click();
    for(const card of await page.locator('.ah-business-card').all())await expect(card.locator('.ah-authorized-brands')).toContainText('BMW');
    await page.locator('[data-select-business]').first().click();await expect(page.locator('.ah-business-card.is-selected')).toHaveCount(1);
    await page.locator('[data-directory-mode="list"]').click();await expect(page.locator('.ah-directory-map-panel')).toBeHidden();
    await page.reload();await expect(page.locator('[name="brand"]')).toHaveValue('BMW');await expect(page.locator('.ah-directory-map-panel')).toBeHidden();
    await page.setViewportSize({width:390,height:844});await page.locator('[data-directory-mode="split"]').click();await expect(page.locator('.ah-directory-map-panel')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('private workspace requires authentication',async({page})=>{
    await page.route(/supabase\.co/,route=>route.fulfill({contentType:'application/json',body:'[]'}));await page.goto('/mape');await expect(page).toHaveURL(/\/prijava/);await expect(page.locator('.ah-folders-layout')).toHaveCount(0);
});

test('sorting, filter counts, quick compare and rejected column work as designed',async({page})=>{
    const customRows=[
        {id:'porsche-gt3',brand:'Porsche',model:'911',price:215900,title:'Porsche 911 GT3',platform:'avto',status:'active',item_type:'vehicle',year:2023,created_at:'2026-10-13T08:00:00Z',data:{category:'avto',salePriceEur:189900,priceRaw:215900,mileageKm:12400,powerKw:375,fuel:'Petrol',transmission:'Avtomatski',variant:'GT3 PDK',seller:'Prodajalec',location:{country:'SI',city:'Ljubljana'},images:{exterior:['brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg']}}},
        {id:'audi-rs6',brand:'Audi',model:'RS6',price:112500,title:'Audi RS6 Avant',platform:'avto',status:'active',item_type:'vehicle',year:2021,created_at:'2026-10-13T08:00:00Z',data:{category:'avto',salePriceEur:112500,priceRaw:112500,mileageKm:38200,powerKw:441,fuel:'Petrol',transmission:'Avtomatski',variant:'Avant',seller:'Prodajalec',location:{country:'SI',city:'Ljubljana'},images:{exterior:['brand/autohub/a7a22b55201368869702d79fce33956d.jpg']}}},
        {id:'tesla-s',brand:'Tesla',model:'Model S',price:100400,title:'Tesla Model S Plaid',platform:'avto',status:'active',item_type:'vehicle',year:2022,created_at:'2026-10-13T08:00:00Z',data:{category:'avto',salePriceEur:98900,priceRaw:100400,mileageKm:21500,powerKw:750,fuel:'Electric',transmission:'Avtomatski',variant:'Plaid',seller:'Prodajalec',location:{country:'SI',city:'Kranj'},images:{exterior:['brand/autohub/45527f0a5c14414fcd8e75ff183204db.jpg']}}}
    ];
    const customFavourites=[
        {listingId:'porsche-gt3',title:'Porsche 911 GT3',priceEur:215900,image:'brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg',savedAt:'2026-01-01T00:00:00Z'},
        {listingId:'audi-rs6',title:'Audi RS6 Avant',priceEur:112500,image:'brand/autohub/a7a22b55201368869702d79fce33956d.jpg',savedAt:'2026-01-02T00:00:00Z'},
        {listingId:'tesla-s',title:'Tesla Model S Plaid',priceEur:100400,image:'brand/autohub/45527f0a5c14414fcd8e75ff183204db.jpg',savedAt:'2026-01-03T00:00:00Z'}
    ];

    await signedFixture(page,{customRows,customFavourites});
    await page.goto('/mape');

    // 1. Verify notification banners exist
    await expect(page.locator('.ah-workspace-banners')).toBeVisible();
    await expect(page.locator('.ah-banner-card.is-teal')).toContainText(/padc/i);

    // 2. Verify filter counts
    await expect(page.locator('[data-filter="all"] .ah-filter-count')).toHaveText('3');
    await expect(page.locator('[data-filter="drops"] .ah-filter-count')).toHaveText('2');

    // 3. Test car sorting by price asc (Tesla 98.900 should be first)
    await page.locator('[data-car-sort]').selectOption('price_asc');
    const firstCar = page.locator('.ah-saved-car').first();
    await expect(firstCar).toContainText('Tesla');

    // 4. Test price drop pill display (Porsche dropped from 215.900 to 189.900 = 26.000 €)
    await expect(page.locator('.ah-price-drop-pill').first()).toBeVisible();

    // 5. Test Quick Compare selection and floating bar
    await page.locator('[data-compare-toggle]').first().click();
    await page.locator('[data-compare-toggle]').nth(1).click();
    await expect(page.locator('.ah-compare-floating-bar')).toBeVisible();
    await expect(page.locator('.ah-compare-bar-info strong')).toContainText('2 oglasov izbranih');

    // 6. Run Compare view
    await page.locator('[data-run-compare]').click();
    await expect(page.locator('.ah-quick-compare-wrapper')).toBeVisible();
    await expect(page.locator('.ah-quick-compare-table .ah-cmp-cell.is-win').first()).toBeVisible();

    // 7. Verify Board rejected column
    await page.goto('/oglasne-deske');
    await page.locator('.ah-workspace-heading [data-new-board]').click();
    await page.locator('dialog [name="name"]').fill('Družinski izbor');
    await page.locator('dialog button[type="submit"]').click();
    await page.locator('.ah-board-banner [data-add-card]').click();
    await page.locator('dialog [data-pick]').first().click();
    
    // Move to rejected
    await page.locator('[data-card-column]').selectOption('rejected');
    await expect(page.locator('.ah-board-rejected-bar')).toBeVisible();
    await expect(page.locator('.ah-rejected-item')).toHaveCount(1);
});
