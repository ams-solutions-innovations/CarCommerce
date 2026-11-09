import fs from 'fs';
import path from 'path';

function searchHtml(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.git') {
      searchHtml(full);
    } else if (stat.isFile() && f.endsWith('.html')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('acc-engine')) {
        const lines = content.split('\n');
        lines.forEach((l, i) => {
          if (l.includes('acc-engine') || (l.includes('aria-expanded') && i > 0 && lines[i-1].includes('acc-engine'))) {
            console.log(`${full}:${i+1} ${l.trim()}`);
          }
        });
      }
    }
  }
}

searchHtml('.');
