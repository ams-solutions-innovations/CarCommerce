import { test, expect } from '@playwright/test';

test.describe('Auctions Board (/drazbe) — AutoHub Reference', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/drazbe');
        // Wait for listings to be populated
        await page.waitForSelector('#carListingsContainer article.az-c');
    });

    test('renders breadcrumbs, title with count badge, and header action toolbar', async ({ page }) => {
        // Breadcrumbs
        const breadcrumb = page.locator('nav[aria-label="Pot"]');
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb).toContainText('Domov');
        await expect(breadcrumb).toContainText('Dražbe');

        // Title
        const h1 = page.locator('h1.d');
        await expect(h1).toContainText('Dražbe vozil');

        // Live count badge
        const countBadge = page.locator('#drazbeCount');
        await expect(countBadge).toBeVisible();
        await expect(countBadge).toContainText('dražb');

        // Header actions
        await expect(page.locator('#btnSaveSearchHeader')).toBeVisible();
        await expect(page.locator('#viewToggleGroup')).toBeVisible();
        await expect(page.locator('#drazbeSortBtn')).toBeVisible();
    });

    test('displays 4 top Auction Type filter cards (.az-ty) with counts and interactive filtering', async ({ page }) => {
        const typeCards = page.locator('#auctionTypeCardsGroup .az-ty');
        await expect(typeCards).toHaveCount(4);

        const cardAll = page.locator('#auctionTypeCardsGroup .az-ty.all');
        const cardLiv = page.locator('#auctionTypeCardsGroup .az-ty.liv');
        const cardPre = page.locator('#auctionTypeCardsGroup .az-ty.pre');
        const cardSil = page.locator('#auctionTypeCardsGroup .az-ty.sil');

        await expect(cardAll).toHaveClass(/on/);
        await expect(cardAll).toContainText('Vse dražbe');
        await expect(cardLiv).toContainText('Živa dražba');
        await expect(cardPre).toContainText('Pred-dražba');
        await expect(cardSil).toContainText('Tiha dražba');

        // Filter by Živa dražba
        await cardLiv.click();
        await expect(cardLiv).toHaveClass(/on/);
        await expect(cardAll).not.toHaveClass(/on/);

        // Verify all rendered cards are live
        const liveCards = page.locator('#carListingsContainer article.az-c');
        const count = await liveCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(liveCards.nth(i)).toHaveAttribute('data-type', 'live');
        }

        // Filter by Tiha dražba
        await cardSil.click();
        await expect(cardSil).toHaveClass(/on/);
        const silentCards = page.locator('#carListingsContainer article.az-c');
        const silentCount = await silentCards.count();
        expect(silentCount).toBeGreaterThan(0);
        for (let i = 0; i < silentCount; i++) {
            await expect(silentCards.nth(i)).toHaveAttribute('data-type', 'silent');
        }
    });

    test('renders vehicle specifications as PILLS (.az-spec-pill) with rounded pill styles and icons', async ({ page }) => {
        const firstCard = page.locator('#carListingsContainer article.az-c').first();
        await expect(firstCard).toBeVisible();

        // Check spec pills container
        const pillsContainer = firstCard.locator('.lc-s.az-pills');
        await expect(pillsContainer).toBeVisible();

        // Check individual spec pills
        const pills = pillsContainer.locator('.az-spec-pill');
        const pillCount = await pills.count();
        expect(pillCount).toBeGreaterThanOrEqual(3);

        // Verify border-radius is 9999px (pill style)
        const borderRadius = await pills.first().evaluate(el => window.getComputedStyle(el).borderRadius);
        expect(borderRadius).toMatch(/9999px|99px|50px|28px|14px/);

        // Verify SVG icon exists inside pill
        const svgIcon = pills.first().locator('svg.i');
        await expect(svgIcon).toBeVisible();
    });

    test('renders photo countdown badge, anti-sniper notice, and pricing CTA column', async ({ page }) => {
        const liveCard = page.locator('#carListingsContainer article.az-c[data-type="live"]').first();
        await expect(liveCard).toBeVisible();

        // Timer badge
        const timerBadge = liveCard.locator('.az-tm');
        await expect(timerBadge).toBeVisible();
        await expect(timerBadge.locator('.az-time-text')).not.toBeEmpty();

        // V ŽIVO badge
        await expect(liveCard.locator('.az-lv')).toContainText('V ŽIVO');

        // Anti-sniper notice
        const antiSniper = liveCard.locator('.az-note');
        if (await antiSniper.count() > 0) {
            await expect(antiSniper).toContainText('Zadnje minute: vsaka ponudba doda 2 min.');
        }

        // Pricing column (.az-r)
        const azR = liveCard.locator('.az-r');
        await expect(azR).toBeVisible();
        await expect(azR.locator('.pr')).toBeVisible();
        await expect(azR.locator('.btn-cta')).toBeVisible();

        // Action buttons
        await expect(azR.locator('.btn-notify')).toBeVisible();
        await expect(azR.locator('.btn-save')).toBeVisible();
        await expect(azR.locator('.btn-compare')).toBeVisible();
    });

    test('clicking heart button opens the popover for Oglasne deske / Mape with interactive checkboxes and links', async ({ page }) => {
        const firstCard = page.locator('#carListingsContainer article.az-c').first();
        const saveBtn = firstCard.locator('.btn-save');

        // Initially no popover
        await expect(firstCard.locator('.pop')).toHaveCount(0);

        // Click save/heart button
        await saveBtn.click();

        // Popover appears
        const popover = firstCard.locator('.pop');
        await expect(popover).toBeVisible();
        await expect(popover).toContainText('Shrani v mapo');
        await expect(popover).toContainText('Oglasne deske');

        // Checkboxes in folders & boards
        const folderItem = popover.locator('.pr1').first();
        await expect(folderItem).toBeVisible();

        // Toggle checkbox
        await folderItem.click();

        // Nova deska button and Odpri desko link
        await expect(popover.locator('#popNewBoardBtn')).toBeVisible();
        const openBoardLink = popover.locator('#popOpenBoardLink');
        await expect(openBoardLink).toBeVisible();
        await expect(openBoardLink).toHaveAttribute('href', '/oglasne-deske');
    });

    test('sidebar filters: switch toggles, brand chips, and view mode toggle work', async ({ page }) => {
        // View toggle (List vs Grid)
        const gridBtn = page.locator('#viewToggleGroup button[data-view="grid"]');
        await gridBtn.click();
        await expect(page.locator('#carListingsContainer')).toHaveClass(/grid-layout/);

        const listBtn = page.locator('#viewToggleGroup button[data-view="list"]');
        await listBtn.click();
        await expect(page.locator('#carListingsContainer')).toHaveClass(/list-layout/);

        // Vehicle type toggle
        const motoBtn = page.locator('#vehicleTypeSegment button[data-vtype="moto"]');
        await motoBtn.click();
        await expect(motoBtn).toHaveClass(/on/);

        // Switch back to avto
        const avtoBtn = page.locator('#vehicleTypeSegment button[data-vtype="avto"]');
        await avtoBtn.click();
        await expect(avtoBtn).toHaveClass(/on/);

        // Switch toggle .tsw
        const swCash = page.locator('#swCash');
        await expect(swCash).toBeVisible();
        await swCash.click();
        await expect(swCash).toHaveClass(/on/);

        // Active chips bar
        const activeBar = page.locator('#activeFilterChipsBar');
        await expect(activeBar).toBeVisible();
        await expect(activeBar).toContainText('Gotovinsko plačilo');
    });
});
