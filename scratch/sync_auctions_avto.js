import fs from 'fs';

const avtoHtml = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

let auctionsHtml = avtoHtml.replace(
  '<div class="search-container" style="max-width:1060px; margin:3rem auto; padding:0 1rem;">',
  '<div class="search-container" data-search-kind="auctions" style="max-width:1060px; margin:3rem auto; padding:0 1rem;">'
);

auctionsHtml = auctionsHtml.replace(
  /data-category="([a-zA-Z0-9_-]+)"/g,
  (match, p1) => `data-category="drazba_${p1}"`
);

fs.writeFileSync('public/views/advanced-search-auctions.avto.html', auctionsHtml, 'utf8');
console.log('Successfully generated public/views/advanced-search-auctions.avto.html');
