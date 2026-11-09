import { chromium } from 'playwright';
import { preview } from 'vite';
import path from 'path';

const artifactDir = 'C:/Users/marti/.gemini/antigravity/brain/54bbf5f0-5816-4e9a-8fbb-8fa2b40a5af5';
const PORT = 5195;

async function run() {
    console.log('Starting preview server on port ' + PORT);
    const server = await preview({
        preview: {
            port: PORT,
            strictPort: true,
        },
        build: {
            outDir: 'dist-avto'
        }
    });

    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });
    const page = await context.newPage();

    // 1. Dark Mode Test
    console.log('Navigating to /oglasi (dark mode)...');
    await page.goto(`http://localhost:${PORT}/oglasi`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    });

    // Find and click legend button
    console.log('Opening legend overlay...');
    const legendBtn = page.locator('#legendBtn');
    await legendBtn.waitFor({ state: 'visible', timeout: 5000 });
    await legendBtn.click();
    await page.waitForTimeout(600);

    // Verify overlay active
    const overlay = page.locator('#legendOverlay');
    const isActive = await overlay.evaluate(el => el.classList.contains('active'));
    console.log('Overlay is active:', isActive);

    const legendCard = page.locator('.ah-legend-card');
    await legendCard.screenshot({
        path: path.join(artifactDir, 'legend_modal_dark.png')
    });
    console.log('Saved dark mode legend screenshot');

    // Screenshot full viewport with backdrop
    await page.screenshot({
        path: path.join(artifactDir, 'legend_viewport_dark.png')
    });
    console.log('Saved dark mode viewport screenshot');

    // Test clicking power unit button (kW)
    console.log('Testing power unit click (kW)...');
    await page.locator('#puBtnKw').click();
    await page.waitForTimeout(300);
    const kwActive = await page.locator('#puBtnKw').evaluate(el => el.classList.contains('active'));
    const labelText = await page.locator('#powerToggleLabel').textContent();
    console.log('kW button active:', kwActive, 'Label text:', labelText);

    // Test clicking powerToggleLabelPill
    console.log('Testing clicking power toggle pill...');
    await page.locator('#powerToggleLabelPill').click();
    await page.waitForTimeout(300);
    const kmActive = await page.locator('#puBtnKm').evaluate(el => el.classList.contains('active'));
    const labelTextAfter = await page.locator('#powerToggleLabel').textContent();
    console.log('KM button active after pill click:', kmActive, 'Label text:', labelTextAfter);

    // 2. Light Mode Test
    console.log('Switching to light mode...');
    await page.evaluate(() => {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(300);

    await legendCard.screenshot({
        path: path.join(artifactDir, 'legend_modal_light.png')
    });
    console.log('Saved light mode legend screenshot');

    // Test close button
    console.log('Testing close button...');
    await page.locator('#legendCloseBtn').click();
    await page.waitForTimeout(400);
    const isClosed = await overlay.evaluate(el => !el.classList.contains('active'));
    console.log('Overlay closed after close btn click:', isClosed);

    await browser.close();
    await server.close();
    process.exit(0);
}

run().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
