import { chromium } from 'playwright';

async function testCostInMain() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Let's see what happens if we move #react-cost-panel-root into .lp-main before the seller section
  await page.evaluate(() => {
    const cpRoot = document.getElementById('react-cost-panel-root');
    const seller = document.querySelector('.lp-seller-section');
    if (cpRoot && seller) {
      seller.parentElement.insertBefore(cpRoot, seller);
    }
  });

  await page.screenshot({ path: 'scratch/cost_in_main_collapsed.png' });

  // Click Stroški tab
  const stroskiBtn = page.locator('.ah-detail-tabs button', { hasText: 'Stroški' });
  await stroskiBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/cost_in_main_tab_clicked.png' });

  // Click Prikaži razčlenitev
  await page.locator('.cost-panel__toggle').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/cost_in_main_expanded.png' });

  await browser.close();
}

testCostInMain().catch(console.error);
