import { chromium } from 'playwright';

async function testMobile() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  console.log('Mobile initial scrollY:', await page.evaluate(() => window.scrollY));

  // Find where .cost-panel is on mobile
  const box = await page.locator('.cost-panel').boundingBox();
  console.log('Mobile cost panel box before scroll:', box);

  // Scroll cost panel into view
  await page.evaluate(() => {
    document.querySelector('.cost-panel').scrollIntoView();
  });
  console.log('Mobile scrollY after scrollIntoView:', await page.evaluate(() => window.scrollY));
  await page.screenshot({ path: 'scratch/mobile_before_click.png' });

  // Click .cost-panel__collapsed
  await page.evaluate(() => {
    document.querySelector('.cost-panel__collapsed').click();
  });
  await page.waitForTimeout(600);
  console.log('Mobile scrollY after click:', await page.evaluate(() => window.scrollY));
  await page.screenshot({ path: 'scratch/mobile_after_click.png' });

  await browser.close();
}

testMobile().catch(console.error);
