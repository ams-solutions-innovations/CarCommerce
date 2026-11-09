import { test, expect } from '@playwright/test';

test.describe('Advanced Search — Passenger Cars Prototype & Filter Icons', () => {
    test.beforeEach(async ({ page }) => {
        // Mock supabase listings for predictable live count
        const mockCars = [
            {
                id: 'car-1',
                brand: 'BMW',
                model: '320',
                price: 25000,
                title: 'BMW 320d Limuzina',
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
                    color: 'Črna',
                    features: ['ABS', 'ESP'],
                }
            },
            {
                id: 'car-2',
                brand: 'Audi',
                model: 'A4',
                price: 32000,
                title: 'Audi A4 Avant',
                year: 2023,
                entryType: 'classic',
                data: {
                    category: 'avto',
                    bodyType: 'Karavan',
                    condition: 'Rabljeno',
                    mileageKm: 18000,
                    powerKw: 150,
                    fuel: 'Bencin',
                    transmission: 'Avtomatski',
                    color: 'Bela',
                    features: ['ABS', 'ESP'],
                }
            }
        ];

        await page.route(/supabase\.co/, route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(new URL(route.request().url()).pathname === '/rest/v1/listings' ? mockCars : []),
        }));
    });

    test('every filter parameter (.fl) has an icon directly to the left of the title', async ({ page }) => {
        await page.goto('/iskanje?cat=avto');
        await expect(page.locator('#advancedSearchForm')).toBeVisible();

        const filterLabels = page.locator('.platform-avto .fl');
        const count = await filterLabels.count();
        expect(count).toBeGreaterThan(12);

        // Verify every filter label row contains an SVG icon with class .i referencing an icon symbol
        let visibleCount = 0;
        for (let i = 0; i < count; i++) {
            const label = filterLabels.nth(i);
            const icon = label.locator('svg.i').first();
            await expect(icon).toBeAttached();

            const useHref = await icon.locator('use').getAttribute('href');
            expect(useHref).toBeTruthy();

            // When label is visible, icon must be visible and placed to the left of the text
            if (await label.isVisible()) {
                await expect(icon).toBeVisible();
                const iconBox = await icon.boundingBox();
                const textBox = await label.locator('span').first().boundingBox();
                if (iconBox && textBox) {
                    expect(iconBox.x).toBeLessThan(textBox.x);
                    visibleCount++;
                }
            }
        }
        expect(visibleCount).toBeGreaterThan(10);
    });

    test('renders all 9 passenger car body types with silhouettes and toggles selection', async ({ page }) => {
        await page.goto('/iskanje?cat=avto');
        await expect(page.locator('#grid-cars')).toBeVisible();

        const carTypes = [
            'Limuzina', 'Kombilimuzina', 'Karavan', 'Terensko', 
            'Enoprostorec', 'Kabriolet', 'Coupe', 'Sportni', 'Pick-up'
        ];

        for (const type of carTypes) {
            const card = page.locator(`#grid-cars .body-type-card[data-value="${type}"]`);
            await expect(card).toBeVisible();
            await expect(card.locator('img')).toBeVisible();
        }

        // Click Limuzina
        const limuzina = page.locator('#grid-cars .body-type-card[data-value="Limuzina"]');
        await limuzina.click();
        await expect(limuzina).toHaveClass(/active/);
        await expect(limuzina).toHaveClass(/on/);
        await expect(page.locator('#bodyTypeHidden')).toHaveValue('Limuzina');

        // Checkmark circle .vk is visible when active
        await expect(limuzina.locator('.vk')).toBeVisible();
    });

    test('dual range sliders update input fields and summary values', async ({ page }) => {
        await page.goto('/iskanje?cat=avto');

        // Price slider inputs
        const priceFrom = page.locator('#priceFromInput');
        const priceTo = page.locator('#priceToInput');
        await priceFrom.fill('20000');
        await priceFrom.dispatchEvent('change');
        await priceTo.fill('80000');
        await priceTo.dispatchEvent('change');

        await expect(page.locator('#priceRangeSummary')).toContainText('20.000 – 80.000 €');

        // Mileage slider inputs
        const kmTo = page.locator('#mileage-to');
        await kmTo.fill('50000');
        await kmTo.dispatchEvent('change');
        await expect(page.locator('#mileageRangeSummary')).toContainText('50.000 km');
    });

    test('chips, swatches, and live count badge function smoothly', async ({ page }) => {
        await page.goto('/iskanje?cat=avto');

        // Initially both cars match
        await expect(page.locator('#searchBtnText')).toContainText('2');

        // Filter by fuel Dizel (only car-1 matches)
        const dieselChip = page.locator('.chip:has(input[name="fuel"][value="Dizel"])');
        await dieselChip.click();
        await expect(dieselChip).toHaveClass(/on/);
        await expect(page.locator('#searchBtnText')).toContainText('1');

        // Reset button clears active filters
        await page.locator('#resetBtn').click();
        await expect(dieselChip).not.toHaveClass(/on/);
        await expect(page.locator('#searchBtnText')).toContainText('2');
    });
});
