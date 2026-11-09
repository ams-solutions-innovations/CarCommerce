import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch({ headless: true });

  // Desktop Context (1024px & 1440px)
  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

    // 1. Cars Dark Mode
    await page.goto('http://localhost:4173/iskanje?cat=avto', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.body.classList.add('dark-mode'));
    await page.waitForTimeout(400);
    const carsSection = page.locator('#group-bodyType');
    await carsSection.screenshot({ path: 'scratch/verified_cars_dark_1024.png' });

    // 2. Cars Light Mode
    await page.evaluate(() => document.body.classList.remove('dark-mode'));
    await page.waitForTimeout(300);
    await carsSection.screenshot({ path: 'scratch/verified_cars_light_1024.png' });

    // 3. Moto Main Grid Dark Mode
    await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.body.classList.add('dark-mode'));
    await page.waitForTimeout(400);
    const motoSection = page.locator('#group-bodyType');
    await motoSection.screenshot({ path: 'scratch/verified_moto_main_dark_1024.png' });

    // 4. Moto Subgrid (4 in 3 kolesa) Dark Mode
    const groupCard = page.locator('.moto-group-card[data-group="4in3kolesa"]');
    await groupCard.click();
    await page.waitForTimeout(400);
    await motoSection.screenshot({ path: 'scratch/verified_moto_sub_dark_1024.png' });

    // 5. Moto Subgrid Light Mode
    await page.evaluate(() => document.body.classList.remove('dark-mode'));
    await page.waitForTimeout(300);
    await motoSection.screenshot({ path: 'scratch/verified_moto_sub_light_1024.png' });

    // 6. Full accordion screenshot showing centered subgrid + dropdowns below
    await page.evaluate(() => document.body.classList.add('dark-mode'));
    const basicAcc = page.locator('#advancedSearchForm > .adv-accordion').first();
    await basicAcc.screenshot({ path: 'scratch/verified_full_accordion_sub_dark.png' });
    await page.close();
  }

  // Mobile Context (390px)
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.body.classList.add('dark-mode'));
    await page.waitForTimeout(400);
    const motoSection = page.locator('#group-bodyType');
    await motoSection.screenshot({ path: 'scratch/verified_moto_main_mobile.png' });

    const groupCard = page.locator('.moto-group-card[data-group="4in3kolesa"]');
    await groupCard.click();
    await page.waitForTimeout(400);
    await motoSection.screenshot({ path: 'scratch/verified_moto_sub_mobile.png' });
    await page.close();
  }

  await browser.close();
  console.log('All verification screenshots captured.');
}

verify().catch(console.error);
