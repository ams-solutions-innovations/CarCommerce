import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4173/iskanje?cat=moto', { waitUntil: 'networkidle' });
  await page.waitForSelector('#acc-engine');
  
  const bodyInfo = await page.evaluate(() => {
    const body = document.querySelector('#acc-engine .adv-acc-body');
    const parent = body ? getComputedStyle(body) : null;
    return {
      bodyDisplay: parent?.display,
      bodyFlexDirection: parent?.flexDirection,
      children: Array.from(body.children).map(c => ({
        tag: c.tagName,
        className: c.className,
        id: c.id,
        display: getComputedStyle(c).display,
        width: c.offsetWidth,
        gridTemplateColumns: getComputedStyle(c).gridTemplateColumns
      }))
    };
  });
  console.log(JSON.stringify(bodyInfo, null, 2));
  await browser.close();
}

run().catch(console.error);
