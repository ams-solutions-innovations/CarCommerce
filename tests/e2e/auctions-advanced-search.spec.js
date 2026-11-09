import { test, expect } from '@playwright/test';

const rows = [
    {
        id: 'car-normal',
        brand: 'BMW',
        model: '320',
        price: 25000,
        title: 'BMW 320d',
        year: 2022,
        entryType: 'classic',
        data: {
            category: 'avto',
            bodyType: 'Limuzina',
            condition: 'Rabljeno',
            mileageKm: 35000,
            powerKw: 140,
            fuel: 'Diesel',
            transmission: 'Avtomatski',
            entryType: 'classic',
        }
    },
    {
        id: 'auction-live-1',
        brand: 'BMW',
        model: 'M3',
        price: 55000,
        title: 'BMW M3 Competition',
        year: 2022,
        entryType: 'auction',
        data: {
            category: 'avto',
            bodyType: 'Limuzina',
            condition: 'Rabljeno',
            mileageKm: 25000,
            powerKw: 375,
            fuel: 'Petrol',
            transmission: 'Avtomatski',
            entryType: 'auction',
            auctionType: 'live',
            startPriceEur: 45000,
            currentBidEur: 55000,
            bindingContract: true,
            cashAllowed: true,
            auctionBinding: true,
            auctionCash: true,
            endsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            bidCount: 5,
        }
    },
    {
        id: 'auction-silent-1',
        brand: 'Porsche',
        model: '911',
        price: 90000,
        title: 'Porsche 911 Carrera',
        year: 2021,
        entryType: 'auction',
        data: {
            category: 'avto',
            bodyType: 'Coupe',
            condition: 'Rabljeno',
            mileageKm: 15000,
            powerKw: 283,
            fuel: 'Petrol',
            transmission: 'Avtomatski',
            entryType: 'auction',
            auctionType: 'silent',
            startPriceEur: 80000,
            reservePriceEur: 95000,
            currentBidEur: 90000,
            bindingContract: false,
            cashAllowed: false,
            auctionBinding: false,
            auctionCash: false,
            endsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            bidCount: 2,
        }
    }
].map(row => ({
    ...row,
    platform: 'avto',
    status: 'active',
    item_type: 'vehicle',
    created_at: '2026-10-13T08:00:00Z',
    data: {
        ...row.data,
        images: { exterior: ['brand/autohub/33fcc153d1461b1858fc0ed2282bfe1d.jpg'] },
        location: { country: 'SI', city: 'Ljubljana' }
    }
}));

test.beforeEach(async ({ page }) => {
    page.on('pageerror', error => console.error('Page error:', error.message));
    await page.route(/supabase\.co/, route => route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(new URL(route.request().url()).pathname === '/rest/v1/listings' ? rows : [])
    }));
    await page.addInitScript(() => {
        try {
            if (!localStorage.getItem('avto_lang')) localStorage.setItem('avto_lang', 'sl');
            localStorage.removeItem('theme');
        } catch (_) {}
    });
});

test('navbar includes Dražbe link in listings submenu and /iskanje has no auction toggle', async ({ page }) => {
    await page.goto('/');
    
    // Check dropdown link in navbar
    const listingsAnchor = page.locator('#ahListingsAnchor');
    await expect(listingsAnchor).toBeVisible();
    await listingsAnchor.hover();
    const drazbeSubLink = page.locator('#ahListingsMenu a[href="/iskanje-drazbe"]');
    await expect(drazbeSubLink).toBeVisible();
    await expect(drazbeSubLink).toContainText('Dražbe');

    // Go to /iskanje and verify #searchTypePills is absent/hidden
    await page.goto('/iskanje');
    await expect(page.locator('#searchTypePills')).toBeHidden();
    // Verify count on /iskanje counts only regular listings (1 car-normal)
    await expect(page.locator('#searchBtnText')).toContainText('1');

    // Verify /iskanje?mode=drazbe redirects to /iskanje-drazbe
    await page.goto('/iskanje?mode=drazbe');
    await expect(page).toHaveURL(/\/iskanje-drazbe/);
});

test('auction advanced search has dedicated auction filters and routes to /drazbe', async ({ page }) => {
    await page.goto('/iskanje-drazbe');
    
    // Verify auction parameters section is visible
    await expect(page.locator('#acc-auction-params')).toBeVisible();
    await expect(page.locator('[name="aucType"][value="live"]')).toBeVisible();
    await expect(page.locator('[name="aucStatus"][value="active"]')).toBeVisible();
    await expect(page.locator('[name="startPriceFrom"]')).toBeVisible();

    // Verify live count reflects only auction listings (2 auction items)
    await expect(page.locator('#searchBtnText')).toContainText('2');

    // Filter by live auction type
    await page.locator('[name="aucType"][value="live"]').check();
    await expect(page.locator('#searchBtnText')).toContainText('1');

    // Submit and verify navigation to /drazbe
    await page.locator('#searchBtn').click();
    await expect(page).toHaveURL(/\/drazbe\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get('aucType')).toBe('live');
    expect(url.searchParams.get('advanced')).toBe('1');
});

test('homepage search mode toggle changes "Več filtrov" target to /iskanje-drazbe', async ({ page }) => {
    await page.goto('/');
    
    const moreFilters = page.locator('#homeAdvancedSearchLink');
    await expect(moreFilters).toHaveAttribute('href', '/iskanje?cat=avto');

    // Click "Išči dražbe" mode pill on home
    await page.locator('#homeSearchMode [data-search-mode="drazbe"]').click();
    await expect(moreFilters).toHaveAttribute('href', '/iskanje-drazbe?cat=avto');
});
