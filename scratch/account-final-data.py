from pathlib import Path
p=Path('src/pages/business-onboarding.autohub.js');s=p.read_text(encoding='utf-8').replace("const exists=services.some(service=>service.name===name);", "const saved=services.find(service=>service.name===name);const exists=!!saved;")
s=s.replace('value="${price}" min="0" step="0.01"', 'value="${saved?.price??price}" ${exists?\'readonly\':\'\'} min="0" step="0.01"').replace('value="${duration}" min="1" max="1440"', 'value="${saved?.duration??duration}" ${exists?\'readonly\':\'\'} min="1" max="1440"')
p.write_text(s,encoding='utf-8')
