import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.git' && f !== 'dist-avto' && f !== 'dist') {
      searchDir(full);
    } else if (stat.isFile() && f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('views/')) {
        console.log(`${full}: includes views/`);
      }
    }
  }
}

searchDir('src');
