import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Let's scroll so cost panel is visible
  await page.evaluate(() => {
    document.querySelector('.cost-panel').scrollIntoView({ block: 'center' });
  });

  console.log('ScrollY before click:', await page.evaluate(() => window.scrollY));

  // Let's trace Playwright's click vs what happens
  // In Playwright, click() by default does scrollIntoViewIfNeeded.
  // But wait! Does Chrome itself autoscroll if an element is clicked or when CSS transition occurs?
  // Let's test page.locator('.cost-panel__collapsed').click({ noWaitAfter: true })
  await page.locator('.cost-panel__collapsed').click();

  console.log('Immediately after click: scrollY =', await page.evaluate(() => window.scrollY));
  for (let i = 1; i <= 10; i++) {
    await page.waitForTimeout(100);
    console.log(`At +${i * 100}ms: scrollY =`, await page.evaluate(() => window.scrollY));
  }

  await browser.close();
}

main().catch(console.error);
