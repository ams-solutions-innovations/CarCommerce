import re

for num in [32, 33, 34]:
    with open(f'scratch/autohub-references/{num}/' + {32: 'DrazbeDeska.dc.html', 33: 'DrazbaOglas.dc.html', 34: 'DrazbaStanja.dc.html'}[num], 'r', encoding='utf-8') as f:
        text = f.read()
    
    classes = set()
    for m in re.finditer(r'class="([^"]+)"', text):
        for c in m.group(1).split():
            classes.add(c)
    print(f"\n--- File {num} ---")
    print("Classes count:", len(classes))
    az = sorted([c for c in classes if c.startswith('az-') or c in ['sp', 'card', 'glass', 'chip', 'bchip', 'tsw', 'pop', 'cbx', 'pacts', 'pnew', 'pdesk', 'fact', 'sl-t', 'sl-f', 'handle', 'sec', 'sh', 'lc', 'lc-ph', 'lc-b', 'lc-r']])
    print("Auction & Board related classes:", az)
