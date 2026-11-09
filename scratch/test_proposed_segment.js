const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3003/iskanje');
  await page.evaluate(() => document.body.classList.add('dark-mode'));
  await page.waitForTimeout(1500);

  // Apply proposed CSS
  await page.addStyleTag({
    content: `
      .platform-avto .ah-advanced-search :is(#vehicleTypeTabs, #searchTypePills, #rentalModeToggle, .home-search-mode) {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 2px !important;
        padding: 4px !important;
        border-radius: 9999px !important;
        background: var(--ah-soft) !important;
        box-shadow: none !important;
        border: 0 !important;
        margin: 0 auto 1.5rem auto !important;
        width: max-content !important;
        max-width: 100% !important;
      }
      .platform-avto .ah-advanced-search :is(#vehicleTypeTabs .tab-btn, .home-search-mode-pill) {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        min-height: 42px !important;
        padding: 0 18px !important;
        border-radius: 9999px !important;
        border: 0 !important;
        background: transparent !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        color: var(--ah-muted) !important;
        white-space: nowrap !important;
        cursor: pointer !important;
        transform: none !important;
        box-shadow: none !important;
        transition: background .18s, color .18s, box-shadow .18s !important;
        text-decoration: none !important;
      }
      .platform-avto .ah-advanced-search :is(#vehicleTypeTabs .tab-btn, .home-search-mode-pill) :is(svg, i) {
        width: 17px !important;
        height: 17px !important;
        color: inherit !important;
        stroke: currentColor !important;
      }
      .platform-avto .ah-advanced-search :is(#vehicleTypeTabs .tab-btn, .home-search-mode-pill):hover {
        color: #ffffff !important;
        background: transparent !important;
      }
      .platform-avto .ah-advanced-search :is(#vehicleTypeTabs .tab-btn, .home-search-mode-pill).active {
        background: var(--ah-surface) !important;
        color: #1d4ed8 !important;
        box-shadow: 0 1px 2px rgba(12,27,48,.08), 0 4px 10px -4px rgba(12,27,48,.16) !important;
        transform: none !important;
      }
    `
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch/iskanje_proposed_dark.png', fullPage: false });
  console.log('Saved scratch/iskanje_proposed_dark.png');
  await browser.close();
})();
