import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.route('**/rest/v1/**', r => r.abort());

    console.log('Testing Grid View...');
    await page.goto('http://localhost:3003/');
    await page.evaluate(() => localStorage.setItem('avto_viewmode', 'grid'));
    await page.goto('http://localhost:3003/oglasi');
    await page.waitForSelector('.ah-listing-card', { timeout: 8000 });

    const firstCard = page.locator('.ah-listing-card').first();
    const cardContent = firstCard.locator('.ah-card-content');
    const headingH2 = firstCard.locator('.ah-card-heading h2');
    const priceBox = firstCard.locator('.ah-card-price');
    const specsBox = firstCard.locator('.ah-card-specs');
    const sellerBox = firstCard.locator('.ah-card-seller');
    const sellerSpan = sellerBox.locator('span').first();
    const actionsBox = firstCard.locator('.ah-card-quick-actions');

    const styles = await page.evaluate(() => {
        const card = document.querySelector('.ah-listing-card');
        const get = (sel) => {
            const el = card.querySelector(sel);
            if (!el) return null;
            const cs = getComputedStyle(el);
            return {
                textAlign: cs.textAlign,
                justifyContent: cs.justifyContent,
                alignItems: cs.alignItems,
            };
        };
        return {
            content: get('.ah-card-content'),
            headingH2: get('.ah-card-heading h2'),
            price: get('.ah-card-price'),
            specs: get('.ah-card-specs'),
            seller: get('.ah-card-seller'),
            sellerSpan: get('.ah-card-seller span'),
            actions: get('.ah-card-quick-actions'),
        };
    });

    console.log('Grid styles evaluated:', JSON.stringify(styles, null, 2));

    if (styles.headingH2.textAlign !== 'center') {
        throw new Error(`Heading h2 text-align is ${styles.headingH2.textAlign}, expected center`);
    }
    if (styles.price.justifyContent !== 'center') {
        throw new Error(`Price justify-content is ${styles.price.justifyContent}, expected center`);
    }
    if (styles.specs.justifyContent !== 'center') {
        throw new Error(`Specs justify-content is ${styles.specs.justifyContent}, expected center`);
    }
    if (styles.seller.alignItems !== 'center') {
        throw new Error(`Seller align-items is ${styles.seller.alignItems}, expected center`);
    }
    if (styles.sellerSpan.justifyContent !== 'center') {
        throw new Error(`Seller span justify-content is ${styles.sellerSpan.justifyContent}, expected center`);
    }

    await page.screenshot({ path: 'scratch/centered_grid_view_light.png' });
    console.log('Saved scratch/centered_grid_view_light.png');

    // Test dark mode
    await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.body.classList.add('dark-mode');
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'scratch/centered_grid_view_dark.png' });
    console.log('Saved scratch/centered_grid_view_dark.png');

    // Test that List View remains left-aligned
    console.log('Testing List View remains uncentered / left-aligned...');
    await page.locator('.view-toggle-btn[data-view="list"]').click();
    await page.waitForTimeout(300);

    const listStyles = await page.evaluate(() => {
        const card = document.querySelector('.ah-listing-card');
        const get = (sel) => {
            const el = card.querySelector(sel);
            if (!el) return null;
            const cs = getComputedStyle(el);
            return {
                textAlign: cs.textAlign,
                justifyContent: cs.justifyContent,
                alignItems: cs.alignItems,
            };
        };
        return {
            headingH2: get('.ah-card-heading h2'),
            seller: get('.ah-card-seller'),
        };
    });

    console.log('List styles evaluated:', JSON.stringify(listStyles, null, 2));
    if (listStyles.headingH2.textAlign === 'center') {
        throw new Error('List view heading should not be centered!');
    }

    await page.screenshot({ path: 'scratch/verified_list_view.png' });
    console.log('Saved scratch/verified_list_view.png');

    console.log('ALL GRID CENTERING CHECKS PASSED!');
    await browser.close();
}

main().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
