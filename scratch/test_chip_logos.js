import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3003/oglasi?make=Alfa%20Romeo,Audi', { waitUntil: 'networkidle' });
  await page.waitForSelector('.active-filter-chip');

  // Check topbar active chips
  const topChips = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.active-filter-chip'));
    return chips.map(c => ({
      text: c.innerText.trim(),
      logoSrc: c.querySelector('img.active-chip-logo')?.getAttribute('src') || null
    }));
  });
  console.log('Top chips on load:', topChips);

  // Check sidebar active pills
  const sidebarPills = await page.evaluate(() => {
    const pills = Array.from(document.querySelectorAll('#activeMake .sidebar-active-pill'));
    return pills.map(p => ({
      text: p.innerText.trim(),
      logoSrc: p.querySelector('img.sidebar-pill-logo')?.getAttribute('src') || null
    }));
  });
  console.log('Sidebar pills on load:', sidebarPills);

  // Click remove on Alfa Romeo chip
  const alfaClose = page.locator('.active-filter-chip[data-val="Alfa Romeo"] .close');
  await alfaClose.click();
  await page.waitForTimeout(400);

  const afterRemoveChips = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.active-filter-chip'));
    return chips.map(c => ({
      text: c.innerText.trim(),
      logoSrc: c.querySelector('img.active-chip-logo')?.getAttribute('src') || null
    }));
  });
  console.log('After removing Alfa Romeo:', afterRemoveChips);

  if (afterRemoveChips.length !== 1 || !afterRemoveChips[0].text.includes('Audi')) {
    throw new Error('Chip removal failed');
  }

  // Click "Počisti vse"
  const clearAll = page.locator('.active-filter-clear-all');
  await clearAll.click();
  await page.waitForTimeout(400);

  const chipsAfterClear = await page.locator('.active-filter-chip').count();
  console.log('Chips after clear all:', chipsAfterClear);
  if (chipsAfterClear !== 0) {
    throw new Error('Clear all failed');
  }

  console.log('ALL TESTS PASSED!');
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
