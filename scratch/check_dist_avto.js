import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchDir(full);
    } else if (stat.isFile() && (f.endsWith('.js') || f.endsWith('.html'))) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('1024') && content.includes('index')) {
        console.log(`Found in dist-avto: ${full}`);
      }
    }
  }
}

if (fs.existsSync('dist-avto')) {
  searchDir('dist-avto');
} else {
  console.log('dist-avto does not exist');
}
