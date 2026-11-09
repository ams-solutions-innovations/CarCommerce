import fs from 'fs';
import path from 'path';

function searchCss(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchCss(full);
    } else if (stat.isFile() && f.endsWith('.css')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (l.includes('acc-engine') || (l.includes('adv-acc-body') && (l.includes('display') || l.includes('height') || l.includes('block') || l.includes('flex')))) {
          console.log(`${full}:${i + 1} ${l.trim()}`);
        }
      });
    }
  }
}

searchCss('css');
