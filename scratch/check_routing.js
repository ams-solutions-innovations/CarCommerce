import fs from 'fs';

for (const f of ['vite.config.js', 'package.json', 'src/pageController.js', 'main.js']) {
  if (fs.existsSync(f)) {
    console.log('=== ' + f + ' ===');
    const c = fs.readFileSync(f, 'utf8');
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('iskanje') || l.includes('advanced') || l.includes('views/')) {
        console.log(`${i + 1}: ${l}`);
      }
    });
  }
}
