import xml.etree.ElementTree as ET
import re

tree = ET.parse('scratch/logo_hires.svg')
root = tree.getroot()
paths = root.findall('.//{http://www.w3.org/2000/svg}path')

combined_d = []

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
                x = float(tokens[idx]) + tx
                y = float(tokens[idx+1]) + ty
                new_tokens.extend([f'{x:.2f}', f'{y:.2f}'])
                idx += 2
            elif cmd == 'C':
                while idx < len(tokens) and not tokens[idx].isalpha():
                    x1 = float(tokens[idx]) + tx
                    y1 = float(tokens[idx+1]) + ty
                    x2 = float(tokens[idx+2]) + tx
                    y2 = float(tokens[idx+3]) + ty
                    x = float(tokens[idx+4]) + tx
                    y = float(tokens[idx+5]) + ty
                    new_tokens.extend([f'{x1:.2f}', f'{y1:.2f}', f'{x2:.2f}', f'{y2:.2f}', f'{x:.2f}', f'{y:.2f}'])
                    idx += 6
            elif cmd in ('Z', 'z'):
                pass
        else:
            idx += 1
            
    combined_d.append(' '.join(new_tokens))

full_d = ' '.join(combined_d)
print('Baked path count:', len(combined_d))
print('Full d length:', len(full_d))

nums = [float(x) for x in re.findall(r'[-+]?(?:\d*\.\d+|\d+)', full_d)]
xs = nums[0::2]
ys = nums[1::2]
min_x, max_x = min(xs), max(xs)
min_y, max_y = min(ys), max(ys)
w = max_x - min_x
h = max_y - min_y
print(f'BBox: x=[{min_x:.1f}, {max_x:.1f}], y=[{min_y:.1f}, {max_y:.1f}], w={w:.1f}, h={h:.1f}')

# Output standalone SVG with viewBox cropped to bounding box with padding
pad = 20
vb_x = min_x - pad
vb_y = min_y - pad
vb_w = w + pad*2
vb_h = h + pad*2

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb_x:.1f} {vb_y:.1f} {vb_w:.1f} {vb_h:.1f}" fill="currentColor">
  <path fill-rule="evenodd" d="{full_d}" />
</svg>'''

with open('scratch/carcommerce_evenodd.svg', 'w') as f:
    f.write(svg_content)
print('Saved scratch/carcommerce_evenodd.svg')
