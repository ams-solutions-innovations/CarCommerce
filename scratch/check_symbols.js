import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');
const proto = fs.readFileSync('C:/Users/marti/.gemini/antigravity/brain/9e49adeb-81e9-44c1-94b0-636a2ef8c545/.user_uploaded/media_1794230236112_39375186.html', 'utf8');

const avtoSymbols = new Set([...avto.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const protoSymbols = [...proto.matchAll(/<symbol[^>]*id="([^"]+)"/g)].map(m => m[1]);

const missingSymbols = protoSymbols.filter(s => !avtoSymbols.has(s));
console.log('Missing symbols in avto:', missingSymbols);
