import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });

  const sizes = [56, 60, 64, 76];

  for (const size of sizes) {
    // 1. Cars Dark Mode
    await page.goto('http://localhost:4173/iskanje?cat=avto', { waitUntil: 'networkidle' });
    await page.evaluate((s) => {
      document.body.classList.add('dark-mode');
      const style = document.createElement('style');
      style.id = 'temp-test-size';
      style.innerHTML = `
        .body-type-card .custom-v-icon {
          width: ${s}px !important;
          height: ${s}px !important;
        }
      `;
      document.head.appendChild(style);
    }, size);
    await page.waitForTimeout(300);
    const carsGrid = page.locator('#group-bodyType');
    await carsGrid.screenshot({ path: `scratch/cars_size_${size}_dark.png` });

    // 2. Moto Dark Mode
    await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
    await page.evaluate((s) => {
      document.body.classList.add('dark-mode');
      const style = document.createElement('style');
      style.id = 'temp-test-size';
      style.innerHTML = `
        .body-type-card .custom-v-icon {
          width: ${s}px !important;
          height: ${s}px !important;
        }
      `;
      document.head.appendChild(style);
    }, size);
    await page.waitForTimeout(300);
    const motoGrid = page.locator('#group-bodyType');
    await motoGrid.screenshot({ path: `scratch/moto_size_${size}_dark.png` });

    // 3. Moto Subgrid (4 in 3 kolesa)
    const groupCard = page.locator('.moto-group-card[data-group="4in3kolesa"]');
    await groupCard.click();
    await page.waitForTimeout(300);
    await motoGrid.screenshot({ path: `scratch/moto_sub_size_${size}_dark.png` });
  }

  await browser.close();
  console.log('Tested all sizes successfully.');
}

run().catch(console.error);
