const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
    // Start preview server
    const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-avto', '--port', '4173'], {
        shell: true,
        stdio: 'pipe'
    });

    await new Promise(r => setTimeout(r, 2000));

    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log('Navigating to http://localhost:4173/drazba?id=auction-car-porsche-gt3&state=1');
    try {
        await page.goto('http://localhost:4173/drazba?id=auction-car-porsche-gt3&state=1', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        const bannerHtml = await page.$eval('#aucStateBannerContainer', el => el.innerHTML).catch(e => e.message);
        console.log('Banner HTML:', bannerHtml);

        const titleText = await page.$eval('#aucHeaderTitle', el => el.textContent).catch(e => e.message);
        console.log('Title text:', titleText);
    } catch (e) {
        console.log('Test caught:', e.message);
    }

    await browser.close();
    server.kill();
    process.exit(0);
})();
