with open('scratch/autohub-references/32/DrazbeDeska.dc.html', 'r', encoding='utf-8') as f:
    text32 = f.read()

idx = text32.find('border-radius:3px 3px 0 0')
start = max(0, idx - 400)
end = min(len(text32), idx + 100)
print(text32[start:end].encode('ascii', errors='replace').decode('ascii'))
