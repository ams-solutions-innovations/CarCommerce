const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    
    // Light mode
    const pageLight = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await pageLight.goto('http://localhost:4173/drazbe', { waitUntil: 'networkidle' });
    await pageLight.evaluate(() => {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    });
    await pageLight.waitForTimeout(1000);
    await pageLight.screenshot({ path: 'scratch/drazbe_final_light.png', fullPage: false });
    console.log('Saved scratch/drazbe_final_light.png');

    // Dark mode
    const pageDark = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await pageDark.goto('http://localhost:4173/drazbe', { waitUntil: 'networkidle' });
    await pageDark.evaluate(() => {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    });
    await pageDark.waitForTimeout(1000);
    await pageDark.screenshot({ path: 'scratch/drazbe_final_dark.png', fullPage: false });
    console.log('Saved scratch/drazbe_final_dark.png');

    await browser.close();
})();
