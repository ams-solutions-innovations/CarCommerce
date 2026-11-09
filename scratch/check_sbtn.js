import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const sBtn = avto.indexOf('id="searchBtn"');
const fClose = avto.indexOf('</form>');
console.log('searchBtn index:', sBtn);
console.log('form close index:', fClose);
console.log('searchBtn before form close?', sBtn < fClose);
