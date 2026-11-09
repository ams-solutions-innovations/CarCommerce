from pathlib import Path
p=Path('tests/e2e/autohub-seller.spec.js');s=p.read_text(encoding='utf-8');import re
s=re.sub(r"await page.locator\('#([^']+)'\).selectOption\('([^']+)'\)",r"await select(page,'\1','\2')",s)
s=s.replace('async function basic(page)', '''async function select(page,id,value){const wrapper=page.locator(`.custom-select-container:has(+ #${id})`);if(await wrapper.count()){await wrapper.locator('.custom-select-trigger').click();const search=wrapper.locator('.custom-select-search');if(await search.count())await search.fill(value);await wrapper.locator(`.custom-select-option[data-value="${value}"]:visible`).first().click();}else await page.locator('#'+id).selectOption(value);}
async function basic(page)''')
p.write_text(s,encoding='utf-8')
