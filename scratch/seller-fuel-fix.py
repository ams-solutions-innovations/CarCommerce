from pathlib import Path
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8').replace("    const fuels = [\n        ['Petrol'", "    if(state.fuel==='Bencin')state.fuel='Petrol';\n    const fuels = [\n        ['Petrol'",1);p.write_text(s,encoding='utf-8')
p=Path('tests/e2e/autohub-seller.spec.js');s=p.read_text(encoding='utf-8').replace("select(page,'fFuel','Bencin')", "select(page,'fFuel','Petrol')");p.write_text(s,encoding='utf-8')
