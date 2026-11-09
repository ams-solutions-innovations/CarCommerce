import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.git' && f !== 'dist-avto' && f !== 'dist-navtika' && f !== 'dist') {
      searchDir(full);
    } else if (stat.isFile() && (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.html'))) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (l.includes('hiddenNajem') || l.includes('rentalModeToggle') || l.includes('najem=1') || l.includes('hasRentalToggle')) {
          console.log(`${full}:${i+1} ${l.trim()}`);
        }
      });
    }
  }
}

searchDir('src');
searchDir('public');
