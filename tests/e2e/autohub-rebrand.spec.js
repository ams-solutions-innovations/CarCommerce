import { test, expect } from '@playwright/test';

const listingRows = [
    ['car-premium-1','Porsche','911',215900,189900,'33fcc153d1461b1858fc0ed2282bfe1d.jpg'],
    ['car-premium-2','Tesla','Model S',112400,99900,'45527f0a5c14414fcd8e75ff183204db.jpg'],
    ['car-premium-3','Audi','RS6',148500,null,'a7a22b55201368869702d79fce33956d.jpg'],
].map(([id,brand,model,price,salePriceEur,file])=>({
    id,brand,model,price,title:`${brand} ${model}`,platform:'avto',status:'active',item_type:'vehicle',year:2023,
    created_at:'2026-10-13T08:00:00Z',description:'Vozilo v odličnem stanju.',
    data:{category:'avto',salePriceEur,priceRaw:price,mileageKm:1200,powerKw:375,fuel:'Petrol',transmission:'Avtomatski',variant:'GT3 PDK',
        contact:{phone:'+386 1 582 53 00',email:'test@example.com'},seller:'Testni prodajalec',location:{country:'SI',region:'Osrednjeslovenska',city:'Ljubljana'},
        images:{exterior:[`brand/autohub/${file}`,'brand/autohub/a7a22b55201368869702d79fce33956d.jpg'],interior:[]}},
}));

test.beforeEach(async ({ page }) => {
    // Production builds intentionally contain no demo feed. Provide real-shaped
    // transport fixtures so the tests exercise normalization and the native UI.
    await page.route(/supabase\.co/, route => {
        const url = new URL(route.request().url());
        return route.fulfill({contentType:'application/json',body:JSON.stringify(url.pathname === '/rest/v1/listings' ? listingRows : [])});
    });
    await page.route(/\/api\/listings\//,route=>{
        const url = new URL(route.request().url());
        const id = url.pathname.split('/')[3];
        return route.fulfill({contentType:'application/json',body:JSON.stringify(listingRows.find(row=>row.id===id) || {})});
    });
    await page.addInitScript(() => {
        localStorage.setItem('avto_lang','sl');
        if (!sessionStorage.getItem('themeTestInitialized')) {
            localStorage.removeItem('theme');
            sessionStorage.setItem('themeTestInitialized','1');
        }
        localStorage.removeItem('avto_viewmode');
    });
});

