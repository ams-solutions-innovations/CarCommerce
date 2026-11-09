from pathlib import Path
p=Path('src/pages/create-listing.js');s=p.read_text(encoding='utf-8')
s=s.replace("        const editId=new URLSearchParams(location.search).get('edit');", "        let ownerProfile=null;if(currentUser()){try{ownerProfile=await getCurrentUserDoc();state.sellerType=ownerProfile?.sellerType||'private';}catch{}}if(signal.aborted)return;\n        const editId=new URLSearchParams(location.search).get('edit');")
s=s.replace("        if(signal.aborted)return;\n        const removeGuard=", "        if(ownerProfile?.sellerType)state.sellerType=ownerProfile.sellerType;\n        if(signal.aborted)return;\n        if(!editId&&currentUser()&&state.sellerType!=='business'){try{const mine=await getUserListings(currentUser().id);if(signal.aborted)return;enforceListingQuota({used:mine.filter(listing=>listing.status==='active').length});}catch{}}\n        const removeGuard=")
p.write_text(s,encoding='utf-8')
p=Path('tests/e2e/autohub-seller.spec.js');s=p.read_text(encoding='utf-8').replace("toHaveValue('120.001')", "toHaveValue('120.001 km')");p.write_text(s,encoding='utf-8')
