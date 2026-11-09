const { chromium } = require('playwright');
const path = require('path');
const { spawn } = require('child_process');

async function capture() {
    console.log('Starting preview server...');
    const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-avto', '--port', '4173'], {
        shell: true,
        stdio: 'pipe'
    });

    // Wait 2 seconds for server to boot
    await new Promise(r => setTimeout(r, 2000));

    const browser = await chromium.launch({ headless: true });
    const artifactDir = path.resolve('C:/Users/marti/.gemini/antigravity/brain/fa292525-706a-4c5a-9043-5470de671287');
    
    try {
        // 1. Desktop Light - Home with Navbar
        {
            const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
            const page = await context.newPage();
            await page.goto('http://localhost:4173/');
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: path.join(artifactDir, 'desktop_navbar_light.png') });
            
            // Hover auctions
            await page.locator('#ahAuctionsButton').hover();
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(artifactDir, 'desktop_auctions_dropdown.png') });
            await context.close();
        }

        // 2. Mobile Light - Home
        {
            const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
            const page = await context.newPage();
            await page.goto('http://localhost:4173/');
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: path.join(artifactDir, 'mobile_home_light.png') });

            // Click Dražbe pill
            await page.locator('.ah-mobile-mode-pill[data-mobile-mode="drazbe"]').click();
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(artifactDir, 'mobile_home_drazbe_selected.png') });

            // Click Najem pill
            await page.locator('.ah-mobile-mode-pill[data-mobile-mode="najem"]').click();
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(artifactDir, 'mobile_home_najem_selected.png') });

            // Navigate to /iskanje-drazbe
            await page.goto('http://localhost:4173/iskanje-drazbe');
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: path.join(artifactDir, 'mobile_iskanje_drazbe.png') });
            await context.close();
        }

        // 3. Mobile Dark - Home & Dražbe
        {
            const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
            const page = await context.newPage();
            await page.goto('http://localhost:4173/');
            await page.waitForLoadState('networkidle');
            await page.evaluate(() => {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            });
            await page.waitForTimeout(300);
            await page.screenshot({ path: path.join(artifactDir, 'mobile_home_dark.png') });

            await page.goto('http://localhost:4173/iskanje-drazbe');
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: path.join(artifactDir, 'mobile_iskanje_drazbe_dark.png') });
            await context.close();
        }
        console.log('All screenshots captured successfully!');
    } finally {
        await browser.close();
        server.kill();
    }
}

capture().catch(err => {
    console.error(err);
    process.exit(1);
});
