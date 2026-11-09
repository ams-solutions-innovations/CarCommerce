import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

function findSnippet(name, startPattern, endPattern) {
  const s = avto.search(startPattern);
  if (s === -1) {
    console.log(`[${name}] NOT FOUND`);
    return;
  }
  const sub = avto.slice(s);
  const e = sub.search(endPattern);
  console.log(`[${name}] at ${s}, length ${e}`);
  console.log('START:', sub.slice(0, 150).replace(/\n/g, ' '));
  console.log('END:', sub.slice(e - 150, e + 50).replace(/\n/g, ' '));
}

findSnippet('grid-motorbikes', /<div id="grid-motorbikes"/, /<div id="grid-commercial"/);
findSnippet('acc-engine', /<section class="card acc adv-accordion[^"]*" id="acc-engine"/, /<\/section>/);
findSnippet('acc-equipment', /<section class="card acc adv-accordion[^"]*" id="acc-equipment"/, /<\/section>/);
findSnippet('acc-location', /<section class="card acc adv-accordion[^"]*" id="acc-location"/, /<\/section>/);
findSnippet('acc-warranty', /<section class="card acc adv-accordion[^"]*" id="acc-warranty"/, /<\/section>/);
findSnippet('form-actions', /<div class="actions">/, /<\/form>/);
