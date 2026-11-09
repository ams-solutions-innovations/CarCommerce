import { test, expect } from '@playwright/test';

test.describe('Auction Detail Page (/drazba) — AutoHub Reference & 9 States', () => {

    test('renders breadcrumbs, title card, vehicle specs grid, and price chart', async ({ page }) => {
        await page.goto('/drazba?id=auction-car-porsche-gt3');
        await page.waitForSelector('.auction-detail-page');

        // Breadcrumbs & Back button
        const breadcrumbs = page.locator('nav[aria-label="Pot"]');
        await expect(breadcrumbs).toBeVisible();
        await expect(page.locator('#aucBreadcrumbMake')).toContainText('Porsche');
        await expect(page.locator('#aucBackToBoardBtn')).toBeVisible();

        // Title and Subtitle
        await expect(page.locator('#aucHeaderTitle')).toContainText('Porsche 911');

        // Gallery & Active Photo
        await expect(page.locator('#aucMainImg')).toBeVisible();
        await expect(page.locator('#aucThumbnailsGrid .az-th')).toHaveCount(4);

        // 9 Facts Grid
        const facts = page.locator('#aucFactsContainer .fact');
        await expect(facts).toHaveCount(9);
        await expect(facts.first()).toContainText('Prevoženi kilometri');

        // Price Chart SVG & Delta pill
        await expect(page.locator('#aucPriceChartSvgWrap svg')).toBeVisible();
        await expect(page.locator('#aucDeltaPill')).toBeVisible();
    });

    test('4-tile countdown timer ticks and right bidding block displays quick steps', async ({ page }) => {
        await page.goto('/drazba?id=auction-car-porsche-gt3');
        await page.waitForSelector('.auction-detail-page');

        // 4 countdown tiles
        await expect(page.locator('#tileDays')).toBeVisible();
        await expect(page.locator('#tileHours')).toBeVisible();
        await expect(page.locator('#tileMins')).toBeVisible();
        await expect(page.locator('#tileSecs')).toBeVisible();

        // Quick steps (+50 €, +100 €, +500 €, +1000 €)
        const quickSteps = page.locator('#aucQuickSteps button');
        await expect(quickSteps).toHaveCount(4);

        // Click +500 € quick step and check input and premium recalculation
        const plus500 = page.locator('#aucQuickSteps button[data-step="500"]');
        await plus500.click();

        const inputVal = await page.locator('#aucBidInputDisplay').textContent();
        expect(inputVal).toContain('188.000');

        // 3% Buyer Premium recalculation
        const feePremium = await page.locator('#aucFeePremium').textContent();
        expect(feePremium).toContain('€');
    });

    test('bidding commitment modal opens on submit and digital signature canvas allows drawing', async ({ page }) => {
        await page.goto('/drazba?id=auction-car-porsche-gt3');
        await page.waitForSelector('.auction-detail-page');

        // Click submit bid button to open modal
        const submitBtn = page.locator('#aucSubmitBidBtn');
        await submitBtn.click();

        const modal = page.locator('#aucCommitmentBackdrop');
        await expect(modal).toBeVisible();
        await expect(page.locator('#signatureCanvas')).toBeVisible();

        // Signature agreement checkbox
        const checkbox = page.locator('#commitmentAgreementCheck');
        const confirmBtn = page.locator('#confirmCommitmentBtn');
        await expect(confirmBtn).toBeDisabled();

        await checkbox.check();
        await expect(confirmBtn).toBeEnabled();

        // Close modal
        await page.locator('#closeCommitmentModalBtn').click();
        await expect(modal).toBeHidden();
    });

    test('supports auction states (e.g. state 1 - Vodite dražbo & state 2 - Prehiteni ste)', async ({ page }) => {
        // State 1: Vodite dražbo
        await page.goto('/drazba?id=auction-car-porsche-gt3&state=1');
        await page.waitForSelector('.auction-detail-page');

        const banner1 = page.locator('#aucStateBannerContainer .az-st.ok');
        await expect(banner1).toBeVisible();
        await expect(banner1).toContainText('Vodite dražbo');

        // State 2: Prehiteni ste
        await page.goto('/drazba?id=auction-car-porsche-gt3&state=2');
        await page.waitForSelector('.auction-detail-page');

        const banner2 = page.locator('#aucStateBannerContainer .az-st.bad');
        await expect(banner2).toBeVisible();
        await expect(banner2).toContainText('Prehiteni ste');
    });
});
