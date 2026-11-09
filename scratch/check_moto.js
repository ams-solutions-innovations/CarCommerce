const fs = require('fs');
const html = fs.readFileSync('C:/Users/marti/.gemini/antigravity/brain/9e49adeb-81e9-44c1-94b0-636a2ef8c545/.user_uploaded/media_1794230236112_39375186.html', 'utf8');
const start = html.indexOf('aria-label="Oprema"');
const end = html.indexOf('aria-label="Ponudnik in lokacija"');
console.log(html.substring(start, end));
