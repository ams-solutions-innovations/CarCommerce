import fs from 'fs';

function cleanDefaults(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. moto-cylinders select: make sure value="" is selected
  content = content.replace(
    /<select name="cylinders" id="moto-cylinders"[^>]*>[\s\S]*?<\/select>/gi,
    `<select name="cylinders" id="moto-cylinders" style="display:none;" data-no-search="true">
        <option value="" selected>Valji</option>
        <option value="1">1 valj</option>
        <option value="2">2 valja</option>
        <option value="3">3 valji</option>
        <option value="4">4 valji</option>
        <option value="6">6 valjev</option>
        <option value="Wankel">Wankel</option>
    </select>`
  );

  // 2. motoCylChips: none active by default
  content = content.replace(
    /<div class="chips" id="motoCylChips">[\s\S]*?<\/div>/gi,
    `<div class="chips" id="motoCylChips">
        <button type="button" class="chip" data-cyl="1">1</button>
        <button type="button" class="chip" data-cyl="2">2</button>
        <button type="button" class="chip" data-cyl="3">3</button>
        <button type="button" class="chip" data-cyl="4">4</button>
        <button type="button" class="chip" data-cyl="6">6</button>
        <button type="button" class="chip" data-cyl="Wankel">Wankel</button>
    </div>`
  );

  // 3. motoDrivetrain: none checked by default
  content = content.replace(
    /<div class="chips" id="motoDrivetrainGroup">[\s\S]*?<\/div>/gi,
    `<div class="chips" id="motoDrivetrainGroup">
        <label class="chip">
            <input type="checkbox" name="motoDrivetrain" value="veriga">
            <i data-lucide="check" class="chk-icon" style="width:14px;height:14px;display:none;"></i>
            <span>Veriga</span>
        </label>
        <label class="chip">
            <input type="checkbox" name="motoDrivetrain" value="zobati jermen">
            <i data-lucide="check" class="chk-icon" style="width:14px;height:14px;display:none;"></i>
            <span>Zobati jermen</span>
        </label>
        <label class="chip">
            <input type="checkbox" name="motoDrivetrain" value="jekleni jermen">
            <i data-lucide="check" class="chk-icon" style="width:14px;height:14px;display:none;"></i>
            <span>Jekleni jermen</span>
        </label>
        <label class="chip">
            <input type="checkbox" name="motoDrivetrain" value="kardan">
            <i data-lucide="check" class="chk-icon" style="width:14px;height:14px;display:none;"></i>
            <span>Kardan</span>
        </label>
    </div>`
  );

  // 4. In acc-warranty trow: make ServiceBook off initially
  content = content.replace(
    /<button type="button" class="sw on" role="switch" aria-checked="true" aria-label="Servisna knjiga potrjena" style="margin-left:auto">\s*<input type="checkbox" name="history" value="ServiceBook" class="remember-check" checked style="position:absolute;inset:0;opacity:0;cursor:pointer;">\s*<\/button>/gi,
    `<button type="button" class="sw" role="switch" aria-checked="false" aria-label="Servisna knjiga potrjena" style="margin-left:auto">
        <input type="checkbox" name="history" value="ServiceBook" class="remember-check" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
    </button>`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Cleaned defaults in', filePath);
}

cleanDefaults('public/views/advanced-search.avto.html');
cleanDefaults('public/views/advanced-search.html');
