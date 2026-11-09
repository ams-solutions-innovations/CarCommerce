import { chromium } from 'playwright';

async function testScrollDown() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Center cost panel and expand it
  await page.evaluate(() => {
    document.querySelector('.cost-panel').scrollIntoView({ block: 'center' });
    document.querySelector('.cost-panel__collapsed').click();
  });
  await page.waitForTimeout(600);

  const startY = await page.evaluate(() => window.scrollY);
  console.log('Start scrollY:', startY);
  await page.screenshot({ path: 'scratch/scroll_exp_0.png' });

  // Scroll down by 300
  await page.evaluate((y) => window.scrollTo(0, y + 300), startY);
  await page.waitForTimeout(300);
  console.log('At start + 300, scrollY:', await page.evaluate(() => window.scrollY));
  await page.screenshot({ path: 'scratch/scroll_exp_300.png' });

  // Scroll down by 600
  await page.evaluate((y) => window.scrollTo(0, y + 600), startY);
  await page.waitForTimeout(300);
  console.log('At start + 600, scrollY:', await page.evaluate(() => window.scrollY));
  await page.screenshot({ path: 'scratch/scroll_exp_600.png' });

  // Scroll down by 1000
  await page.evaluate((y) => window.scrollTo(0, y + 1000), startY);
  await page.waitForTimeout(300);
  console.log('At start + 1000, scrollY:', await page.evaluate(() => window.scrollY));
  await page.screenshot({ path: 'scratch/scroll_exp_1000.png' });

  await browser.close();
}

testScrollDown().catch(console.error);
