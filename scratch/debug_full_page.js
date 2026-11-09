import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.body.classList.add('dark-mode'));
  await page.waitForTimeout(500);

  // Take screenshot of #acc-basic (Osnovni podatki accordion)
  const basicAcc = page.locator('#advancedSearchForm > .adv-accordion').first();
  await basicAcc.screenshot({ path: 'scratch/debug_moto_main_1024.png' });

  // Open 4in3kolesa
  const groupCard = page.locator('.moto-group-card[data-group="4in3kolesa"]');
  await groupCard.click();
  await page.waitForTimeout(500);

  await basicAcc.screenshot({ path: 'scratch/debug_moto_sub_1024.png' });

  await browser.close();
}

run().catch(console.error);
