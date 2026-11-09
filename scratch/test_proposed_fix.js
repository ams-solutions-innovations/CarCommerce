import { chromium } from 'playwright';

async function testProposedFix() {
  const browser = await chromium.launch();
  
  // ── 1. Desktop Test ──
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
    await page.waitForSelector('.cost-panel__collapsed');

    // Apply the fix in-page
    await page.evaluate(() => {
      const main = document.querySelector('.lp-main');
      const costRoot = document.getElementById('react-cost-panel-root');
      const seller = document.querySelector('.lp-seller-section');
      if (main && costRoot && seller) {
        main.insertBefore(costRoot, seller);
      }
    });

    // Check sidebar height
    const sbInfo = await page.evaluate(() => {
      const sb = document.querySelector('.lp-sidebar');
      return { height: sb.offsetHeight, childCount: sb.children.length };
    });
    console.log('Desktop sidebar after fix:', sbInfo);

    // Click Stroški tab
    const stroskiTab = page.locator('.ah-detail-tabs button', { hasText: 'Stroški' });
    await stroskiTab.click();
    await page.waitForTimeout(600);
    const scrollYTab = await page.evaluate(() => window.scrollY);
    const cpBox = await page.locator('.cost-panel').boundingBox();
    console.log('Desktop after Stroški tab click:', { scrollY: scrollYTab, cpBox });
    await page.screenshot({ path: 'scratch/desktop_fixed_tab.png' });

    // Click Prikaži razčlenitev
    await page.locator('.cost-panel__toggle').click();
    await page.waitForTimeout(600);
    const scrollYToggle = await page.evaluate(() => window.scrollY);
    const cpBoxExp = await page.locator('.cost-panel').boundingBox();
    console.log('Desktop after toggle click:', { scrollY: scrollYToggle, cpBoxExp });
    await page.screenshot({ path: 'scratch/desktop_fixed_expanded.png' });
    await page.close();
  }

  // ── 2. Mobile Test ──
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
    await page.waitForSelector('.cost-panel__collapsed');

    // Apply fix
    await page.evaluate(() => {
      const main = document.querySelector('.lp-main');
      const costRoot = document.getElementById('react-cost-panel-root');
      const seller = document.querySelector('.lp-seller-section');
      if (main && costRoot && seller) {
        main.insertBefore(costRoot, seller);
      }
    });

    const stroskiTab = page.locator('.ah-detail-tabs button', { hasText: 'Stroški' });
    await stroskiTab.click();
    await page.waitForTimeout(600);
    const scrollYTab = await page.evaluate(() => window.scrollY);
    const cpBox = await page.locator('.cost-panel').boundingBox();
    console.log('Mobile after Stroški tab click:', { scrollY: scrollYTab, cpBox });
    await page.screenshot({ path: 'scratch/mobile_fixed_tab.png' });

    await page.locator('.cost-panel__toggle').click();
    await page.waitForTimeout(600);
    const scrollYToggle = await page.evaluate(() => window.scrollY);
    const cpBoxExp = await page.locator('.cost-panel').boundingBox();
    console.log('Mobile after toggle click:', { scrollY: scrollYToggle, cpBoxExp });
    await page.screenshot({ path: 'scratch/mobile_fixed_expanded.png' });
    await page.close();
  }

  await browser.close();
}

testProposedFix().catch(console.error);
