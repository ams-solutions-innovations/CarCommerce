const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/views/advanced-search.avto.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Remove chip checkmark svgs that were static in the mockup
html = html.replace(/<svg class="i" style="width:14px;height:14px"><use href="#i-check"><\/use><\/svg>/g, '');

// 2. Normalize chip classes
html = html.replace(/class="chip on sm"/g, 'class="chip sm"');
html = html.replace(/class="chip on"/g, 'class="chip"');

// 3. Remove .on from swatches and buttons
html = html.replace(/class="sw2 on"/g, 'class="sw2"');

// 4. Remove checked from input fields inside form (except if needed for default radio)
// We replace ' checked' in inputs inside chips and toggles
html = html.replace(/(<input[^>]+?)\s+checked(?=[^>]*>)/gi, '$1');

// 5. Restore default radio for damaged: Vsa vozila
html = html.replace(
    /<label class="seg-btn"><input type="radio" name="damaged" value="" style="display:none;"><button type="button">Vsa vozila<\/button><\/label>/,
    '<label class="seg-btn"><input type="radio" name="damaged" value="" checked style="display:none;"><button type="button" class="on">Vsa vozila</button></label>'
);
html = html.replace(
    /<label class="seg-btn"><input type="radio" name="damaged" value="exclude" style="display:none;"><button type="button" class="on">Brez poškodovanih<\/button><\/label>/,
    '<label class="seg-btn"><input type="radio" name="damaged" value="exclude" style="display:none;"><button type="button">Brez poškodovanih</button></label>'
);

// 6. Restore transmission segment to Vsi or default
html = html.replace(
    /<button type="button" class="on">Avtomatski<\/button>/,
    '<button type="button">Avtomatski</button>'
);
html = html.replace(
    /<label class="seg-btn"><input type="radio" name="transmission" value="" style="display:none;"><button type="button">Vsi<\/button><\/label>/,
    '<label class="seg-btn"><input type="radio" name="transmission" value="" checked style="display:none;"><button type="button" class="on">Vsi</button></label>'
);

// 7. Normalize remember toggles to off by default
html = html.replace(/class="rem on remember-toggle" role="switch" aria-checked="true"/g, 'class="rem remember-toggle" role="switch" aria-checked="false"');

// 8. Fix count badges in accordion headers to 0 by default
html = html.replace(/<span class="cnt"[^>]*>\d+<\/span>/g, '<span class="cnt">0</span>');

fs.writeFileSync(filePath, html, 'utf8');
console.log('Sanitized public/views/advanced-search.avto.html successfully!');
