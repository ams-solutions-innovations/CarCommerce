import fs from 'fs';

const files = [
  'public/views/advanced-search.html',
  'public/views/advanced-search.avto.html',
  'src/pages/advanced-search.js',
  'src/components/autohub/advancedSearch.js'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
      if (
        l.includes('acc-engine') ||
        l.includes('persistent-open') ||
        l.includes('aria-expanded="true"') ||
        l.includes('remember_') ||
        l.includes('acc-') ||
        l.includes('accordion')
      ) {
        console.log(`${f}:${i + 1} ${l.trim()}`);
      }
    });
  }
}
