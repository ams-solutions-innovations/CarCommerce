import { chromium } from 'playwright';

async function testMainScrollBehavior() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Move #react-cost-panel-root into .lp-main before seller section
  await page.evaluate(() => {
    const cpRoot = document.getElementById('react-cost-panel-root');
    const seller = document.querySelector('.lp-seller-section');
    if (cpRoot && seller) {
      seller.parentElement.insertBefore(cpRoot, seller);
    }
  });

  console.log('ScrollY initially:', await page.evaluate(() => window.scrollY));

  // Click Stroški tab
  const stroskiBtn = page.locator('.ah-detail-tabs button', { hasText: 'Stroški' });
  await stroskiBtn.click();
  await page.waitForTimeout(600);
  console.log('ScrollY after Stroški tab click:', await page.evaluate(() => window.scrollY));

  // Check where cost panel is
  const box1 = await page.locator('.cost-panel').boundingBox();
  console.log('Cost panel box after tab click:', box1);

  // Click Prikaži razčlenitev
  await page.locator('.cost-panel__toggle').click();
  await page.waitForTimeout(600);
  console.log('ScrollY after toggle click:', await page.evaluate(() => window.scrollY));
  const box2 = await page.locator('.cost-panel').boundingBox();
  console.log('Cost panel box after toggle click:', box2);

  await browser.close();
}

testMainScrollBehavior().catch(console.error);
