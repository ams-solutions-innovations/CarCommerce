import { chromium } from 'playwright';

async function testMouseClick() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Let's scroll so that the toggle button is in the center of the viewport
  await page.evaluate(() => {
    const toggle = document.querySelector('.cost-panel__toggle');
    const rect = toggle.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + rect.top - 400);
  });

  const scrollYBefore = await page.evaluate(() => window.scrollY);
  console.log('ScrollY before mouse click:', scrollYBefore);

  const toggleBox = await page.locator('.cost-panel__toggle').boundingBox();
  console.log('Toggle box:', toggleBox);

  // Click at the exact center of toggleBox using page.mouse.click
  await page.mouse.click(toggleBox.x + toggleBox.width / 2, toggleBox.y + toggleBox.height / 2);

  await page.waitForTimeout(600);
  const scrollYAfter = await page.evaluate(() => window.scrollY);
  console.log('ScrollY after mouse click:', scrollYAfter);

  await browser.close();
}

testMouseClick().catch(console.error);
