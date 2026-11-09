const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await page.goto('http://localhost:4173/oglasi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scratch/oglasi_reference.png', fullPage: false });
    console.log('Saved scratch/oglasi_reference.png');
    await browser.close();
})();
