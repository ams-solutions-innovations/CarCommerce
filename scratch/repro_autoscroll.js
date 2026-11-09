import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Let's check bounding box of .cost-panel
  const boxBefore = await page.locator('.cost-panel').boundingBox();
  console.log('Cost panel box before:', boxBefore);
  console.log('Initial window.scrollY:', await page.evaluate(() => window.scrollY));

  // Let's scroll down a bit so the cost panel is in view
  await page.evaluate(() => {
    const el = document.querySelector('.cost-panel');
    el.scrollIntoView({ block: 'center' });
  });
  console.log('ScrollY after scrollIntoView center:', await page.evaluate(() => window.scrollY));
  await page.screenshot({ path: 'scratch/cost_before_click.png' });

  // Record scroll events and any programmatic scroll calls
  await page.evaluate(() => {
    window.__scrollEvents = [];
    window.addEventListener('scroll', () => {
      window.__scrollEvents.push({ y: window.scrollY, time: performance.now() });
    });
  });

  // Now click on "Prikaži razčlenitev"
  console.log('Clicking .cost-panel__toggle / .cost-panel__collapsed...');
  await page.locator('.cost-panel__toggle').click();

  // Wait 100ms, 300ms, 600ms, 1000ms and check scroll & bounding box
  for (const ms of [100, 300, 600, 1000]) {
    await page.waitForTimeout(ms);
    const scrollY = await page.evaluate(() => window.scrollY);
    const box = await page.locator('.cost-panel').boundingBox();
    console.log(`At +${ms}ms: scrollY=${scrollY}, costPanel y=${box.y}, height=${box.height}`);
  }

  await page.screenshot({ path: 'scratch/cost_after_click.png' });

  const scrollEvents = await page.evaluate(() => window.__scrollEvents);
  console.log('Total scroll events captured:', scrollEvents.length);
  if (scrollEvents.length > 0) {
    console.log('First 5 scroll events:', scrollEvents.slice(0, 5));
    console.log('Last 5 scroll events:', scrollEvents.slice(-5));
  }

  await browser.close();
}

main().catch(console.error);
