import { test, expect } from '@playwright/test';

const user = {id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'mobile@example.com',user_metadata:{display_name:'Mobilni uporabnik'},app_metadata:{provider:'email'},created_at:'2026-01-01T00:00:00Z'};
const row = {id:'mobile-car',user_id:user.id,brand:'Porsche',model:'911',price:189900,title:'Porsche 911',platform:'avto',status:'active',item_type:'vehicle',year:2023,created_at:'2026-10-13T08:00:00Z',description:'Vozilo v odličnem stanju.',data:{category:'avto',priceRaw:189900,mileageKm:1200,powerKw:375,fuel:'Petrol',transmission:'Avtomatski',variant:'GT3 PDK',contact:{phone:'+386 1 582 53 00',email:'test@example.com'},seller:'Testni prodajalec',location:{country:'SI',city:'Ljubljana'},images:{exterior:['brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg','brand/autohub/a7a22b55201368869702d79fce33956d.jpg'],interior:[]}}};

test.use({hasTouch:true,isMobile:true});
test.beforeEach(async ({page}) => {
    await page.route(/supabase\.co/, route => {
        const path = new URL(route.request().url()).pathname;
        let data = [];
        if (path === '/auth/v1/user') data = user;
        if (path === '/rest/v1/listings') data = [row];
        if (path === '/rest/v1/profiles') data = {id:user.id,display_name:'Mobilni uporabnik',role:'user',updated_at:'2026-10-13T08:00:00Z',prefs:{vehicles:[],favourites:[]}};
        return route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.route(/\/api\/listings\//,route => route.fulfill({contentType:'application/json',body:JSON.stringify(row)}));
    await page.addInitScript(({user,row}) => {
        const encode = value => btoa(JSON.stringify(value)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
        const expiry = Math.floor(Date.now()/1000)+3600;
        localStorage.setItem('sb-placeholder-auth-token',JSON.stringify({access_token:`${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,aud:'authenticated',role:'authenticated',exp:expiry})}.fixture`,refresh_token:'fixture',expires_at:expiry,expires_in:3600,token_type:'bearer',user}));
        localStorage.setItem('avto_lang','sl');
        localStorage.setItem('avto_compare',JSON.stringify([{id:row.id,title:row.title,make:row.brand,model:row.model,priceEur:row.price}]));
        localStorage.removeItem('theme');
    },{user,row});
});

async function withinViewport(locator) {
    const bounds = await locator.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return {left:rect.left,right:rect.right,width:innerWidth};
    });
    expect(bounds.left).toBeGreaterThanOrEqual(-1);
    expect(bounds.right).toBeLessThanOrEqual(bounds.width+1);
}

for (const width of [320,390,430]) {
    test(`phone screens keep navigation and controls reachable at ${width}px`,async ({page}) => {
        test.setTimeout(90_000);
        await page.setViewportSize({width,height:844});
        for (const path of ['/','/oglasi','/iskanje','/gume-in-deli','/avtohise','/primerjava','/oceni-vrednost','/novi-oglas','/profil','/dashboard','/mape','/oglasne-deske','/oglas?id=mobile-car','/registracija','/prijava']) {
            await page.goto(path,{waitUntil:'domcontentloaded'});
            await expect(page.locator('#app-container h1').first()).toBeVisible();
            await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            const burger = page.locator('#ahMobileButton');
            if (await burger.isVisible()) {
                await withinViewport(burger);
                const box = await burger.boundingBox();
                expect(box.width).toBeGreaterThanOrEqual(44);
                expect(box.height).toBeGreaterThanOrEqual(44);
            }
            if (path === '/iskanje') {
                for (const tab of await page.locator('#vehicleTypeTabs .tab-btn').all()) await withinViewport(tab);
            }
            if (path === '/avtohise') await withinViewport(page.locator('[data-directory-mode="split"]'));
        }
    });
}

test('short phone menu scrolls to settings, closes with Escape and survives rotation',async ({page}) => {
    await page.setViewportSize({width:320,height:568});
    await page.goto('/');
    const trigger = page.locator('#ahMobileButton');
    await trigger.tap();
    const menu = page.locator('#ahMobileMenu');
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded','true');
    expect(await menu.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    await page.locator('#ahMobileTheme').scrollIntoViewIfNeeded();
    await withinViewport(page.locator('#ahMobileTheme'));
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(menu).toBeHidden();
    await trigger.tap();
    await page.setViewportSize({width:1200,height:800});
    await expect(menu).toBeHidden();
});

test('filters contain keyboard focus, apply and sort on touch, and release on resize',async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/oglasi');
    const trigger = page.locator('#mobilePillFilterBtn');
    const sheet = page.locator('.oglasi-sidebar');
    await expect(sheet).toHaveAttribute('inert','');
    await trigger.tap();
    await expect(sheet).toHaveAttribute('aria-hidden','false');
    await expect(page.locator('#header')).toHaveAttribute('inert','');
    await expect(trigger).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('#mobileFilterCloseBtn')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    expect(await sheet.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(sheet).toHaveAttribute('inert','');
    await expect(page.locator('#header')).not.toHaveAttribute('inert','');
    await trigger.tap();
    await page.locator('#mobileFilterApplyBtn').tap();
    await expect(page.locator('body')).not.toHaveClass(/mobile-sheet-lock/);
    await page.locator('#mobilePillSortBtn').tap();
    await page.locator('.mobile-sort-item[data-value="price-asc"]').tap();
    await expect(page.locator('#sortSelect')).toHaveValue('price-asc');
    await expect(page.locator('body')).not.toHaveClass(/mobile-sheet-lock/);
    await trigger.tap();
    await page.setViewportSize({width:1200,height:800});
    await expect(page.locator('body')).not.toHaveClass(/mobile-sheet-lock/);
    await expect(sheet).not.toHaveAttribute('inert','');
});

test('leaving search with an open sheet restores the next page',async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/oglasi');
    await page.locator('#mobilePillFilterBtn').tap();
    await page.evaluate(() => window.navigateTo('/'));
    await expect(page.locator('#autoHubHome h1')).toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/mobile-sheet-lock/);
    await expect(page.locator('#header')).not.toHaveAttribute('inert','');
    await page.locator('#ahMobileButton').tap();
    await expect(page.locator('#ahMobileMenu')).toBeVisible();
});

test('folder dialog fits a short phone and returns focus without losing input',async ({page}) => {
    await page.setViewportSize({width:320,height:568});
    await page.goto('/mape');
    const trigger = page.locator('.ah-workspace-heading [data-new-folder]');
    await trigger.tap();
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();
    await withinViewport(dialog);
    expect((await dialog.boundingBox()).height).toBeLessThanOrEqual(544);
    const input = dialog.locator('[name="name"]');
    await input.fill('Moj naslednji avto');
    expect(await input.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
});

test('listing gallery, contact and tablet summary remain usable',async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/oglas?id=mobile-car');
    await expect(page.locator('#galleryMainImg')).toBeVisible();
    await expect(page.locator('.lp-title-meta')).toContainText('2026');
    await expect(page.locator('.lp-title-meta')).not.toContainText('Invalid Date');
    const initial = await page.locator('#galleryMainImg').getAttribute('src');
    await page.locator('#gallNext').tap();
    await expect(page.locator('#galleryMainImg')).not.toHaveAttribute('src',initial);
    await withinViewport(page.locator('.ah-summary-contact a[href^="tel:"]'));
    await page.setViewportSize({width:768,height:1024});
    await expect(page.locator('.lp-sidebar > .ah-listing-summary')).toBeVisible();
    const gallery = await page.locator('.lp-gallery-main').boundingBox();
    expect(gallery.width).toBeGreaterThan(300);
});

test('redesign exposes the search action above the fold and keeps five navigation tabs',async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/');
    await expect(page.locator('#homeSearchForm')).toBeVisible();
    await expect(page.locator('.ah-bottom-nav a')).toHaveCount(5);
    await expect(page.locator('.ah-bottom-nav [data-bottom-tab=home]')).toHaveAttribute('aria-current','page');
    const action = await page.locator('#homeSearchForm [type=submit]').boundingBox();
    expect(action.y + action.height).toBeLessThan(760);
    expect(await page.locator('.ah-search-grid > .ah-field:visible').count()).toBe(4);
    await page.screenshot({path:'scratch/redesign-phone-home.png'});
    await page.locator('.ah-bottom-nav [data-bottom-tab=search]').tap();
    await expect(page.locator('#carListingsContainer')).toBeVisible();
    await expect(page.locator('.ah-bottom-nav [data-bottom-tab=search]')).toHaveAttribute('aria-current','page');
    const toolbar = await page.locator('#mobileSplitPill').boundingBox();
    const cards = await page.locator('#carListingsContainer').boundingBox();
    expect(toolbar.y).toBeLessThan(cards.y);
    await page.screenshot({path:'scratch/redesign-phone-results.png'});
});

