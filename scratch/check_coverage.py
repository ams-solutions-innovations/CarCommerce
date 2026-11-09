import re

# Read all unique classes from the 3 prototypes
classes = set()
for num in [32, 33, 34]:
    with open(f'scratch/autohub-references/{num}/' + {32: 'DrazbeDeska.dc.html', 33: 'DrazbaOglas.dc.html', 34: 'DrazbaStanja.dc.html'}[num], 'r', encoding='utf-8') as f:
        text = f.read()
    for m in re.finditer(r'class="([^"]+)"', text):
        for c in m.group(1).split():
            classes.add(c)

with open('scratch/merged_auctions.css', 'r', encoding='utf-8') as f:
    css_text = f.read()

# Check each class
found = []
missing = []
for c in sorted(classes):
    # Regex match .classname\b
    if re.search(r'\.' + re.escape(c) + r'\b', css_text):
        found.append(c)
    else:
        missing.append(c)

print(f"Total classes in prototypes: {len(classes)}")
print(f"Found in merged CSS: {len(found)}")
print(f"Missing in merged CSS: {len(missing)}")
print("Missing classes list:", missing)
