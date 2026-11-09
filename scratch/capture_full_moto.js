import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });

  // 1. Cars (avto)
  await page.goto('http://localhost:4173/iskanje?cat=avto', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.body.classList.add('dark-mode'));
  await page.waitForTimeout(500);
  const carsAcc = page.locator('#group-bodyType');
  await carsAcc.screenshot({ path: 'scratch/cars_body_types_dark.png' });

  // 2. Moto main grid
  await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.body.classList.add('dark-mode'));
  await page.waitForTimeout(500);
  const motoAcc = page.locator('#group-bodyType');
  await motoAcc.screenshot({ path: 'scratch/moto_body_types_dark.png' });

  // 3. Moto subgrid (4in3kolesa)
  const groupCard = page.locator('.moto-group-card[data-group="4in3kolesa"]');
  await groupCard.click();
  await page.waitForTimeout(500);
  await motoAcc.screenshot({ path: 'scratch/moto_subgrid_full_dark.png' });

  await browser.close();
}

run().catch(console.error);
