import { chromium } from 'playwright';

async function testUnderContact() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Place costPanelRoot after sellerSection
  await page.evaluate(() => {
    const costRoot = document.getElementById('react-cost-panel-root');
    const seller = document.querySelector('.lp-seller-section');
    if (costRoot && seller) {
      seller.after(costRoot);
    }
  });

  // Scroll to seller section
  await page.evaluate(() => {
    document.querySelector('.lp-seller-section').scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'scratch/cost_under_seller_collapsed.png' });

  // Expand cost panel
  await page.locator('.cost-panel__toggle').click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'scratch/cost_under_seller_expanded.png' });

  await browser.close();
}

testUnderContact().catch(console.error);