for (const width of [390, 1440]) {
    test(`listing theme changes visible surfaces and persists at ${width}px`, async ({page}) => {
        await page.setViewportSize({width,height:900});
        await page.goto('/oglas?id=car-premium-2');
        const summary = page.locator('.ah-listing-summary');
        await expect(summary).toBeVisible();
        const light = await summary.evaluate(el => getComputedStyle(el).backgroundColor);
        const toggle = async () => {
            if (width < 1024) await page.locator('#ahMobileButton').click();
            await page.locator(width < 1024 ? '#ahMobileTheme' : '#ahTheme').click();
        };
        await toggle();
        await expect(page.locator('body')).toHaveClass(/dark-mode/);
        const dark = await summary.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(dark).not.toBe(light);
        const contrast = await page.locator('.lp-title').evaluate(el => {
            const luminance = color => {
                const rgb = color.match(/[\d.]+/g).slice(0,3).map(Number).map(v => {v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
                return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
            };
            const fg=luminance(getComputedStyle(el).color), bg=luminance(getComputedStyle(el.closest('.ah-listing-summary')).backgroundColor);
            return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
        });
        expect(contrast).toBeGreaterThan(4.5);
        await page.screenshot({path:`scratch/autohub-qa/theme-dark-${width}.png`,fullPage:true});
        await page.reload();
        await expect(page.locator('body')).toHaveClass(/dark-mode/);
        await expect(summary).toBeVisible();
        await toggle();
        await expect(page.locator('body')).not.toHaveClass(/dark-mode/);
        expect(await summary.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(light);
        await page.screenshot({path:`scratch/autohub-qa/theme-light-${width}.png`,fullPage:true});
    });
}

test('native home search preserves brand, price and category through SPA navigation',async ({page})=>{
    await page.goto('/');
    await expect(page.locator('#home-make option[value="Porsche"]')).toHaveCount(1);
    const makeDropdown = page.locator('.custom-select-container:has(+ #home-make)');
    await makeDropdown.locator('.custom-select-trigger').click();
    await makeDropdown.locator('.custom-select-option').filter({hasText:'Porsche'}).first().click();
    await page.locator('#home-price-to').fill('100000');
    await page.locator('#homeSearchForm button[type="submit"]').click();
    await expect(page).toHaveURL(/\/oglasi\?/);
    const params = new URL(page.url()).searchParams;
    expect(params.get('make')).toBe('Porsche');
    expect(params.get('priceTo')).toBe('100000');
    expect(params.get('cat')).toBe('avto');
    await expect(page.locator('.ah-nav')).toBeVisible();
});

test('search mode and recreation category reach the correct route',async ({page})=>{
    await page.goto('/');
    await page.locator('.ah-category-tabs [data-category="prosti-cas"]').click();
    await page.locator('[data-search-mode="drazbe"]').click();
    await page.locator('#homeSearchForm button[type="submit"]').click();
    await expect(page).toHaveURL(/\/drazbe\?cat=prosti-cas/);
});

test('desktop publish animation expands, reverses and remains keyboard accessible',async ({page})=>{
    await page.setViewportSize({width:1440,height:1000});
    await page.goto('/');
    const publish = page.locator('.ah-publish');
    await expect(publish).toBeVisible();
    const initial = await publish.boundingBox();
    const linksInitial = await page.locator('.ah-nav-links').boundingBox();
    const gumeInitial = await page.locator('.ah-nav-links a[href="/gume-in-deli"]').boundingBox();
    await publish.hover();
    await expect.poll(async ()=>(await publish.boundingBox()).width).toBeGreaterThan(120);
    const linksHover = await page.locator('.ah-nav-links').boundingBox();
    const publishHover = await publish.boundingBox();
    expect(Math.abs(linksHover.x - linksInitial.x)).toBeLessThanOrEqual(1);
    expect(publishHover.x).toBeGreaterThan(gumeInitial.x + gumeInitial.width);
    await page.mouse.move(0,900);
    await expect.poll(async ()=>(await publish.boundingBox()).width).toBeLessThan(45);
    await publish.focus();
    await expect.poll(async ()=>(await publish.boundingBox()).width).toBeGreaterThan(initial.width+70);
    await publish.press('Enter');
    await expect(page).toHaveURL(/\/novi-oglas/);
});

test('reduced motion removes animation while keeping the publish label usable',async ({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:1440,height:1000});
    await page.goto('/');
    const publish = page.locator('.ah-publish');
    await publish.focus();
    expect(await publish.evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
    expect(await publish.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
    await expect(publish).toHaveAccessibleName('Objavi oglas');
    expect((await publish.boundingBox()).width).toBeGreaterThan(120);
});

test('account menu closes with Escape and restores focus',async ({page})=>{
    await page.goto('/');
    const button = page.locator('#ahAccountButton');
    await button.click();
    await expect(page.locator('#ahAccountMenu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#ahAccountMenu')).toBeHidden();
    await expect(button).toBeFocused();
});

test('mobile home content and card details remain within their containers',async ({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto('/');
    await expect(page.locator('.ah-home-card-grid .ah-listing-card')).toHaveCount(3);
    const geometry=await page.evaluate(()=>{
        const hero=document.querySelector('.ah-hero-copy h1').getBoundingClientRect();
        const sponsored=document.querySelector('.ah-hero-sponsored').getBoundingClientRect();
        return {width:document.documentElement.scrollWidth,viewport:innerWidth,overlap:hero.right>sponsored.left&&hero.left<sponsored.right&&hero.bottom>sponsored.top&&hero.top<sponsored.bottom,cards:[...document.querySelectorAll('.ah-home-card-grid .ah-listing-card')].map(card=>{const outer=card.getBoundingClientRect(),content=card.querySelector('.ah-card-content').getBoundingClientRect(),photo=card.querySelector('.ah-card-photo').getBoundingClientRect();return {inside:content.left>=outer.left&&content.right<=outer.right+1,stacked:content.top>=photo.bottom-1};})};
    });
    expect(geometry.width).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.overlap).toBe(false);
    expect(geometry.cards.every(card=>card.inside&&card.stacked)).toBe(true);
    await page.locator('#ahMobileButton').click();
    await expect(page.locator('#ahMobileMenu')).toBeVisible();
    await page.locator('#ahMobileMenu a[href="/gume-in-deli"]').click();
    await expect(page).toHaveURL(/\/gume-in-deli/);
    await expect(page.locator('#ahMobileMenu')).toBeHidden();
});

test('search view toggle changes layout without losing its cards',async ({page})=>{
    await page.setViewportSize({width:1440,height:1000});
    await page.goto('/oglasi?cat=avto');
    const cards=page.locator('#carListingsContainer .ah-listing-card');
    await expect(cards.first()).toBeVisible();
    const count=await cards.count();
    await expect(page.locator('#carListingsContainer')).toHaveClass(/list-layout/);
    await page.locator('.view-toggle-btn[data-view="grid"]').click();
    await expect(page.locator('#carListingsContainer')).toHaveClass(/grid-layout/);
    const grid=await cards.first().evaluate(card=>{const photo=card.querySelector('.ah-card-photo').getBoundingClientRect(),content=card.querySelector('.ah-card-content').getBoundingClientRect();return content.top>=photo.bottom-1;});
    expect(grid).toBe(true);
    await page.locator('.view-toggle-btn[data-view="list"]').click();
    await expect(page.locator('#carListingsContainer')).toHaveClass(/list-layout/);
    await expect(cards).toHaveCount(count);
    const list=await cards.first().evaluate(card=>{const photo=card.querySelector('.ah-card-photo').getBoundingClientRect(),heading=card.querySelector('.ah-card-heading').getBoundingClientRect(),price=card.querySelector('.ah-card-price').getBoundingClientRect();return heading.left>=photo.right&&price.left>heading.left&&photo.width===240&&card.getBoundingClientRect().height<260;});
    expect(list).toBe(true);
});

test('listing gallery and responsive summary keep their original actions',async ({page})=>{
    await page.setViewportSize({width:1440,height:1000});
    await page.goto('/oglas?id=car-premium-1');
    await expect(page.locator('.ah-listing-summary')).toBeVisible();
    await expect(page.locator('#listingPage')).toHaveClass(/ah-listing-detail/);
    // Theme transitions are covered separately; this checks gallery and layout actions.
    await expect(page.locator('.ah-summary-contact a[href^="tel:"]')).toBeVisible();
    const initial=await page.locator('#galleryMainImg').getAttribute('src');
    await page.locator('#gallNext').click();
    await expect(page.locator('#galleryMainImg')).not.toHaveAttribute('src',initial);
    await page.locator('#gallPrev').click();
    await expect(page.locator('#galleryMainImg')).toHaveAttribute('src',initial);
    await page.setViewportSize({width:390,height:844});
    await expect(page.locator('.lp-main > .ah-listing-summary')).toBeVisible();
    await page.setViewportSize({width:1440,height:1000});
    await expect(page.locator('.lp-sidebar > .ah-listing-summary')).toBeVisible();
});

test('native search price distribution and slider retain the full available range',async({page})=>{
    await page.setViewportSize({width:1440,height:1000});await page.goto('/oglasi');
    const cards=page.locator('#carListingsContainer .ah-listing-card');await expect(cards).toHaveCount(3);
    await expect(page.locator('.ah-search-price-chart i')).toHaveCount(24);
    const range=page.locator('.ah-search-price-range');const max=await range.getAttribute('max');
    await range.fill('100000');await expect(cards).toHaveCount(1);await expect(page).toHaveURL(/priceTo=100000/);
    await expect(range).toHaveAttribute('max',max);await range.fill('0');await expect(cards).toHaveCount(0);await range.fill(max);await expect(cards).toHaveCount(3);
    await cards.first().locator('.contact-btn').click();await expect(page.locator('.ah-contact-dialog')).toBeVisible();
    await page.screenshot({path:'scratch/autohub-qa/search-contact.png'});
});

test('mobile native search filters preserve geometry and accessible reduced motion',async({page})=>{
    await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/oglasi');
    await expect(page.locator('#carListingsContainer .ah-listing-card')).toHaveCount(3);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:'scratch/autohub-qa/search-mobile.png'});
    await page.locator('#mobilePillFilterBtn').click();await expect(page.locator('.oglasi-sidebar')).toHaveClass(/sheet-open/);
    const fuel=page.locator('#sidebarFiltersForm .adv-acc-trigger').filter({hasText:'Gorivo'});await fuel.scrollIntoViewIfNeeded();
    expect(await page.locator('#sidebarFiltersForm .adv-acc-body').first().evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
    await page.screenshot({path:'scratch/autohub-qa/search-mobile-filters.png'});
});

test('changing language updates the native home and header',async ({page})=>{
    await page.setViewportSize({width:1440,height:1000});
    await page.goto('/');
    await page.locator('#ahLanguageButton').click();
    await page.locator('#ahLanguageMenu [data-ah-lang="en"]').click();
    await expect(page.locator('.ah-hero-copy h1')).toContainText('Let your next');
    await expect(page.locator('#homeSearchForm button[type="submit"]')).toContainText('Show listings');
    await expect(page.locator('#ahLanguageButton')).toContainText('EN');
});
