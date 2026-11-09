import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const engineAcc = page.locator('#acc-engine');
    const trigger = engineAcc.locator('.adv-acc-trigger');
    const isExpanded = await trigger.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await trigger.click();
      await page.waitForTimeout(500);
    }

    // Select cylinder 3
    const cylSelect = page.locator('#moto-cylinders');
    await cylSelect.evaluate((el) => {
      el.value = '3';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    // Select layout
    const layoutSelect = page.locator('#moto-cylinder-layout');
    await layoutSelect.evaluate((el) => {
      if (el.options.length > 1) {
        el.selectedIndex = 1;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(300);

    // Click + Dodaj
    await page.locator('#cylAddBtn').click();
    await page.waitForTimeout(300);

    // Select cylinder 1 and click Odstrani (exclude)
    await cylSelect.evaluate((el) => {
      el.value = '1';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    await page.locator('#cylRemoveBtn').click();
    await page.waitForTimeout(300);

    // Desktop Light
    await engineAcc.screenshot({ path: 'scratch/desktop_moto_engine_light.png' });

    // Desktop Dark + A2 toggle
    await page.evaluate(() => document.body.classList.add('dark-mode'));
    await page.locator('#advA2Toggle [data-a2="yes"]').click();
    await page.waitForTimeout(300);
    await engineAcc.screenshot({ path: 'scratch/desktop_moto_engine_dark.png' });
    await context.close();
  }

  // 2. Mobile Test (iPhone 12 / 390px)
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const page = await context.newPage();
    await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const engineAcc = page.locator('#acc-engine');
    const trigger = engineAcc.locator('.adv-acc-trigger');
    const isExpanded = await trigger.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await trigger.click();
      await page.waitForTimeout(500);
    }

    // Select cylinder 2 and add
    const cylSelect = page.locator('#moto-cylinders');
    await cylSelect.evaluate((el) => {
      el.value = '2';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    await page.locator('#cylAddBtn').click();
    await page.waitForTimeout(300);

    // Mobile Light
    await engineAcc.screenshot({ path: 'scratch/mobile_moto_engine_light.png' });

    // Mobile Dark
    await page.evaluate(() => document.body.classList.add('dark-mode'));
    await page.locator('#advA2Toggle [data-a2="yes"]').click();
    await page.waitForTimeout(300);
    await engineAcc.screenshot({ path: 'scratch/mobile_moto_engine_dark.png' });
    await context.close();
  }

  await browser.close();
  console.log('Mobile and desktop screenshots captured successfully.');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