test('tablet uses a full header, two result columns and an accessible side filter drawer',async ({page}) => {
    await page.setViewportSize({width:820,height:1180});
    await page.goto('/oglasi');
    await expect(page.locator('.ah-nav-links')).toBeVisible();
    await expect(page.locator('.ah-bottom-nav')).toBeHidden();
    await expect(page.locator('#carListingsContainer')).toBeVisible();
    const columns = await page.locator('#carListingsContainer').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(2);
    await page.screenshot({path:'scratch/redesign-tablet-results.png'});
    await page.locator('#mobilePillFilterBtn').tap();
    await expect(page.locator('.oglasi-sidebar')).toHaveAttribute('aria-hidden','false');
    await expect(page.locator('#mobileFilterCloseBtn')).toBeFocused();
    await withinViewport(page.locator('.oglasi-sidebar'));
    await page.screenshot({path:'scratch/redesign-tablet-filters.png'});
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobilePillFilterBtn')).toBeFocused();
});

test('phone footer sections expand and desktop keeps its original navigation',async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/');
    const button=page.locator('.ah-footer-toggle').first();
    await expect(button).toHaveAttribute('aria-expanded','false');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded','true');
    await page.setViewportSize({width:1440,height:900});
    await expect(page.locator('.ah-bottom-nav')).toBeHidden();
    await expect(page.locator('.ah-nav-links')).toBeVisible();
    await expect(button).toBeHidden();
});

