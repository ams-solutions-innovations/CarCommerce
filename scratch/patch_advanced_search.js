import fs from 'fs';

const path = 'src/pages/advanced-search.js';
let content = fs.readFileSync(path, 'utf8');

const target1 = `    function showSub() {
        mainGrid.style.display = 'none';
        subGrid.style.display = 'flex';
        if (header) header.style.display = 'flex';
        if (title) title.textContent = '4 in 3 Kolesna motorna vozila';
        if (window.lucide) window.lucide.createIcons();
    }

    function showMain() {
        subGrid.style.display = 'none';
        mainGrid.style.display = 'flex';
        if (header) header.style.display = 'none';`;

const replacement1 = `    function showSub() {
        mainGrid.style.display = 'none';
        subGrid.style.display = 'flex';
        subGrid.style.justifyContent = 'center';
        if (header) header.style.display = 'flex';
        if (title) title.textContent = '4 in 3 Kolesna motorna vozila';
        if (window.lucide) window.lucide.createIcons();
    }

    function showMain() {
        subGrid.style.display = 'none';
        mainGrid.style.display = 'flex';
        mainGrid.style.justifyContent = 'center';
        if (header) header.style.display = 'none';`;

content = content.replace(/\r\n/g, '\n');
const normalizedTarget1 = target1.replace(/\r\n/g, '\n');

if (!content.includes(normalizedTarget1)) {
  console.error('Target 1 not found!');
  process.exit(1);
}

content = content.replace(normalizedTarget1, replacement1);

const target2 = `    function renderVrste() {
        currentVrsta = null;
        selected.clear();
        if (header) header.style.display = 'none';`;

const replacement2 = `    function renderVrste() {
        currentVrsta = null;
        selected.clear();
        grid.style.display = 'flex';
        grid.style.justifyContent = 'center';
        if (header) header.style.display = 'none';`;

if (!content.includes(target2)) {
  console.error('Target 2 not found!');
  process.exit(1);
}
content = content.replace(target2, replacement2);

const target3 = `    function drillInto(key) {
        const vrsta = COMMERCIAL_BY_KEY[key];
        if (!vrsta) return;
        currentVrsta = key;
        selected.clear();
        if (header) header.style.display = 'flex';`;

const replacement3 = `    function drillInto(key) {
        const vrsta = COMMERCIAL_BY_KEY[key];
        if (!vrsta) return;
        currentVrsta = key;
        selected.clear();
        grid.style.display = 'flex';
        grid.style.justifyContent = 'center';
        if (header) header.style.display = 'flex';`;

if (!content.includes(target3)) {
  console.error('Target 3 not found!');
  process.exit(1);
}
content = content.replace(target3, replacement3);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched src/pages/advanced-search.js');
