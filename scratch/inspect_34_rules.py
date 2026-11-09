with open('scratch/style_34.css', 'r', encoding='utf-8') as f:
    text34 = f.read()

import re
rules = re.findall(r'([^{]+)\{([^}]+)\}', text34)
for sel, body in rules:
    s = sel.strip()
    if any(k in s for k in ['az-', 'card', 'glass', 'win', 'pad', 'toast']):
        print(f"/* {s} */")
        print(f"{s} {{\n  {body.strip()}\n}}")
