from pathlib import Path
p=Path('tests/e2e/autohub-seller.spec.js');s=p.read_text(encoding='utf-8').replace("if(await search.count())await search.fill(value);", "if(await search.count()){const label=await page.locator('#'+id).evaluate((element,value)=>[...element.options].find(option=>option.value===value)?.text||value,value);await search.fill(label);}")
p.write_text(s,encoding='utf-8')
