from pathlib import Path
p=Path('src/services/sellerDraftService.js');s=p.read_text(encoding='utf-8').replace("sessionStorage.setItem(id,JSON.stringify(data));", "for(const field of ['_autoFillFields','_manualFields'])if(data[field] instanceof Set)data[field]=[...data[field]];sessionStorage.setItem(id,JSON.stringify(data));")
s=s.replace("const data=JSON.parse(raw);let files;", "const data=JSON.parse(raw);for(const field of ['_autoFillFields','_manualFields'])if(data[field])data[field]=new Set(Array.isArray(data[field])?data[field]:[]);let files;")
p.write_text(s,encoding='utf-8')
