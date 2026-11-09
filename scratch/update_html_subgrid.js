import fs from 'fs';

const files = ['public/views/advanced-search.html', 'public/views/advanced-search.avto.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'id="motoSubGrid" style="display:none;"',
    'id="motoSubGrid" style="display:none; justify-content:center;"'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
