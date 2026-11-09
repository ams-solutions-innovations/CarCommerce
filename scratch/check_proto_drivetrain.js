import fs from 'fs';
const proto = fs.readFileSync('C:/Users/marti/.gemini/antigravity/brain/9e49adeb-81e9-44c1-94b0-636a2ef8c545/.user_uploaded/media_1794230236112_39375186.html', 'utf8');

const s = proto.indexOf('Prenos moči');
if (s !== -1) {
  console.log(proto.slice(s - 50, s + 600));
}
