import fs from 'fs';

const c = fs.readFileSync('css/styles.css', 'utf8');
const lines = c.split('\n');
for (const lineNum of [3884, 7632]) {
  console.log(`\n=== Line ${lineNum} ===`);
  console.log(lines.slice(lineNum - 5, lineNum + 15).join('\n'));
}
