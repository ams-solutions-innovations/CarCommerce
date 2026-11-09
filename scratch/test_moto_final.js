import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4173/iskanje?cat=moto...');
  await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Moto tab if not active
  const motoTab = page.locator('#vehicleTypeTabs [data-tab="moto"]');
  const isMotoActive = await motoTab.evaluate(el => el.classList.contains('active'));
  if (!isMotoActive) {
    console.log('Clicking moto tab...');
    await motoTab.click();
    await page.waitForTimeout(500);
  }

  const engineAcc = page.locator('#acc-engine');
  const trigger = engineAcc.locator('.adv-acc-trigger');
  const isExpanded = await trigger.getAttribute('aria-expanded');
  if (isExpanded !== 'true') {
    await trigger.click();
    await page.waitForTimeout(500);
  }

  // 1. Initial moto engine screenshot in LIGHT mode
  await engineAcc.screenshot({ path: 'scratch/final_moto_light.png' });
  console.log('Saved scratch/final_moto_light.png');

  // 2. Select cylinder 3 in custom select
  const cylSelect = page.locator('#moto-cylinders');
  await cylSelect.evaluate((el) => {
    el.value = '3';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(400);

  await engineAcc.screenshot({ path: 'scratch/final_moto_selected_3_light.png' });
  console.log('Saved scratch/final_moto_selected_3_light.png');

  // 3. Click + Dodaj button
  await page.locator('#cylAddBtn').click();
  await page.waitForTimeout(400);

  await engineAcc.screenshot({ path: 'scratch/final_moto_with_chip_light.png' });
  console.log('Saved scratch/final_moto_with_chip_light.png');

  // 4. Dark mode screenshot with chip
  await page.evaluate(() => document.body.classList.add('dark-mode'));
  await page.waitForTimeout(300);

  await engineAcc.screenshot({ path: 'scratch/final_moto_with_chip_dark.png' });
  console.log('Saved scratch/final_moto_with_chip_dark.png');

  // 5. Toggle A2 to Samo A2 in dark mode
  await page.locator('#advA2Toggle [data-a2="yes"]').click();
  await page.waitForTimeout(300);

  await engineAcc.screenshot({ path: 'scratch/final_moto_a2_selected_dark.png' });
  console.log('Saved scratch/final_moto_a2_selected_dark.png');

  // 6. Also add an excluded cylinder filter (e.g. 1 valj) to test exclude chip look!
  await cylSelect.evaluate((el) => {
    el.value = '1';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  await page.locator('#cylRemoveBtn').click();
  await page.waitForTimeout(300);

  await engineAcc.screenshot({ path: 'scratch/final_moto_both_chips_dark.png' });
  console.log('Saved scratch/final_moto_both_chips_dark.png');

  await browser.close();
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
