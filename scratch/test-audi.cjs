const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  });
  await page.waitForTimeout(400);

  // Select Audi in light mode
  const brandTrigger = page.locator('[data-home-field="home-make"] .custom-select-trigger');
  await brandTrigger.click();
  await page.waitForTimeout(300);
  const audiOpt = page.locator('.custom-select-sheet.open .custom-select-option[data-value="Audi"]').first();
  await audiOpt.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'scratch/light_mode_audi_verified.png' });
  await browser.close();
  console.log('Saved light mode screenshot');
})();
