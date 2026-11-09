import { chromium } from 'playwright';

async function testDomClickScroll() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3003/oglas?id=car-premium-1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cost-panel__collapsed');

  // Move #react-cost-panel-root into .lp-main before seller section
  await page.evaluate(() => {
    const cpRoot = document.getElementById('react-cost-panel-root');
    const seller = document.querySelector('.lp-seller-section');
    if (cpRoot && seller) {
      seller.parentElement.insertBefore(cpRoot, seller);
    }
  });

  // Click Stroški tab via DOM click
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.ah-detail-tabs button')).find(b => b.textContent.includes('Stroški'));
    btn.click();
  });
  await page.waitForTimeout(1000);
  console.log('ScrollY after tab click:', await page.evaluate(() => window.scrollY));

  // Now click toggle via DOM click
  await page.evaluate(() => {
    document.querySelector('.cost-panel__toggle').click();
  });
  await page.waitForTimeout(1000);
  console.log('ScrollY after DOM toggle click:', await page.evaluate(() => window.scrollY));

  await browser.close();
}

testDomClickScroll().catch(console.error);
