import shutil

files = [
    ('scratch/autohub-references/24/DashPregled.dc.html', 'C:/Users/marti/.gemini/antigravity/brain/34aff405-3bf8-4a30-b550-605295a89b26/.user_uploaded/media_1794224595248_a4c51dec.html'),
    ('scratch/autohub-references/25/DashOglasi.dc.html', 'C:/Users/marti/.gemini/antigravity/brain/34aff405-3bf8-4a30-b550-605295a89b26/.user_uploaded/media_1794224618293_2e578607.html'),
    ('scratch/autohub-references/26/DashOkna.dc.html', 'C:/Users/marti/.gemini/antigravity/brain/34aff405-3bf8-4a30-b550-605295a89b26/.user_uploaded/media_1794224674415_77c15f10.html'),
    ('scratch/autohub-references/27/DashStatistika.dc.html', 'C:/Users/marti/.gemini/antigravity/brain/34aff405-3bf8-4a30-b550-605295a89b26/.user_uploaded/media_1794224692881_81ed2cc1.html'),
    ('scratch/autohub-references/28/DashSporocila.dc.html', 'C:/Users/marti/.gemini/antigravity/brain/34aff405-3bf8-4a30-b550-605295a89b26/.user_uploaded/media_1794224708982_f944546e.html'),
]

for src, uploaded in files:
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('AutoHub – Dashboard', 'Carcommerce – Dashboard')
    content = content.replace('aria-label="AutoHub, domov"', 'aria-label="Carcommerce, domov"')
    content = content.replace('alt="AutoHub"', 'alt="Carcommerce"')
    content = content.replace('AutoHub<span style="color:#60a5fa">.si</span>', 'Carcommerce<span style="color:#60a5fa">.si</span>')
    
    with open(src, 'w', encoding='utf-8') as f:
        f.write(content)
        
    shutil.copy2(src, uploaded)

print('Updated 5 reference HTMLs and synced with uploaded artifacts')
