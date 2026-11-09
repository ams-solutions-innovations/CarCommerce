import fs from 'fs';

let content = fs.readFileSync('src/pages/advanced-search.navtika.js', 'utf8');
const target = "        const isPersistent = acc.classList.contains('persistent-open');\r\n        const body = acc.querySelector('.adv-acc-body');";
const replacement = `        const isPersistent = acc.classList.contains('persistent-open');
        const body = acc.querySelector('.adv-acc-body');

        // Only persistent accordions (Osnovni podatki) start open by default
        if (isPersistent) {
            trig.setAttribute('aria-expanded', 'true');
            acc.setAttribute('aria-expanded', 'true');
            if (body) body.style.display = 'flex';
        } else {
            trig.setAttribute('aria-expanded', 'false');
            acc.setAttribute('aria-expanded', 'false');
            if (body) body.style.display = 'none';
        }`.replace(/\n/g, '\r\n');

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/advanced-search.navtika.js', content, 'utf8');
  console.log('Successfully updated advanced-search.navtika.js');
} else {
  console.log('Target not found in advanced-search.navtika.js');
}
