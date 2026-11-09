import re

files = [
    (32, 'scratch/autohub-references/32/DrazbeDeska.dc.html'),
    (33, 'scratch/autohub-references/33/DrazbaOglas.dc.html'),
    (34, 'scratch/autohub-references/34/DrazbaStanja.dc.html')
]

for num, path in files:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    classes = set()
    for m in re.finditer(r'class="([^"]+)"', html):
        for c in m.group(1).split():
            classes.add(c)
    print(f"\n=== File {num} unique classes ({len(classes)}) ===")
    print(", ".join(sorted(classes)))
