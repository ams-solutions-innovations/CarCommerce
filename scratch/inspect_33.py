with open('scratch/style_33.css', 'r', encoding='utf-8') as f:
    text33 = f.read()

import re
rules = re.findall(r'([^{]+)\{([^}]+)\}', text33)
print(f"Total rules in 33: {len(rules)}")
az_rules = [r for r in rules if 'az-' in r[0] or 'fact' in r[0] or 'snip' in r[0]]
for sel, body in az_rules:
    print(f"{sel.strip()} {{ {body.strip()[:100]}... }}")
