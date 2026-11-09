import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => {
        if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
    });

    const recentData = [
        {
            id: 'car-premium-1',
            title: 'Porsche 911 GT3 PDK',
            make: 'Porsche',
            model: '911',
            variant: 'GT3 PDK',
            priceEur: 189900,
            salePriceEur: 189900,
            priceRaw: 215900,
            year: '2023',
            mileageKm: 1200,
            fuel: 'Petrol',
            transmission: 'Avtomatski',
            powerKw: 375,
            image: 'images/porsche.png',
            seller: 'Porsche Center Ljubljana',
            location: 'Ljubljana',
            viewedAt: Date.now()
        }
    ];

    console.log('Testing Desktop Dark Mode...');
    await page.goto('http://localhost:3003/');
    await page.evaluate((data) => {
        localStorage.setItem('avto_recent_guest', JSON.stringify(data));
        localStorage.setItem('theme', 'dark');
        document.body.classList.add('dark-mode');
    }, recentData);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#ahRecentSection:not([hidden])');

    const recentSec = page.locator('#ahRecentSection');
    const isVis = await recentSec.isVisible();
    console.log('Section visible:', isVis);

    const card = recentSec.locator('.ah-listing-card').first();
    const cardBox = await card.boundingBox();
    console.log('Card bounding box:', cardBox);

    if (!cardBox || cardBox.width > 420) {
        throw new Error(`Card is too wide or not rendered properly! Width: ${cardBox?.width}`);
    }

    await page.locator('#ahRecentSection').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'scratch/recent_desktop_dark.png' });
    console.log('Saved scratch/recent_desktop_dark.png');

    console.log('Testing Desktop Light Mode...');
    await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.body.classList.remove('dark-mode');
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'scratch/recent_desktop_light.png' });
    console.log('Saved scratch/recent_desktop_light.png');

    console.log('Testing Mobile Viewport...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#ahRecentSection:not([hidden])');
    await page.locator('#ahRecentSection').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'scratch/recent_mobile.png' });
    console.log('Saved scratch/recent_mobile.png');

    console.log('Testing "Počisti" clear button...');
    const clearBtn = page.locator('#ahRecentClear');
    await clearBtn.click();
    await page.waitForTimeout(300);
    const isHiddenAfterClear = await recentSec.getAttribute('hidden');
    console.log('Section hidden attribute after clear:', isHiddenAfterClear);
    const isVisAfterClear = await recentSec.isVisible();
    console.log('Section visible after clear:', isVisAfterClear);

    if (isVisAfterClear) {
        throw new Error('Section should be hidden after clearing history!');
    }

    console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
    await browser.close();
}

main().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
