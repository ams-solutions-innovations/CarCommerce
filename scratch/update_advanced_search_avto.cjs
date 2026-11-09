const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/views/advanced-search.avto.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove style="display:none;" from inputs inside label.chip, label.seg-btn, label.swt, and remember-check
content = content.replace(/<input\s+([^>]*?)style="display:none;"([^>]*?)>/gi, (match, p1, p2) => {
    // Keep hidden inputs hidden if they are type="hidden"
    if (p1.includes('type="hidden"') || p2.includes('type="hidden"')) {
        return match;
    }
    return `<input ${p1} ${p2}>`.replace(/\s+/g, ' ');
});

// 2. Remove data-category from <button class="rem remember-toggle"...> so it only exists on <input class="remember-check"...>
content = content.replace(/(<button\s+[^>]*?class="[^"]*rem[^"]*"[^>]*?)\s+data-category="[^"]*"/gi, '$1');

// 3. Ensure electric inputs (rangeKmFrom, batteryKwhFrom) are proper inputs
content = content.replace(
    /<input type="number" name="rangeKmFrom"[^>]*?>\s*<input type="number" name="batteryKwhFrom"[^>]*?>/gi,
    `<div class="sub-t">
        <svg class="i"><use href="#i-zap"></use></svg>
        <span>Električni pogon · vidno ob izbiri Elektrika ali Plug-in</span>
    </div>`
);

// If the slider section exists, ensure the text inputs are placed there
const wltpRegex = /(<div class="sl adv-slider" id="wltpSlider">[\s\S]*?<\/div>\s*<div class="tk">[\s\S]*?<\/div>)/gi;
if (!content.includes('name="rangeKmFrom"')) {
    content = content.replace(wltpRegex, `$1
    <div style="display:flex;gap:10px;margin-top:6px">
        <div style="flex:1">
            <div class="lbl">Domet od</div>
            <div class="fld num sm">
                <input type="number" name="rangeKmFrom" id="rangeKmFromInput" placeholder="0" value="" class="fld-raw">
                <span style="margin-left:auto;color:#5a6b83">km</span>
            </div>
        </div>
    </div>`);
}

const batteryRegex = /(<div class="sl adv-slider" id="batterySlider">[\s\S]*?<\/div>\s*<div class="tk">[\s\S]*?<\/div>)/gi;
if (!content.includes('name="batteryKwhFrom"')) {
    content = content.replace(batteryRegex, `$1
    <div style="display:flex;gap:10px;margin-top:6px">
        <div style="flex:1">
            <div class="lbl">Kapaciteta od</div>
            <div class="fld num sm">
                <input type="number" name="batteryKwhFrom" id="batteryKwhFromInput" placeholder="0" value="" class="fld-raw">
                <span style="margin-left:auto;color:#5a6b83">kWh</span>
            </div>
        </div>
    </div>`);
}

// 4. Ensure motorcycle fields (#advA2Toggle and name="motoDrivetrain") are present in acc-engine
if (!content.includes('id="advA2Toggle"')) {
    const motoFieldsHtml = `
                    <!-- Motorcycle Specific Fields -->
                    <div class="moto-only-field" style="display:none; margin-top:12px;">
                        <div class="fl">
                            <svg class="i"><use href="#nv-bike"></use></svg>
                            <span>A2 izpit</span>
                        </div>
                        <div class="unit-toggle-pill" id="advA2Toggle">
                            <button type="button" class="unit-btn active" data-a2="all">Vse</button>
                            <button type="button" class="unit-btn" data-a2="yes">Samo A2</button>
                        </div>
                        <input type="hidden" name="a2Eligible" id="a2EligibleInput" value="">
                    </div>

                    <div class="moto-only-field" style="display:none; margin-top:12px;">
                        <div class="fl">
                            <svg class="i"><use href="#i-gear"></use></svg>
                            <span>Prenos moči (motor)</span>
                        </div>
                        <div class="chips">
                            <label class="chip"><input type="checkbox" name="motoDrivetrain" value="veriga">Veriga</label>
                            <label class="chip"><input type="checkbox" name="motoDrivetrain" value="zobati jermen">Zobati jermen</label>
                            <label class="chip"><input type="checkbox" name="motoDrivetrain" value="jekleni jermen">Jekleni jermen</label>
                            <label class="chip"><input type="checkbox" name="motoDrivetrain" value="kardan">Kardan</label>
                        </div>
                    </div>
    `;
    content = content.replace(/<!-- Poraba goriva -->/i, motoFieldsHtml + '\n                    <!-- Poraba goriva -->');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated advanced-search.avto.html');
