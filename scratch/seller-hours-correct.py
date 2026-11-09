from pathlib import Path
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8').replace("const mileageRaw = document.getElementById(isHours?'fEngineHours':'fMileage').value;", "const mileageRaw = document.getElementById('fMileage').value;")
s=s.replace("if(input)state[key]=['mileageKm','engineHours','priceEur'].includes(key)?parseFormattedNumber(input.value):input.value;", "if(input){if(key==='mileageKm'&&odometerUnitForState(state)==='hours')state.engineHours=parseFormattedNumber(input.value);else state[key]=['mileageKm','engineHours','priceEur'].includes(key)?parseFormattedNumber(input.value):input.value;}")
p.write_text(s,encoding='utf-8')
p=Path('tests/e2e/autohub-seller.spec.js');s=p.read_text(encoding='utf-8').replace("await expect(page.locator('#fEngineHours')).toBeVisible();await expect(page.locator('#fMileage')).toHaveCount(0);", "await expect(page.locator('.cl-mileage-unit')).toHaveText('h');await page.locator('#fMileage').fill('1234');await expect(page.locator('[data-draft-status]')).toContainText('shranjen');await page.reload();await expect(page.locator('#fMileage')).toHaveValue('1.234');")
s=s.replace("machinery uses operating hours and validation does not read a missing mileage field", "machinery stores operating hours across reload and validates without page errors")
p.write_text(s,encoding='utf-8')
p=Path('docs/rebrand/IMPLEMENTATION-STATUS.md');s=p.read_text(encoding='utf-8').replace('Mehanizacija bere polje delovnih ur namesto neobstoječega polja kilometrov.', 'Mehanizacija uporablja enoto h in pravilen zapis obratovalnih ur; poleg vnosa enota ni podvojena.')
p.write_text(s,encoding='utf-8')
