import { test, expect } from '@playwright/test';

test.describe('Paintwork pills dynamic coloring and font visibility', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/iskanje');
        await page.locator('#advancedSearchForm[data-ready="true"]').waitFor();
        const trigger = page.locator('#acc-exterior .adv-acc-trigger');
        if (await trigger.getAttribute('aria-expanded') !== 'true') {
            await trigger.click();
        }
        await expect(page.locator('.adv-chip-paintwork[data-paint="Metallic"]')).toBeVisible();
    });

    test('paintwork pills have descriptive colors by default with visible fonts', async ({ page }) => {
        const metallic = page.locator('.adv-chip-paintwork[data-paint="Metallic"]');
        const navadna = page.locator('.adv-chip-paintwork[data-paint="Navadna"]');
        const pearl = page.locator('.adv-chip-paintwork[data-paint="Pearl"]');
        const mat = page.locator('.adv-chip-paintwork[data-paint="Mat"]');

        await expect(metallic).toBeVisible();
        await expect(navadna).toBeVisible();
        await expect(pearl).toBeVisible();
        await expect(mat).toBeVisible();

        // Metallic has dark text (#0f172a -> rgb(15, 23, 42))
        await expect(metallic).toHaveCSS('color', 'rgb(15, 23, 42)');
        // Navadna has dark text (#0f172a -> rgb(15, 23, 42))
        await expect(navadna).toHaveCSS('color', 'rgb(15, 23, 42)');
        // Pearl has dark text (#0f172a -> rgb(15, 23, 42))
        await expect(pearl).toHaveCSS('color', 'rgb(15, 23, 42)');
        // Mat has white text (#ffffff -> rgb(255, 255, 255))
        await expect(mat).toHaveCSS('color', 'rgb(255, 255, 255)');
    });

    test('selecting Črna switches pills to black variations and white fonts', async ({ page }) => {
        // Click the black color chip
        await page.locator('.adv-color-crna').click();

        const metallic = page.locator('.adv-chip-paintwork[data-paint="Metallic"]');
        const navadna = page.locator('.adv-chip-paintwork[data-paint="Navadna"]');
        const pearl = page.locator('.adv-chip-paintwork[data-paint="Pearl"]');
        const mat = page.locator('.adv-chip-paintwork[data-paint="Mat"]');

        // All fonts must be light/white on black background
        await expect(metallic).toHaveCSS('color', 'rgb(255, 255, 255)');
        await expect(navadna).toHaveCSS('color', 'rgb(255, 255, 255)');
        await expect(pearl).toHaveCSS('color', 'rgb(255, 255, 255)');
        await expect(mat).toHaveCSS('color', 'rgb(243, 244, 246)');
    });

    test('selecting multiple colors reverts pills to default palette', async ({ page }) => {
        await page.locator('.adv-color-crna').click();
        await page.locator('.adv-color-rdeca').click();

        const metallic = page.locator('.adv-chip-paintwork[data-paint="Metallic"]');
        // Reverted to default (dark text for metallic)
        await expect(metallic).toHaveCSS('color', 'rgb(15, 23, 42)');
    });

    test('unselecting one of the multiple colors restores the remaining color palette', async ({ page }) => {
        await page.locator('.adv-color-crna').click();
        await page.locator('.adv-color-rdeca').click();
        // Now uncheck red -> only black remains
        await page.locator('.adv-color-rdeca').click();

        const metallic = page.locator('.adv-chip-paintwork[data-paint="Metallic"]');
        // Black metallic has white text
        await expect(metallic).toHaveCSS('color', 'rgb(255, 255, 255)');
    });

    test('selecting a paintwork pill keeps its paint styling and shows active state', async ({ page }) => {
        const metallic = page.locator('.adv-chip-paintwork[data-paint="Metallic"]');
        await metallic.click();

        const metallicInput = metallic.locator('input');
        await expect(metallicInput).toBeChecked();

        // Computed style should maintain metallic text color
        await expect(metallic).toHaveCSS('color', 'rgb(15, 23, 42)');

        // Check outline / ring is visible
        const outline = await metallic.evaluate(el => getComputedStyle(el).outline);
        expect(outline).toContain('solid');
    });

    test('form reset returns pills to default palette', async ({ page }) => {
        await page.locator('.adv-color-crna').click();
        const metallic = page.locator('.adv-chip-paintwork[data-paint="Metallic"]');
        await expect(metallic).toHaveCSS('color', 'rgb(255, 255, 255)');

        // Click reset button
        await page.locator('button[type="reset"]').click();
        // Should revert to default palette
        await expect(metallic).toHaveCSS('color', 'rgb(15, 23, 42)');
    });
});
