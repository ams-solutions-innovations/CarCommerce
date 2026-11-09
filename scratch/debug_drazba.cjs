const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log('Navigating to http://localhost:4173/drazba?id=auction-car-porsche-gt3&state=1');
    await page.goto('http://localhost:4173/drazba?id=auction-car-porsche-gt3&state=1');
    await page.waitForTimeout(2000);

    const bannerHtml = await page.$eval('#aucStateBannerContainer', el => el.innerHTML).catch(e => e.message);
    console.log('Banner HTML:', bannerHtml);

    const titleText = await page.$eval('#aucHeaderTitle', el => el.textContent).catch(e => e.message);
    console.log('Title text:', titleText);

    await browser.close();
})();
