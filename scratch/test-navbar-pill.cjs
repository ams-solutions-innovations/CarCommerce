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

  // 1. Light mode header pill
  await page.evaluate(() => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/mobile_header_pill_clean_light.png' });
  console.log('Saved scratch/mobile_header_pill_clean_light.png');

  // 2. Open profile menu in light mode
  const accountBtn = page.locator('#ahAccountButton');
  await accountBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/mobile_profile_menu_clean_light.png' });
  console.log('Saved scratch/mobile_profile_menu_clean_light.png');

  // Close profile menu by clicking accountBtn again
  await accountBtn.click();
  await page.waitForTimeout(300);

  // 3. Scroll down in light mode to demonstrate frosted glass effect over content
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/mobile_header_pill_clean_scrolled_light.png' });
  console.log('Saved scratch/mobile_header_pill_clean_scrolled_light.png');

  // 4. Toggle to dark mode while scrolled
  const themeBtn = page.locator('#ahTheme');
  await themeBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch/mobile_header_pill_clean_scrolled_dark.png' });
  console.log('Saved scratch/mobile_header_pill_clean_scrolled_dark.png');

  // 5. Scroll back up in dark mode
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/mobile_header_pill_clean_dark.png' });
  console.log('Saved scratch/mobile_header_pill_clean_dark.png');

  await browser.close();
  console.log('Done!');
})();
