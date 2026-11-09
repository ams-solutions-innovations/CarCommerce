import fs from 'fs';

const c = fs.readFileSync('scripts/import-autohub-rebrand.ps1', 'utf8');
console.log(c.slice(0, 1000));
