import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  // Test 1: current card size (160px max) with 60px icon
  await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.body.classList.add('dark-mode');
    const style = document.createElement('style');
    style.innerHTML = `
      .body-type-card .custom-v-icon {
        width: 60px !important;
        height: 60px !important;
      }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(300);
  const motoSec = page.locator('#group-bodyType');
  await motoSec.screenshot({ path: 'scratch/card_width_160_moto.png' });

  // Test 2: square card size (e.g. 116px x 116px or 120px)
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .body-type-grid > .body-type-card {
        flex: 0 1 116px !important;
        min-width: 96px !important;
        height: 116px !important;
      }
      .body-type-card .custom-v-icon {
        width: 58px !important;
        height: 58px !important;
      }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(300);
  await motoSec.screenshot({ path: 'scratch/card_width_116_moto.png' });

  // Open 4 in 3 kolesa with 116px cards
  const groupCard = page.locator('.moto-group-card[data-group="4in3kolesa"]');
  await groupCard.click();
  await page.waitForTimeout(300);
  await motoSec.screenshot({ path: 'scratch/card_width_116_sub_moto.png' });

  // Now Cars with 116px cards
  await page.goto('http://localhost:4173/iskanje?cat=avto', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.body.classList.add('dark-mode');
    const style = document.createElement('style');
    style.innerHTML = `
      .body-type-grid > .body-type-card {
        flex: 0 1 116px !important;
        min-width: 96px !important;
        height: 116px !important;
      }
      .body-type-card .custom-v-icon {
        width: 58px !important;
        height: 58px !important;
      }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(300);
  const carsSec = page.locator('#group-bodyType');
  await carsSec.screenshot({ path: 'scratch/card_width_116_cars.png' });

  await browser.close();
}

test().catch(console.error);
