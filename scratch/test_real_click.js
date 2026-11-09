import { chromium } from 'playwright';

async function testRealClick() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Let's hook window scroll and any DOM mutations or focus events
  await page.evaluate(() => {
    window.__events = [];
    ['scroll', 'wheel', 'click', 'focus', 'focusin'].forEach(evtName => {
      window.addEventListener(evtName, (e) => {
        window.__events.push({
          type: evtName,
          target: e.target ? (e.target.className || e.target.tagName) : null,
          scrollY: window.scrollY,
          timestamp: performance.now()
        });
      }, { capture: true, passive: true });
    });
  });

  // Let's scroll so that the CostPanel header is visible at y=200
  const initialScroll = await page.evaluate(() => {
    const cp = document.querySelector('.cost-panel');
    const rect = cp.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + rect.top - 200);
    return window.scrollY;
  });
  console.log('Scrolled page so cost panel is at y=200, scrollY =', initialScroll);

  // Now, what happens if user clicks '.cost-panel__toggle'?
  console.log('Dispatching real mouse click via page.locator.click...');
  await page.locator('.cost-panel__toggle').click();

  await page.waitForTimeout(1000);
  console.log('ScrollY after click:', await page.evaluate(() => window.scrollY));
  console.log('Captured events:');
  const events = await page.evaluate(() => window.__events);
  events.forEach(e => console.log(`  [${e.type}] on <${e.target}> at scrollY=${e.scrollY}`));

  await browser.close();
}

testRealClick().catch(console.error);
