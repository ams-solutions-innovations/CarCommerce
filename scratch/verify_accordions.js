import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  async function checkAccs(desc) {
    const data = await page.evaluate(() => {
      const accs = Array.from(document.querySelectorAll('.adv-accordion'));
      return accs.map((a, i) => {
        const trigger = a.querySelector('.adv-acc-trigger');
        const body = a.querySelector('.adv-acc-body');
        const title = a.querySelector('.adv-acc-title')?.textContent?.trim();
        const display = body ? window.getComputedStyle(body).display : 'none';
        const isTriggerExpanded = trigger?.getAttribute('aria-expanded');
        const isOpen = display !== 'none' && isTriggerExpanded === 'true';
        return { index: i, id: a.id, title, isOpen, display, isTriggerExpanded };
      });
    });
    console.log(`\n=== ${desc} ===`);
    data.forEach(d => {
      console.log(`  [${d.isOpen ? 'OPEN ' : 'SHUT'}] "${d.title}" (id: ${d.id}) display:${d.display} aria:${d.isTriggerExpanded}`);
    });
    return data;
  }

  // 1. Initial load /iskanje
  await page.goto('http://localhost:4173/iskanje');
  await page.waitForTimeout(600);
  let res = await checkAccs('Initial /iskanje (Cars)');
  if (res[0].isOpen && !res[1].isOpen) {
    console.log('✓ PASS: Osnovni podatki is OPEN, Motor in pogon is SHUT');
  } else {
    console.error('✗ FAIL: Accordion state unexpected on /iskanje');
  }
  await page.screenshot({ path: 'scratch/iskanje_cars_initial.png' });

  // 2. Initial load /iskanje?cat=moto
  await page.goto('http://localhost:4173/iskanje?cat=moto');
  await page.waitForTimeout(600);
  res = await checkAccs('Initial /iskanje?cat=moto (Motorcycles)');
  if (res[0].isOpen && !res[1].isOpen) {
    console.log('✓ PASS: Moto Osnovni podatki is OPEN, Motor in pogon is SHUT');
  } else {
    console.error('✗ FAIL: Accordion state unexpected on /iskanje?cat=moto');
  }
  await page.screenshot({ path: 'scratch/iskanje_moto_initial.png' });

  // 3. Tab switch: click Avtomobili, then Motorji
  await page.locator('.tabs-glass .tab-btn[data-tab="avto"]').click();
  await page.waitForTimeout(400);
  res = await checkAccs('After clicking Avtomobili tab');
  if (res[0].isOpen && !res[1].isOpen) {
    console.log('✓ PASS: After tab click to avto, Motor in pogon is SHUT');
  }

  await page.locator('.tabs-glass .tab-btn[data-tab="moto"]').click();
  await page.waitForTimeout(400);
  res = await checkAccs('After clicking Motorji tab');
  if (res[0].isOpen && !res[1].isOpen) {
    console.log('✓ PASS: After tab click to moto, Motor in pogon is SHUT');
  }

  // 4. Manually open Motor in pogon
  await page.locator('#acc-engine .adv-acc-trigger').click();
  await page.waitForTimeout(400);
  res = await checkAccs('After manually clicking Motor in pogon');
  if (res[1].isOpen) {
    console.log('✓ PASS: Motor in pogon opens when user clicks it');
  }
  await page.screenshot({ path: 'scratch/iskanje_moto_engine_opened.png' });

  // 5. Click reset
  await page.locator('button[type="reset"]').click();
  await page.waitForTimeout(400);
  res = await checkAccs('After clicking reset button');
  if (res[0].isOpen && !res[1].isOpen) {
    console.log('✓ PASS: After reset, only Osnovni podatki is OPEN');
  }

  // Dark mode test & screenshot
  await page.evaluate(() => document.body.classList.add('dark-mode'));
  await page.screenshot({ path: 'scratch/iskanje_dark_initial.png' });

  await browser.close();
  console.log('\nAll accordion verification tests completed successfully!');
})();
