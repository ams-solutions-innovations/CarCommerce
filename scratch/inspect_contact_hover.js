import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });

  // Find seller accordion
  const sellerAcc = page.locator('#sellerAccordion');
  await sellerAcc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  await sellerAcc.screenshot({ path: 'scratch/seller_contact_before.png' });
  console.log('Saved seller_contact_before.png');

  // Find specs accordion
  const specsTrigger = page.locator('.lp-specs-container .adv-acc-trigger').first();
  await specsTrigger.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);

  // Hover over specs trigger
  await specsTrigger.hover();
  await page.waitForTimeout(200);
  await specsTrigger.screenshot({ path: 'scratch/specs_hover_before.png' });
  console.log('Saved specs_hover_before.png');

  // Check computed styles
  const styles = await page.evaluate(() => {
    const sHeader = document.querySelector('#sellerAccordion .adv-acc-header');
    const sTrigger = document.querySelector('#sellerAccordion .adv-acc-trigger');
    const sAcc = document.querySelector('#sellerAccordion');
    const specHeader = document.querySelector('.lp-specs-container .adv-acc-header');
    const specTrigger = document.querySelector('.lp-specs-container .adv-acc-trigger');
    const specAcc = document.querySelector('.lp-specs-container .adv-accordion');

    return {
      sAcc: sAcc ? { width: sAcc.offsetWidth, padding: getComputedStyle(sAcc).padding } : null,
      sHeader: sHeader ? { width: sHeader.offsetWidth, padding: getComputedStyle(sHeader).padding } : null,
      sTrigger: sTrigger ? { width: sTrigger.offsetWidth, padding: getComputedStyle(sTrigger).padding, bg: getComputedStyle(sTrigger).background } : null,
      specAcc: specAcc ? { width: specAcc.offsetWidth, padding: getComputedStyle(specAcc).padding, br: getComputedStyle(specAcc).borderRadius } : null,
      specHeader: specHeader ? { width: specHeader.offsetWidth, padding: getComputedStyle(specHeader).padding } : null,
      specTrigger: specTrigger ? { width: specTrigger.offsetWidth, br: getComputedStyle(specTrigger).borderRadius, bg: getComputedStyle(specTrigger).background } : null
    };
  });
  console.log('Computed styles:', JSON.stringify(styles, null, 2));

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
