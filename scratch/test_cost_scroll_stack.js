import { chromium } from 'playwright';

async function testScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Hook window.scrollTo, scrollBy, scrollIntoView
  await page.evaluate(() => {
    window.__scrollCalls = [];
    const origScrollTo = window.scrollTo;
    window.scrollTo = function(...args) {
      window.__scrollCalls.push({ type: 'scrollTo', args, stack: new Error().stack });
      return origScrollTo.apply(this, args);
    };
    const origScrollBy = window.scrollBy;
    window.scrollBy = function(...args) {
      window.__scrollCalls.push({ type: 'scrollBy', args, stack: new Error().stack });
      return origScrollBy.apply(this, args);
    };
    const origSIV = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(...args) {
      window.__scrollCalls.push({ type: 'scrollIntoView', el: this.className || this.tagName, args, stack: new Error().stack });
      return origSIV.apply(this, args);
    };

    window.addEventListener('scroll', () => {
      window.__scrollCalls.push({ type: 'scrollEvent', y: window.scrollY, stack: new Error().stack });
    });
  });

  console.log('Scroll before click:', await page.evaluate(() => window.scrollY));
  await page.evaluate(() => {
    document.querySelector('.cost-panel__collapsed').click();
  });
  await page.waitForTimeout(500);

  const calls = await page.evaluate(() => ({
    scrollY: window.scrollY,
    calls: window.__scrollCalls
  }));

  console.log('Calls after programmatic click:', JSON.stringify(calls, null, 2));

  await browser.close();
}

testScroll().catch(console.error);
