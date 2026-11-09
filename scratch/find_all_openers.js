import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.git') {
      searchDir(full);
    } else if (stat.isFile() && (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.html'))) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (
          (l.includes('aria-expanded') && l.includes('true')) ||
          (l.includes('adv-acc-body') && (l.includes('flex') || l.includes('block') || l.includes('display'))) ||
          (l.includes('adv-acc-trigger') && l.includes('click')) ||
          (l.includes('persistent-open')) ||
          (l.includes('acc-engine') && (l.includes('open') || l.includes('trigger') || l.includes('display')))
        ) {
          console.log(`${full}:${i+1} ${l.trim()}`);
        }
      });
    }
  }
}

searchDir('src');
searchDir('public');
