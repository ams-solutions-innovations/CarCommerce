import fs from 'fs';

const c = fs.readFileSync('css/styles.css', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.adv-accordion') || l.includes('.adv-acc-body') || l.includes('#acc-engine') || l.includes('.persistent-open')) {
    console.log(`${i+1}: ${l}`);
  }
});