test('advanced search preserves the home price and opens a requested filter section',async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/');
    await page.locator('#home-price-to').fill('25000');
    await page.locator('#homeAdvancedSearchLink').tap();
    await expect(page).toHaveURL(/priceTo=25000/);
    await expect(page.locator('#acc-engine .adv-acc-trigger')).toHaveAttribute('aria-expanded','false');
    await page.locator('.ah-filter-sections button[aria-controls="acc-engine"]').tap();
    await expect(page.locator('#acc-engine .adv-acc-trigger')).toHaveAttribute('aria-expanded','true');
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:'scratch/redesign-phone-advanced-search.png'});
});

for (const width of [390,820]) test(`seller contact supports quick questions and phone reveal at ${width}px`,async ({page}) => {
    await page.setViewportSize({width,height:1000});
    await page.goto('/oglas?id=mobile-car');
    await page.locator('.ah-summary-contact [href^="mailto:"]').click();
    const dialog=page.locator('.ah-contact-dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('[data-question="0"]').click();
    await expect(dialog.locator('textarea')).toHaveValue('Ali je še na voljo?');
    await expect(dialog.locator('[data-email-contact]')).toHaveAttribute('href',/body=Ali/);
    await dialog.locator('[data-reveal-phone]').click();
    await expect(dialog.locator('[data-phone-number]')).toContainText('+386');
    await withinViewport(dialog);
    await page.screenshot({path:`scratch/redesign-contact-${width}.png`});
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
});

test('gallery swipes change photos while vertical scrolling preserves the photo',async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/oglas?id=mobile-car');
    const gallery = page.locator('.lp-gallery-main');
    await expect(page.locator('#galleryMainImg')).toBeVisible();
    const initial = await page.locator('#galleryMainImg').getAttribute('src');
    const session = await page.context().newCDPSession(page);
    async function swipe(dx,dy) {
        await gallery.scrollIntoViewIfNeeded();
        const box = await gallery.boundingBox();
        const x = box.x+box.width*.7, y = box.y+box.height*.4;
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
    await swipe(-50,100);
    await expect(page.locator('#galleryMainImg')).toHaveAttribute('src',initial);
    await swipe(-120,0);
    await expect(page.locator('#galleryMainImg')).not.toHaveAttribute('src',initial);
    await session.detach();
});
