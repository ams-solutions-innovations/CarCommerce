import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

// List all top-level elements inside #advancedSearchForm
const formStart = avto.indexOf('<form id="advancedSearchForm"');
const formEnd = avto.indexOf('</form>');
console.log('formStart:', formStart, 'formEnd:', formEnd);

// Find all cards/sections inside form
const cardMatches = [...avto.matchAll(/<(div|section)[^>]*class="[^"]*card[^"]*"[^>]*id="([^"]+)"[^>]*>/g)];
console.log('Cards/sections in avto:');
cardMatches.forEach(m => console.log(m[0].slice(0, 80)));
