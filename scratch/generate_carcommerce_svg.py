import xml.etree.ElementTree as ET
import re
import os

tree = ET.parse('scratch/logo_hires.svg')
root = tree.getroot()
paths = root.findall('.//{http://www.w3.org/2000/svg}path')

combined_d = []
scale = 0.25 # scale 4x hires back to 1024x341 coordinate space

for i, p in enumerate(paths):
    if i == 0:
        continue  # skip background rect
    
    trans_str = p.attrib.get('transform', '')
    m = re.search(r'translate\(([^,]+),([^)]+)\)', trans_str)
    tx, ty = (float(m.group(1)), float(m.group(2))) if m else (0.0, 0.0)
    
    d = p.attrib.get('d', '')
    
    tokens = re.findall(r'([a-zA-Z]|[-+]?(?:\d*\.\d+|\d+))', d)
    new_tokens = []
    
    idx = 0
    while idx < len(tokens):
        token = tokens[idx]
        if token.isalpha():
            cmd = token
            new_tokens.append(cmd)
            idx += 1
            if cmd in ('M', 'L'):
                x = (float(tokens[idx]) + tx) * scale
                y = (float(tokens[idx+1]) + ty) * scale
                new_tokens.extend([f'{x:.2f}', f'{y:.2f}'])
                idx += 2
            elif cmd == 'C':
                while idx < len(tokens) and not tokens[idx].isalpha():
                    x1 = (float(tokens[idx]) + tx) * scale
                    y1 = (float(tokens[idx+1]) + ty) * scale
                    x2 = (float(tokens[idx+2]) + tx) * scale
                    y2 = (float(tokens[idx+3]) + ty) * scale
                    x = (float(tokens[idx+4]) + tx) * scale
                    y = (float(tokens[idx+5]) + ty) * scale
                    new_tokens.extend([f'{x1:.2f}', f'{y1:.2f}', f'{x2:.2f}', f'{y2:.2f}', f'{x:.2f}', f'{y:.2f}'])
                    idx += 6
            elif cmd in ('Z', 'z'):
                pass
        else:
            idx += 1
            
    combined_d.append(' '.join(new_tokens))

full_d = ' '.join(combined_d)

nums = [float(x) for x in re.findall(r'[-+]?(?:\d*\.\d+|\d+)', full_d)]
xs = nums[0::2]
ys = nums[1::2]
min_x, max_x = min(xs), max(xs)
min_y, max_y = min(ys), max(ys)
w = max_x - min_x
h = max_y - min_y
print(f'Scaled BBox (1024x341 space): x=[{min_x:.2f}, {max_x:.2f}], y=[{min_y:.2f}, {max_y:.2f}], w={w:.2f}, h={h:.2f}')

# Adaptive SVG (1024x341)
svg_adaptive = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 341" fill="currentColor">
  <style>
    :root {{
      --carcommerce-fill: #041222;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --carcommerce-fill: #ffffff;
      }}
    }}
    .carcommerce-glyph {{
      fill: var(--carcommerce-fill, currentColor);
    }}
    :root.dark-mode .carcommerce-glyph,
    body.dark-mode .carcommerce-glyph,
    [data-theme="dark"] .carcommerce-glyph {{
      fill: #ffffff;
    }}
  </style>
  <path class="carcommerce-glyph" fill-rule="evenodd" d="{full_d}" />
</svg>
'''

# Light mode static SVG (for white/light backgrounds)
svg_light = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 341" fill="#041222">
  <path fill-rule="evenodd" d="{full_d}" />
</svg>
'''

# Dark mode static SVG (for dark backgrounds)
svg_dark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 341" fill="#ffffff">
  <path fill-rule="evenodd" d="{full_d}" />
</svg>
'''

# Tight SVG (no empty margins around logo)
pad = 6
t_x = min_x - pad
t_y = min_y - pad
t_w = w + pad*2
t_h = h + pad*2
svg_tight = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{t_x:.1f} {t_y:.1f} {t_w:.1f} {t_h:.1f}" fill="currentColor">
  <style>
    :root {{
      --carcommerce-fill: #041222;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --carcommerce-fill: #ffffff;
      }}
    }}
    .carcommerce-glyph {{
      fill: var(--carcommerce-fill, currentColor);
    }}
    :root.dark-mode .carcommerce-glyph,
    body.dark-mode .carcommerce-glyph,
    [data-theme="dark"] .carcommerce-glyph {{
      fill: #ffffff;
    }}
  </style>
  <path class="carcommerce-glyph" fill-rule="evenodd" d="{full_d}" />
</svg>
'''

# Write to outputs
os.makedirs('public/brand/autohub', exist_ok=True)
os.makedirs('public/images', exist_ok=True)

with open('public/brand/autohub/b49ac8db89e3166c448617abd7a553fe.svg', 'w', encoding='utf-8') as f:
    f.write(svg_adaptive)

with open('public/images/carcommerce-logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_adaptive)

with open('public/images/carcommerce-logo-light.svg', 'w', encoding='utf-8') as f:
    f.write(svg_light)

with open('public/images/carcommerce-logo-dark.svg', 'w', encoding='utf-8') as f:
    f.write(svg_dark)

with open('public/images/carcommerce-logo-tight.svg', 'w', encoding='utf-8') as f:
    f.write(svg_tight)

with open('public/images/logo-header.svg', 'w', encoding='utf-8') as f:
    f.write(svg_adaptive)

print('Generated all SVG files successfully!')
