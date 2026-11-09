from pathlib import Path
import re
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8');s=re.sub(r'setupNumericFormatter\((\w+)\)',r"setupNumericFormatter(\1,{appendUnit:PLATFORM.id!=='avto'})",s)
s=s.replace("document.addEventListener('beforeRouteChange',()=>{wizardController.abort();}", "document.addEventListener('beforeRouteChange',()=>{wizardController.abort();for(const url of [...state._exteriorUrls,...state._interiorUrls])if(url.startsWith('blob:'))URL.revokeObjectURL(url);}")
p.write_text(s,encoding='utf-8')
p=Path('tests/e2e/autohub-seller.spec.js');s=p.read_text(encoding='utf-8').replace("toHaveValue('120.001 km')", "toHaveValue('120.001')");p.write_text(s,encoding='utf-8')
