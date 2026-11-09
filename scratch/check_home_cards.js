import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
  const homeCard = page.locator('.ah-search-card');
  if (await homeCard.count() > 0) {
    await homeCard.screenshot({ path: 'scratch/home_card_light.png' });
  }

  // Dark mode
  await page.evaluate(() => {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.body.classList.add('dark-mode');
  });
  await page.waitForTimeout(500);

  const homeCardDark = page.locator('.ah-search-card');
  if (await homeCardDark.count() > 0) {
    await homeCardDark.screenshot({ path: 'scratch/home_card_dark.png' });
  }

  await browser.close();
  console.log('Saved home card screenshots!');
}

main().catch(console.error);
