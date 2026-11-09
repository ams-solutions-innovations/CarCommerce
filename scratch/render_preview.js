import { chromium } from '@playwright/test';
import fs from 'fs';

async function main() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const svg = fs.readFileSync('scratch/carcommerce_evenodd.svg', 'utf8');
    
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#ffffff;display:flex;align-items:center;justify-content:center;height:100vh;padding:40px;box-sizing:border-box;"><div style="width:900px;color:#041222;">${svg}</div></body></html>`);
    await page.screenshot({ path: 'scratch/preview_light.png' });
    
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#0c1b30;display:flex;align-items:center;justify-content:center;height:100vh;padding:40px;box-sizing:border-box;"><div style="width:900px;color:#ffffff;">${svg}</div></body></html>`);
    await page.screenshot({ path: 'scratch/preview_dark.png' });
    
    await browser.close();
    console.log('Screenshots saved to scratch/preview_light.png and scratch/preview_dark.png');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
