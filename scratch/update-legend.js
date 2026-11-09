import fs from 'fs';

// Update oglasi.js
let oglasiJs = fs.readFileSync('src/pages/oglasi.js', 'utf8');
const targetJs = `    btn.addEventListener('click', openLegend);
    closeBtn?.addEventListener('click', closeLegend);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLegend(); });

    // Power unit buttons inside legend
    overlay.querySelectorAll('.power-unit-btn').forEach(puBtn => {
        puBtn.addEventListener('click', () => {
            applyPowerUnit(puBtn.dataset.unit);
        });
    });

    // Clicking the power toggle label also toggles
    document.getElementById('powerToggleLabel')?.addEventListener('click', () => {
        applyPowerUnit(currentPowerUnit === 'kw' ? 'km' : 'kw');
    });`;

const replaceJs = `    btn.addEventListener('click', openLegend);
    closeBtn?.addEventListener('click', closeLegend);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLegend(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeLegend();
    });

    // Power unit buttons inside legend
    overlay.querySelectorAll('.power-unit-btn').forEach(puBtn => {
        puBtn.addEventListener('click', () => {
            applyPowerUnit(puBtn.dataset.unit);
        });
    });

    // Clicking the power toggle label also toggles
    const powerToggleEl = document.getElementById('powerToggleLabelPill') || document.getElementById('powerToggleLabel');
    powerToggleEl?.addEventListener('click', () => {
        applyPowerUnit(currentPowerUnit === 'kw' ? 'km' : 'kw');
    });`;

const normalize = s => s.replace(/\r\n/g, '\n');
if (normalize(oglasiJs).includes(normalize(targetJs))) {
    const isCrlf = oglasiJs.includes('\r\n');
    oglasiJs = normalize(oglasiJs).replace(normalize(targetJs), normalize(replaceJs));
    if (isCrlf) oglasiJs = oglasiJs.replace(/\n/g, '\r\n');
    fs.writeFileSync('src/pages/oglasi.js', oglasiJs, 'utf8');
    console.log('Successfully updated oglasi.js');
} else {
    console.error('Target not found in oglasi.js');
}

// Update drazbe.js
let drazbeJs = fs.readFileSync('src/pages/drazbe.js', 'utf8');
const targetDrazbe = `        legendCloseBtn?.addEventListener('click', closeLegend);
        legendOverlay.addEventListener('click', e => { if (e.target === legendOverlay) closeLegend(); });`;
const replaceDrazbe = `        legendCloseBtn?.addEventListener('click', closeLegend);
        legendOverlay.addEventListener('click', e => { if (e.target === legendOverlay) closeLegend(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && legendOverlay.classList.contains('active')) closeLegend();
        });`;

if (normalize(drazbeJs).includes(normalize(targetDrazbe))) {
    const isCrlf = drazbeJs.includes('\r\n');
    drazbeJs = normalize(drazbeJs).replace(normalize(targetDrazbe), normalize(replaceDrazbe));
    if (isCrlf) drazbeJs = drazbeJs.replace(/\n/g, '\r\n');
    fs.writeFileSync('src/pages/drazbe.js', drazbeJs, 'utf8');
    console.log('Successfully updated drazbe.js');
} else {
    console.error('Target not found in drazbe.js');
}
