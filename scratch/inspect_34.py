import sys

with open('scratch/style_34.css', 'r', encoding='utf-8') as f:
    text34 = f.read()

import re
rules = re.findall(r'([^{]+)\{([^}]+)\}', text34)
with open('scratch/rules_34.txt', 'w', encoding='utf-8') as out:
    for sel, body in rules:
        out.write(f"{sel.strip()} {{\n  {body.strip()}\n}}\n\n")

print(f"Wrote {len(rules)} rules to scratch/rules_34.txt")
