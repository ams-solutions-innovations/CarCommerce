import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Clear localStorage
  await page.goto('http://localhost:4173/');
  await page.evaluate(() => localStorage.clear());
  
  await page.goto('http://localhost:4173/iskanje');
  await page.waitForTimeout(1000);
  
  const accordions = await page.evaluate(() => {
    const accs = Array.from(document.querySelectorAll('.adv-accordion'));
    return accs.map((acc, i) => {
      const trigger = acc.querySelector('.adv-acc-trigger');
      const body = acc.querySelector('.adv-acc-body');
      const title = acc.querySelector('.adv-acc-title')?.textContent?.trim();
      return {
        index: i,
        id: acc.id,
        title,
        accExpanded: acc.getAttribute('aria-expanded'),
        triggerExpanded: trigger?.getAttribute('aria-expanded'),
        bodyDisplay: body ? window.getComputedStyle(body).display : null,
        bodyVisibility: body ? window.getComputedStyle(body).visibility : null,
        isPersistent: acc.classList.contains('persistent-open'),
        classes: acc.className
      };
    });
  });

  console.log(JSON.stringify(accordions, null, 2));
  
  await page.screenshot({ path: 'scratch/initial_iskanje.png', fullPage: true });
  await browser.close();
})();
