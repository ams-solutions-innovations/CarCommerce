import re

with open('scratch/autohub-references/32/DrazbeDeska.dc.html', 'r', encoding='utf-8') as f:
    text32 = f.read()

print("--- 32 spec matches ---")
for m in re.findall(r'<div class="az-s[^"]*">.*?</div>', text32, re.DOTALL)[:3]:
    print(m[:300])

for m in re.findall(r'<div class="lc-s[^"]*">.*?</div>', text32, re.DOTALL)[:3]:
    print(m[:300])

for m in re.findall(r'<div class="sp[^"]*">.*?</div>', text32, re.DOTALL)[:3]:
    print(m[:300])
