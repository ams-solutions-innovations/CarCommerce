import { chromium } from 'playwright';

async function testUserFlow() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Let's see: how does a normal user scroll?
  // Say the user scrolls down by 300px, 600px, 900px
  for (const scrollY of [300, 600]) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(200);
    const toggleBox = await page.locator('.cost-panel__toggle').boundingBox();
    console.log(`At scrollY=${scrollY}, toggleBox y=${toggleBox ? toggleBox.y : 'null'}`);
  }

  // Suppose user is at scrollY = 400 where cost panel toggle is at y = ~650 (comfortably on screen)
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.screenshot({ path: 'scratch/flow_1_before_click.png' });

  // User clicks toggle with mouse
  const box = await page.locator('.cost-panel__toggle').boundingBox();
  console.log('Clicking at:', box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

  // Take screenshots at 100ms, 300ms, 500ms, 800ms
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'scratch/flow_2_100ms.png' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/flow_3_500ms.png' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch/flow_4_1000ms.png' });

  console.log('Final scrollY:', await page.evaluate(() => window.scrollY));
  const finalCostBox = await page.locator('.cost-panel').boundingBox();
  console.log('Final cost panel bounding box:', finalCostBox);

  await browser.close();
}

testUserFlow().catch(console.error);
