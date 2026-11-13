// Wiring for the redesigned (static-markup) advanced search view.
// The page markup in public/views/advanced-search.avto.html ships with controls the
// main controller never learned about; this module makes them behave.
//   • "Zapomni" switches   – a checkbox nested in a <button> never receives the click
//   • "Vrsta vozila" / "Znamka in model" heading summaries – were hard-coded text
//   • Equipment groups     – "+ še N" expansion, live search, "N izbrano" counters

const EQ_VISIBLE = 6;

/** Re-apply chip visibility / counters for every equipment group inside `root`. */
export function layoutEquipment(root, query = '') {
    if (!root) return;
    const q = String(query || '').trim().toLowerCase();
    root.querySelectorAll('.eq').forEach(eq => {
        const chips = [...eq.querySelectorAll('.chips > label.chip')];
        const expanded = eq.classList.contains('is-expanded');
        let shown = 0;
        let hiddenCount = 0;
        chips.forEach((chip, index) => {
            const checked = !!chip.querySelector('input')?.checked;
            const matches = !q || chip.textContent.toLowerCase().includes(q);
            const visible = q ? matches : (expanded || index < EQ_VISIBLE || checked);
            chip.hidden = !visible;
            if (visible) shown++; else hiddenCount++;
        });
        const more = eq.querySelector('[data-eq-more]');
        if (more) {
            const needed = !q && chips.length > EQ_VISIBLE;
            more.hidden = !needed;
            more.textContent = expanded ? 'Pokaži manj' : `+ še ${hiddenCount}`;
            more.setAttribute('aria-expanded', String(expanded));
        }
        const selected = chips.filter(chip => chip.querySelector('input')?.checked).length;
        const badge = eq.querySelector('.eq-sel');
        if (badge) { badge.hidden = !selected; badge.textContent = `${selected} izbrano`; }
        eq.hidden = !!q && shown === 0;
        // Dividers sit between groups; hide the one that precedes a hidden group.
        const divider = eq.previousElementSibling;
        if (divider?.classList.contains('dv')) divider.hidden = eq.hidden;
    });
}

export function repairAdvancedSearchView(host) {
    if (!host || host.dataset.ahRepaired) return;
    host.dataset.ahRepaired = '1';
    const scope = host.querySelector?.('form') || host;

    // ── "Zapomni" switches ───────────────────────────────────────────────
    scope.addEventListener('click', event => {
        const toggle = event.target.closest('.remember-toggle');
        if (!toggle) return;
        const check = toggle.querySelector('.remember-check');
        if (!check) return;
        event.preventDefault();
        event.stopPropagation(); // the accordion header must not collapse
        check.checked = !check.checked;
        toggle.classList.toggle('on', check.checked);
        toggle.setAttribute('aria-checked', String(check.checked));
        check.dispatchEvent(new Event('change', { bubbles: true }));
    }, true);

    // ── Heading summaries ────────────────────────────────────────────────
    const bodySummary = scope.querySelector('#bodyTypeSummary');
    const brandSummary = scope.querySelector('#brandModelSummary');
    const syncBody = () => {
        if (!bodySummary) return;
        const names = [...scope.querySelectorAll('#group-bodyType .body-type-card.active .vn, #group-bodyType .body-type-card.active > span:last-child')]
            .map(el => el.textContent.trim()).filter(Boolean);
        bodySummary.textContent = names.length > 2 ? `${names.length} izbranih` : (names.join(', ') || 'Vse vrste');
    };
    const syncBrand = () => {
        if (!brandSummary) return;
        const added = scope.querySelectorAll('#vehicleCards .vehicle-entry-card').length;
        const excluded = scope.querySelectorAll('#excludedVehicleCards .vehicle-entry-card').length;
        brandSummary.textContent = `${added} dodano${excluded ? ` · ${excluded} izločeno` : ''} · največ 5`;
    };
    const watch = (selector, options, fn) => {
        const el = scope.querySelector(selector);
        if (el) new MutationObserver(fn).observe(el, options);
    };
    const checkedSummary = (summaryId, selector) => {
        const el = scope.querySelector(summaryId);
        if (!el) return;
        const sync = () => {
            const n = scope.querySelectorAll(`${selector}:checked`).length;
            el.textContent = n ? `${n} izbrano` : 'Vse';
        };
        scope.addEventListener('change', event => { if (event.target.matches?.(selector)) sync(); });
        sync();
    };
    checkedSummary('#fuelSummary', 'input[name="fuel"]');
    checkedSummary('#colorSummary', 'input[name="color"]');
    watch('#group-bodyType', { attributes: true, attributeFilter: ['class'], subtree: true }, syncBody);
    watch('#vehicleCards', { childList: true }, syncBrand);
    watch('#excludedVehicleCards', { childList: true }, syncBrand);
    syncBody();
    syncBrand();

    // ── Equipment groups ─────────────────────────────────────────────────
    const carRoot = scope.querySelector('#car-equipment-chips');
    const search = scope.querySelector('#equipmentSearchInput');
    if (carRoot) {
        const run = () => layoutEquipment(carRoot, search?.value);
        new MutationObserver(run).observe(carRoot, { childList: true });
        scope.addEventListener('click', event => {
            const more = event.target.closest('[data-eq-more]');
            if (!more || !carRoot.contains(more)) return;
            more.closest('.eq').classList.toggle('is-expanded');
            run();
        });
        scope.addEventListener('change', event => { if (event.target.name === 'features') run(); });
        search?.addEventListener('input', run);
        run();
    }
    const motoSearch = scope.querySelector('#equipmentSearchInputMoto');
    motoSearch?.addEventListener('input', () => {
        const q = motoSearch.value.trim().toLowerCase();
        scope.querySelectorAll('#moto-equipment-chips label').forEach(chip => {
            chip.hidden = !!q && !chip.textContent.toLowerCase().includes(q);
        });
    });
}
