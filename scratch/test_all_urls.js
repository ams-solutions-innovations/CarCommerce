import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const urls = [
    'http://localhost:4173/iskanje',
    'http://localhost:4173/iskanje?cat=avto',
    'http://localhost:4173/iskanje?cat=moto',
    'http://localhost:4173/iskanje?cat=motor',
    'http://localhost:4173/iskanje?cat=prosti-cas',
    'http://localhost:4173/oglasi'
  ];

  for (const url of urls) {
    await page.goto(url);
    await page.waitForTimeout(800);
    
    const info = await page.evaluate((currentUrl) => {
      const accs = Array.from(document.querySelectorAll('.adv-accordion'));
      return {
        url: currentUrl,
        accCount: accs.length,
        items: accs.map((a, i) => {
          const trigger = a.querySelector('.adv-acc-trigger');
          const body = a.querySelector('.adv-acc-body');
          const title = a.querySelector('.adv-acc-title')?.textContent?.trim();
          const display = body ? window.getComputedStyle(body).display : 'no-body';
          const maxH = body ? window.getComputedStyle(body).maxHeight : 'no-body';
          const isAria = trigger?.getAttribute('aria-expanded');
          const isAccAria = a.getAttribute('aria-expanded');
          const visible = display !== 'none' && maxH !== '0px';
          return {
            title,
            id: a.id,
            visible,
            display,
            maxH,
            triggerAria: isAria,
            accAria: isAccAria
          };
        })
      };
    }, url);

    console.log(`\nURL: ${url}`);
    info.items.forEach(it => {
      console.log(`  [${it.visible ? 'OPEN ' : 'SHUT'}] "${it.title}" (id: ${it.id}) display:${it.display} maxH:${it.maxH} aria:${it.triggerAria}`);
    });
  }

  await browser.close();
})();
