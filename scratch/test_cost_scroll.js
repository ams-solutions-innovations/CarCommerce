import { chromium } from 'playwright';

async function testScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });

  // Find cost panel
  const toggle = page.locator('.cost-panel__collapsed');
  await toggle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const scrollBefore = await page.evaluate(() => window.scrollY);
  console.log('Scroll before click:', scrollBefore);

  // Listen to scroll events
  await page.evaluate(() => {
    window.__scrollLogs = [];
    window.addEventListener('scroll', () => {
      window.__scrollLogs.push({ y: window.scrollY, time: performance.now() });
    });
  });

  // Click on "Prikaži razčlenitev"
  await toggle.click();
  await page.waitForTimeout(1000);

  const scrollAfter = await page.evaluate(() => ({
    scrollY: window.scrollY,
    logs: window.__scrollLogs,
    panelRect: document.querySelector('.cost-panel')?.getBoundingClientRect(),
    sidebarRect: document.querySelector('.lp-sidebar')?.getBoundingClientRect(),
    expanded: document.querySelector('.cost-panel__expanded--open') !== null
  }));

  console.log('Scroll after click:', scrollAfter);

  await page.screenshot({ path: 'scratch/cost_panel_clicked.png' });
  await browser.close();
}

testScroll().catch(console.error);
