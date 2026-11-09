import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });

  // Get computed styles of body-type-grid and body-type-card
  const gridInfo = await page.evaluate(() => {
    const mainGrid = document.querySelector('#motoMainGrid');
    const card = document.querySelector('#motoMainGrid .body-type-card');
    const icon = card ? card.querySelector('.custom-v-icon') : null;

    const mainStyles = window.getComputedStyle(mainGrid);
    const cardStyles = card ? window.getComputedStyle(card) : {};
    const iconStyles = icon ? window.getComputedStyle(icon) : {};

    return {
      mainGrid: {
        display: mainStyles.display,
        justifyContent: mainStyles.justifyContent,
        alignItems: mainStyles.alignItems,
        gridTemplateColumns: mainStyles.gridTemplateColumns,
        flexWrap: mainStyles.flexWrap,
        gap: mainStyles.gap,
        width: mainStyles.width
      },
      card: {
        width: cardStyles.width,
        height: cardStyles.height,
        flex: cardStyles.flex,
        padding: cardStyles.padding
      },
      icon: {
        width: iconStyles.width,
        height: iconStyles.height
      }
    };
  });

  console.log('Grid Info:', JSON.stringify(gridInfo, null, 2));

  // Now click on the 4in3kolesa group card to open motoSubGrid
  const groupCard = page.locator('.moto-group-card[data-group="4in3kolesa"]');
  await groupCard.click();
  await page.waitForTimeout(300);

  const subGridInfo = await page.evaluate(() => {
    const subGrid = document.querySelector('#motoSubGrid');
    const card = subGrid ? subGrid.querySelector('.body-type-card') : null;
    const subStyles = window.getComputedStyle(subGrid);
    const cardStyles = card ? window.getComputedStyle(card) : {};
    return {
      display: subStyles.display,
      justifyContent: subStyles.justifyContent,
      alignItems: subStyles.alignItems,
      gridTemplateColumns: subStyles.gridTemplateColumns,
      flexWrap: subStyles.flexWrap,
      gap: subStyles.gap,
      width: subStyles.width,
      cardWidth: cardStyles.width,
      cardHeight: cardStyles.height
    };
  });

  console.log('SubGrid Info:', JSON.stringify(subGridInfo, null, 2));

  // Take screenshot of subGrid
  await page.locator('#acc-engine, #group-bodyType').first().screenshot({ path: 'scratch/subgrid_current.png' });

  await browser.close();
}

check().catch(console.error);
