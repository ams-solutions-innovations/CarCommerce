import { test, expect } from '@playwright/test';

test.describe('Header Desktop Navigation & Dropdowns', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('groups Dražbe and Najem as flyouts inside the Oglasi dropdown', async ({ page }) => {
        await expect(page.locator('#ahListingsAnchor')).toBeVisible();
        await expect(page.locator('#ahAuctionsAnchor')).toHaveCount(0);
        await expect(page.locator('#ahRentalsAnchor')).toHaveCount(0);
        await expect(page.locator('.ah-burger')).toBeHidden();

        await page.locator('#ahListingsButton').hover();
        const menu = page.locator('#ahListingsMenu');
        await expect(menu).toBeVisible();

        const triggers = menu.locator('.ah-submenu-trigger');
        await triggers.nth(0).hover();
        const auctions = menu.locator('.ah-submenu-anchor').nth(0).locator('.ah-submenu');
        await expect(auctions.locator('a[href="/drazbe"]')).toBeVisible();
        await expect(auctions.locator('a[href="/iskanje-drazbe"]')).toBeVisible();

        await triggers.nth(1).hover();
        const rentals = menu.locator('.ah-submenu-anchor').nth(1).locator('.ah-submenu');
        await expect(rentals.locator('a[href="/najem"]')).toBeVisible();
        await expect(rentals.locator('a[href="/iskanje-najem"]')).toBeVisible();
    });

    test('highlights the Oglasi anchor when visiting /iskanje-drazbe', async ({ page }) => {
        await page.goto('/iskanje-drazbe');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('#ahListingsButton')).toHaveClass(/is-active/);
    });
});

test.describe('Mobile Mode Switcher & Architecture', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('renders mobile modes bar with Oglasi, Dražbe, and Najem pills', async ({ page }) => {
        const bar = page.locator('.ah-mobile-modes-bar');
        await expect(bar).toBeVisible();

        const oglasiPill = page.locator('.ah-mobile-mode-pill[data-mobile-mode="oglasi"]');
        const drazbePill = page.locator('.ah-mobile-mode-pill[data-mobile-mode="drazbe"]');
        const najemPill = page.locator('.ah-mobile-mode-pill[data-mobile-mode="najem"]');

        await expect(oglasiPill).toBeVisible();
        await expect(drazbePill).toBeVisible();
        await expect(najemPill).toBeVisible();

        // Default active pill is Oglasi on home
        await expect(oglasiPill).toHaveClass(/is-active/);
    });

    test('tapping Dražbe mobile pill switches homepage search and updates bottom search tab', async ({ page }) => {
        const drazbePill = page.locator('.ah-mobile-mode-pill[data-mobile-mode="drazbe"]');
        await drazbePill.click();

        // Dražbe pill becomes active
        await expect(drazbePill).toHaveClass(/is-active/);

        // Auction type group is shown on home
        const auctionTypeGroup = page.locator('#group-home-auction-type');
        await expect(auctionTypeGroup).toBeVisible();

        // Advanced search link points to /iskanje-drazbe
        const advLink = page.locator('#homeAdvancedSearchLink');
        await expect(advLink).toHaveAttribute('href', /^\/iskanje-drazbe/);

        // Bottom nav search tab updates contextually to /iskanje-drazbe
        const bottomSearch = page.locator('[data-bottom-tab="search"]');
        await expect(bottomSearch).toHaveAttribute('href', '/iskanje-drazbe');
    });

    test('tapping Najem mobile pill switches homepage search to rental mode', async ({ page }) => {
        const najemPill = page.locator('.ah-mobile-mode-pill[data-mobile-mode="najem"]');
        await najemPill.click();

        await expect(najemPill).toHaveClass(/is-active/);

        // Rental duration is shown
        const rentalDurationGroup = page.locator('#group-home-rental-duration');
        await expect(rentalDurationGroup).toBeVisible();

        // Price label updates
        const priceLabel = page.locator('#home-price-to-label');
        await expect(priceLabel).toHaveText('Cena na dan (€/dan)');

        // Advanced search link points to /iskanje-najem
        const advLink = page.locator('#homeAdvancedSearchLink');
        await expect(advLink).toHaveAttribute('href', /^\/iskanje-najem/);

        // Bottom search points to /iskanje-najem
        const bottomSearch = page.locator('[data-bottom-tab="search"]');
        await expect(bottomSearch).toHaveAttribute('href', '/iskanje-najem');
    });

    test('on dedicated /iskanje-drazbe page, mobile pill is Dražbe and bottom search is /iskanje-drazbe', async ({ page }) => {
        await page.goto('/iskanje-drazbe');
        await page.waitForLoadState('networkidle');

        const drazbePill = page.locator('.ah-mobile-mode-pill[data-mobile-mode="drazbe"]');
        await expect(drazbePill).toHaveClass(/is-active/);

        const bottomSearch = page.locator('[data-bottom-tab="search"]');
        await expect(bottomSearch).toHaveAttribute('href', '/iskanje-drazbe');
    });
});
