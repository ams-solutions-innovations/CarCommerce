const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/marti/.gemini/antigravity/brain/fa292525-706a-4c5a-9043-5470de671287';

(async () => {
    const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-avto', '--port', '4179'], {
        shell: true,
        stdio: 'pipe'
    });

    await new Promise(r => setTimeout(r, 4000));

    const browser = await chromium.launch();

    // 1. Drazbe Board Light & Dark
    const pageBoard = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await pageBoard.goto('http://localhost:4179/drazbe', { waitUntil: 'networkidle' });
    await pageBoard.waitForSelector('#carListingsContainer article.az-c');
    await pageBoard.screenshot({ path: path.join(ARTIFACT_DIR, 'drazbe_board_light.png'), fullPage: false });

    await pageBoard.evaluate(() => {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    });
    await pageBoard.waitForTimeout(500);
    await pageBoard.screenshot({ path: path.join(ARTIFACT_DIR, 'drazbe_board_dark.png'), fullPage: false });
    await pageBoard.close();

    // 2. Drazba Detail Light & Dark
    const pageDetail = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await pageDetail.goto('http://localhost:4179/drazba?id=auction-car-porsche-gt3', { waitUntil: 'networkidle' });
    await pageDetail.waitForSelector('.auction-detail-page');
    await pageDetail.screenshot({ path: path.join(ARTIFACT_DIR, 'drazba_detail_dark.png'), fullPage: false });

    await pageDetail.evaluate(() => {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    });
    await pageDetail.waitForTimeout(500);
    await pageDetail.screenshot({ path: path.join(ARTIFACT_DIR, 'drazba_detail_light.png'), fullPage: false });

    // 3. Commitment Modal with Signature
    const submitBtn = pageDetail.locator('#aucSubmitBidBtn');
    if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await pageDetail.waitForTimeout(500);
        await pageDetail.screenshot({ path: path.join(ARTIFACT_DIR, 'drazba_signature_modal.png'), fullPage: false });
    }

    await pageDetail.close();
    await browser.close();
    server.kill();
    console.log('Screenshots saved successfully!');
    process.exit(0);
})();
