import { chromium } from 'playwright';

async function testInteractions() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  console.log('=== TEST 1: Clicking "Stroški" in detail tabs ===');
  const tabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.ah-detail-tabs button')).map(b => b.textContent.trim());
  });
  console.log('Tabs present:', tabs);

  const stroskiBtn = page.locator('.ah-detail-tabs button', { hasText: 'Stroški' });
  if (await stroskiBtn.count() > 0) {
    console.log('Found Stroški tab button! Clicking it...');
    console.log('ScrollY before Stroški click:', await page.evaluate(() => window.scrollY));
    await stroskiBtn.click();
    await page.waitForTimeout(1000);
    console.log('ScrollY after Stroški click:', await page.evaluate(() => window.scrollY));
    const cpBox = await page.locator('.cost-panel').boundingBox();
    console.log('Cost panel bounding box after Stroški tab click:', cpBox);
    await page.screenshot({ path: 'scratch/tab_stroski_clicked.png' });
  }

  console.log('=== TEST 2: Clicking "Prikaži razčlenitev" while at that position ===');
  const toggleBtn = page.locator('.cost-panel__toggle');
  console.log('Clicking "Prikaži razčlenitev" (.cost-panel__toggle)...');
  await toggleBtn.click();
  await page.waitForTimeout(1000);
  console.log('ScrollY after toggle click:', await page.evaluate(() => window.scrollY));
  const cpBoxExpanded = await page.locator('.cost-panel').boundingBox();
  console.log('Cost panel bounding box after toggle click:', cpBoxExpanded);
  await page.screenshot({ path: 'scratch/cost_panel_expanded.png' });

  console.log('=== TEST 3: User scrolling down on the page while CostPanel is expanded ===');
  // How does the page and sidebar behave when user scrolls?
  for (const targetY of [500, 1000, 1500, 2000, 2500]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);
    await page.waitForTimeout(200);
    const box = await page.locator('.cost-panel').boundingBox();
    const sbBox = await page.locator('.lp-sidebar').boundingBox();
    console.log(`ScrollY ${targetY}: sidebar top=${sbBox.y}, height=${sbBox.height}, costPanel top=${box.y}, height=${box.height}`);
  }

  await browser.close();
}

testInteractions().catch(console.error);
