import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        try {
            if (!localStorage.getItem('avto_lang')) localStorage.setItem('avto_lang', 'sl');
            localStorage.removeItem('theme');
        } catch (_) {}
    });
});

test('home search mode switches dynamically between Oglasi, Dražbe and Najem', async ({ page }) => {
    await page.goto('/');

    const modePills = page.locator('#homeSearchMode');
    await expect(modePills).toBeVisible();

    const mileageGroup = page.locator('#group-home-mileage');
    const auctionTypeGroup = page.locator('#group-home-auction-type');
    const rentalDurationGroup = page.locator('#group-home-rental-duration');
    const priceLabel = page.locator('#home-price-to-label');
    const advLink = page.locator('#homeAdvancedSearchLink');

    // 1. Initial mode: Oglasi
    await expect(mileageGroup).toBeVisible();
    await expect(auctionTypeGroup).toBeHidden();
    await expect(rentalDurationGroup).toBeHidden();
    await expect(advLink).toHaveAttribute('href', '/iskanje?cat=avto');

    // 2. Switch to Dražbe
    await page.locator('#homeSearchMode [data-search-mode="drazbe"]').click();
    await expect(mileageGroup).toBeHidden();
    await expect(auctionTypeGroup).toBeVisible();
    await expect(rentalDurationGroup).toBeHidden();
    await expect(advLink).toHaveAttribute('href', '/iskanje-drazbe?cat=avto');

    // Select auction type
    await page.locator('#home-auction-type').selectOption('live', { force: true });
    expect(await page.locator('#home-auction-type').inputValue()).toBe('live');

    // 3. Switch to Najem
    await page.locator('#homeSearchMode [data-search-mode="najem"]').click();
    await expect(mileageGroup).toBeHidden();
    await expect(auctionTypeGroup).toBeHidden();
    await expect(rentalDurationGroup).toBeVisible();
    await expect(priceLabel).toContainText('dan');
    await expect(advLink).toHaveAttribute('href', '/iskanje-najem?cat=avto');

    // Select rental duration
    await page.locator('#home-rental-duration').selectOption('weekend', { force: true });
    expect(await page.locator('#home-rental-duration').inputValue()).toBe('weekend');

    // 4. Switch back to Oglasi
    await page.locator('#homeSearchMode [data-search-mode="oglasi"]').click();
    await expect(mileageGroup).toBeVisible();
    await expect(auctionTypeGroup).toBeHidden();
    await expect(rentalDurationGroup).toBeHidden();
    await expect(advLink).toHaveAttribute('href', '/iskanje?cat=avto');
});
