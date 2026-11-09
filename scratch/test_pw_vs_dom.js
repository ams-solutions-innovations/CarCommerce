import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Hook all scroll-causing things
  await page.evaluate(() => {
    window.__scrollSources = [];
    const origScrollTo = window.scrollTo;
    window.scrollTo = function(...args) {
      window.__scrollSources.push({ fn: 'scrollTo', args, stack: new Error().stack });
      return origScrollTo.apply(this, args);
    };
    const origSIV = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(...args) {
      window.__scrollSources.push({ fn: 'scrollIntoView', target: this.className, args, stack: new Error().stack });
      return origSIV.apply(this, args);
    };
    const origFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function(...args) {
      window.__scrollSources.push({ fn: 'focus', target: this.className, args, stack: new Error().stack });
      return origFocus.apply(this, args);
    };
  });

  // Scroll to 584
  await page.evaluate(() => window.scrollTo(0, 584));
  console.log('ScrollY set to:', await page.evaluate(() => window.scrollY));

  // Now dispatch a pure DOM click event on .cost-panel__toggle
  await page.evaluate(() => {
    document.querySelector('.cost-panel__toggle').click();
  });

  await page.waitForTimeout(600);
  console.log('ScrollY after DOM click:', await page.evaluate(() => window.scrollY));
  console.log('Scroll sources:', await page.evaluate(() => window.__scrollSources));

  // Now test Playwright page.click vs DOM click:
  // Reset
  await page.evaluate(() => {
    document.querySelector('.cost-panel__toggle').click(); // close it
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 584));
  console.log('ScrollY reset to:', await page.evaluate(() => window.scrollY));

  // Click via playwright click without scroll (or with scroll)
  console.log('Now clicking via Playwright page.click:');
  await page.click('.cost-panel__toggle');
  await page.waitForTimeout(600);
  console.log('ScrollY after Playwright click:', await page.evaluate(() => window.scrollY));
  console.log('Scroll sources after PW click:', await page.evaluate(() => window.__scrollSources));

  await browser.close();
}

main().catch(console.error);
