import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4173/iskanje?cat=motor...');
  await page.goto('http://localhost:4173/iskanje?cat=motor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const engineAcc = page.locator('#acc-engine');
  const trigger = engineAcc.locator('.adv-acc-trigger');
  const isExpanded = await trigger.getAttribute('aria-expanded');
  if (isExpanded !== 'true') {
    await trigger.click();
    await page.waitForTimeout(500);
  }

  // 1. Initial state screenshot - Light mode
  await engineAcc.screenshot({ path: 'scratch/moto_engine_fixed_light.png' });
  console.log('Saved scratch/moto_engine_fixed_light.png');

  // 2. Select cylinder 3 in custom select
  const cylSelect = page.locator('#moto-cylinders');
  await cylSelect.evaluate((el) => {
    el.value = '3';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(500);

  await engineAcc.screenshot({ path: 'scratch/moto_engine_selected_3_light.png' });
  console.log('Saved scratch/moto_engine_selected_3_light.png');

  // 3. Click + Dodaj button
  await page.locator('#cylAddBtn').click();
  await page.waitForTimeout(500);

  await engineAcc.screenshot({ path: 'scratch/moto_engine_with_chip_light.png' });
  console.log('Saved scratch/moto_engine_with_chip_light.png');

  // 4. Dark mode screenshots
  await page.evaluate(() => document.body.classList.add('dark-mode'));
  await page.waitForTimeout(300);

  await engineAcc.screenshot({ path: 'scratch/moto_engine_with_chip_dark.png' });
  console.log('Saved scratch/moto_engine_with_chip_dark.png');

  // Also toggle A2 to Samo A2 to test active state
  await page.locator('#advA2Toggle [data-a2="yes"]').click();
  await page.waitForTimeout(300);

  await engineAcc.screenshot({ path: 'scratch/moto_engine_a2_selected_dark.png' });
  console.log('Saved scratch/moto_engine_a2_selected_dark.png');

  await browser.close();
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
