import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchDir(full);
    } else if (stat.isFile() && f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (l.includes('index < 2') || (l.includes('index <') && l.includes('open')) || (l.includes('acc') && l.includes('open'))) {
          console.log(`${full}:${i+1} ${l.trim()}`);
        }
      });
    }
  }
}

searchDir('src');
