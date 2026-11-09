import fs from 'fs';
const avto = fs.readFileSync('public/views/advanced-search.avto.html', 'utf8');

const checks = [
  ['advStickyBar', avto.includes('id="advStickyBar"')],
  ['advStickySubmit', avto.includes('id="advStickySubmit"')],
  ['motoMainGrid', avto.includes('id="motoMainGrid"')],
  ['motoSubGrid', avto.includes('id="motoSubGrid"')],
  ['motoBackBtn', avto.includes('id="motoBackBtn"')],
  ['advA2Toggle', avto.includes('id="advA2Toggle"')],
  ['a2 data-a2="yes"', avto.includes('data-a2="yes"')],
  ['[name="powerTo"]', avto.includes('name="powerTo"')],
  ['[name="motoDrivetrain"]', avto.includes('name="motoDrivetrain"')],
  ['motoCylChips', avto.includes('id="motoCylChips"')],
  ['motoLayoutChips', avto.includes('id="motoLayoutChips"')],
  ['wltpSlider', avto.includes('id="wltpSlider"')],
  ['batterySlider', avto.includes('id="batterySlider"')],
  ['rangeKmFrom', avto.includes('name="rangeKmFrom"')],
  ['batteryKwhFrom', avto.includes('name="batteryKwhFrom"')],
  ['vehicleCards', avto.includes('id="vehicleCards"')],
  ['addVehicleBtn', avto.includes('id="addVehicleBtn"')],
  ['searchBtn', avto.includes('id="searchBtn"')],
  ['searchBtnText', avto.includes('id="searchBtnText"')],
  ['resetBtn', avto.includes('id="resetBtn"')],
  ['quickCityChips', avto.includes('id="quickCityChips"')],
  ['trow cards', avto.includes('class="trow"')],
  ['sport-exhaust-check', avto.includes('id="sport-exhaust-check"')],
  ['imu-trigger-checkbox', avto.includes('id="imu-trigger-checkbox"')],
];

let allPassed = true;
checks.forEach(([name, pass]) => {
  console.log(`${pass ? '✓' : '✗'} ${name}`);
  if (!pass) allPassed = false;
});
console.log('ALL PASSED:', allPassed);
