with open('scratch/autohub-references/32/DrazbeDeska.dc.html', 'r', encoding='utf-8') as f:
    text32 = f.read()

import re
m = re.findall(r'<[a-z0-9]+ class="[^"]*\blc\b[^"]*"[^>]*>', text32)
print("Tag with lc class:", m[:5])

# Find where lc starts and extract 1200 chars
if m:
    pos = text32.find('class="card lc')
    if pos == -1:
        pos = text32.find('class="lc')
    print(text32[pos:pos+1500].encode('ascii', errors='replace').decode('ascii'))
