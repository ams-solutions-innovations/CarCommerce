import fs from 'fs';

const base = fs.readFileSync('public/views/advanced-search.html', 'utf8');
const searchContainerIdx = base.indexOf('<div class="search-container"');
const baseBody = base.slice(searchContainerIdx);
console.log('Search container start index in base:', searchContainerIdx);
console.log('Body length:', baseBody.length);
