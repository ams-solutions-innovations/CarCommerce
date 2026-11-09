import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const forms = [...avto.matchAll(/<\/form>/gi)];
console.log('Number of </form> tags:', forms.length);
forms.forEach(f => console.log('at index', f.index));

const formStarts = [...avto.matchAll(/<form/gi)];
console.log('Number of <form> tags:', formStarts.length);
formStarts.forEach(f => console.log('at index', f.index));
