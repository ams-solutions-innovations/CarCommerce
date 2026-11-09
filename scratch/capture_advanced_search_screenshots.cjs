const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1800 }
  });
  const page = await context.newPage();

  const outDir = 'C:/Users/marti/.gemini/antigravity/brain/fa292525-706a-4c5a-9043-5470de671287';

  try {
    await page.goto('http://localhost:3000/iskanje?cat=avto', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Desktop dark
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'advanced_search_cars_dark.png'), fullPage: false });
    console.log('Saved advanced_search_cars_dark.png');

    // Desktop light
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'advanced_search_cars_light.png'), fullPage: false });
    console.log('Saved advanced_search_cars_light.png');

    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(outDir, 'advanced_search_cars_mobile_light.png'), fullPage: false });
    console.log('Saved advanced_search_cars_mobile_light.png');

    // Mobile dark
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'advanced_search_cars_mobile_dark.png'), fullPage: false });
    console.log('Saved advanced_search_cars_mobile_dark.png');

  } catch (err) {
    console.error('Screenshot error:', err);
  } finally {
    await browser.close();
  }
})();
