from pathlib import Path
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8').replace('sellerProgress,sellerCategory,enhanceSellerStep','sellerProgress,sellerCategory,enhanceSellerStep,sellerMedia')
s=s.replace('function renderMediaStep() {', "function renderMediaStep() {\n    if(PLATFORM.id==='avto')return sellerMedia(state,{save:saveDraft,next:goNext,back:goPrev});")
s=s.replace("fDescription:'description'", "fDesc:'description',fVin:'vin'")
s=s.replace("host.addEventListener('change',capture,{signal});", "host.addEventListener('change',capture,{signal});host.addEventListener('click',event=>{if(event.target.closest('.cl-btn')){clearTimeout(timer);capture();}},{capture:true,signal});")
s=s.replace("const exteriorUrls = [...state._exteriorUrls.filter(u => u.startsWith('http')), ...newExtUrls];", "let newExtIndex=0;const exteriorUrls = state._exteriorUrls.map(url=>url.startsWith('http')?url:newExtUrls[newExtIndex++]);")
s=s.replace("const interiorUrls = [...state._interiorUrls.filter(u => u.startsWith('http')), ...newIntUrls];", "let newIntIndex=0;const interiorUrls = state._interiorUrls.map(url=>url.startsWith('http')?url:newIntUrls[newIntIndex++]);")
s=s.replace("                variant: state.variant,\n                linija:", "                variant: state.variant,\n                vin:state.vin||'',\n                linija:")
p.write_text(s,encoding='utf-8')
