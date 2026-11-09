const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await page.goto('http://localhost:4173/drazbe', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scratch/current_drazbe_4173.png', fullPage: false });
    console.log('Saved scratch/current_drazbe_4173.png');
    await browser.close();
})();
