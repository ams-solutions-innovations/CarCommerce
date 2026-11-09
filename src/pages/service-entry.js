// Service Entry Page — for verified mechanics / B2B users
import { supabase } from '../lib/supabase.js';
import { addServiceRecord, listRecordsByMechanic, deleteServiceRecord } from '../services/serviceBookService.js';
import { mountB2BShell } from '../layouts/b2b-layout.js';
import { getB2BProfile, hasRole, fetchB2BProfile } from '../core/b2bContext.js';
import { t } from '../core/i18n.js';

function getServiceTypes() {
    return [
        { value: 'mali_servis',    label: t('st_minor', 'Mali servis') },
        { value: 'veliki_servis',  label: t('st_major', 'Veliki servis') },
        { value: 'popravilo',      label: t('st_repair', 'Popravilo') },
        { value: 'pnevmatike',     label: t('st_tires', 'Pnevmatike') },
        { value: 'drugo',          label: t('st_other', 'Drugo') },
    ];
}

function isAuthorized(user) {
    if (!user) return false;
    const profile = getB2BProfile() || window.__currentUserProfile || {};
    return (
        profile.businessTier === 'verified' ||
        hasRole('mechanic') ||
        profile.role === 'mechanic' ||
        user.email?.endsWith('@mojavto.si')
    );
}

export async function initServiceEntryPage() {
    let page = document.getElementById('service-entry-page');
    if (!page) return;

    // /b2b/servis-vnos renders inside the B2B shell (sidebar + topbar);
    // /servis/vnos keeps the plain standalone layout.
    if (/\/b2b\/servis-vnos\/?$/.test(window.location.pathname)) {
        const main = mountB2BShell({ activeRoute: '/b2b/servis-vnos', title: t('service_entry_title', 'Vnos v digitalno servisno knjižico') });
        if (!main) return;
        page = document.createElement('div');
        page.id = 'service-entry-page';
        main.appendChild(page);
    }

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (user) await fetchB2BProfile(user); // roles/tier must be loaded before the access check
    if (!isAuthorized(user)) {
        renderAccessDenied(page);
    } else {
        renderForm(page, user);
    }
}

function renderAccessDenied(page) {
    page.innerHTML = `
        <div style="max-width:480px;margin:4rem auto;text-align:center;padding:2rem;">
            <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
            <h2 style="font-size:1.3rem;font-weight:800;color:#1e293b;margin:0 0 0.5rem;">${t('access_denied_title', 'Dostop zavrnjen')}</h2>
            <p style="color:#64748b;margin:0 0 1.5rem;">${t('access_denied_mechanic', 'Ta stran je dostopna le verificiranim delavnicam in serviserjem.')}</p>
            <a href="/dashboard" style="display:inline-block;padding:0.7rem 1.5rem;background:var(--color-primary-start);color:#fff;border-radius:0.75rem;text-decoration:none;font-weight:600;">${t('back_to_dashboard', '← Nazaj na nadzorno ploščo')}</a>
        </div>`;
}

function renderForm(page, user) {
    const typeOptions = getServiceTypes().map(item =>
        `<option value="${item.value}">${item.label}</option>`
    ).join('');

    page.innerHTML = `
        <div class="se-container">
            <div class="se-card glass-card">
                <div class="se-card-header">
                    <i data-lucide="wrench"></i>
                    <h1 class="se-title">${t('service_entry_title', 'Vnos v digitalno servisno knjižico')}</h1>
                </div>
                <p class="se-subtitle">${t('service_entry_subtitle', 'Vneseni podatki se trajno povežejo z VIN številko vozila.')}</p>

                <form id="serviceEntryForm" class="se-form" novalidate>
                    <div class="se-field">
                        <label for="se-vin">${t('service_vin_label', 'VIN številka')} <span class="se-required">*</span></label>
                        <input id="se-vin" type="text" maxlength="17" placeholder="npr. WBA3A5G59DNP26082" required />
                    </div>
                    <div class="se-row">
                        <div class="se-field">
                            <label for="se-date">${t('service_date_label', 'Datum servisa')} <span class="se-required">*</span></label>
                            <input id="se-date" type="date" required />
                        </div>
                        <div class="se-field">
                            <label for="se-mileage">${t('service_mileage_label', 'Stanje števca (km)')}</label>
                            <input id="se-mileage" type="number" min="0" placeholder="npr. 125000" />
                        </div>
                    </div>
                    <div class="se-field">
                        <label for="se-type">${t('service_type_label', 'Vrsta servisa')} <span class="se-required">*</span></label>
                        <select id="se-type" required>
                            ${typeOptions}
                        </select>
                    </div>
                    <div class="se-field">
                        <label for="se-desc">${t('service_desc_label', 'Opis opravljenih del')}</label>
                        <textarea id="se-desc" rows="4" placeholder="${t('service_desc_placeholder', 'Menjava olja, filtri, pregled zavor...')}"></textarea>
                    </div>
                    <div id="se-error" class="se-error" style="display:none;"></div>
                    <button type="submit" class="se-submit-btn" id="seSubmitBtn">
                        <i data-lucide="save"></i>
                        ${t('service_save_record', 'Shrani vnos')}
                    </button>
                </form>

                <div id="se-toast" class="se-toast" style="display:none;"></div>
            </div>

            <div class="se-card glass-card" style="margin-top:1.25rem;">
                <div class="se-card-header">
                    <i data-lucide="history"></i>
                    <h2 class="se-title" style="font-size:1.1rem;">${t('service_my_entries', 'Moji zadnji vnosi')}</h2>
                </div>
                <div id="se-history"><p class="se-subtitle">${t('loading', 'Nalagam…')}</p></div>
            </div>
        </div>`;

    if (window.lucide) window.lucide.createIcons();

    loadHistory(user.id);

    const form = document.getElementById('serviceEntryForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('seSubmitBtn');
        const errorEl = document.getElementById('se-error');
        const vin = document.getElementById('se-vin').value.trim();
        const date = document.getElementById('se-date').value;
        const mileage = document.getElementById('se-mileage').value;
        const serviceType = document.getElementById('se-type').value;
        const description = document.getElementById('se-desc').value.trim();

        errorEl.style.display = 'none';

        if (!vin) { showError(errorEl, t('service_err_vin_req', 'VIN številka je obvezna.')); return; }
        if (vin.length < 5) { showError(errorEl, t('service_err_vin_short', 'VIN številka mora imeti vsaj 5 znakov.')); return; }
        if (!date) { showError(errorEl, t('service_err_date_req', 'Datum servisa je obvezen.')); return; }

        btn.disabled = true;
        btn.textContent = t('service_saving', 'Shranjevanje...');

        try {
            await addServiceRecord({
                vin,
                date,
                mileage: mileage || null,
                serviceType,
                description,
                mechanicId: user.id,
                mechanicName: user.user_metadata?.display_name || user.email || 'Service',
            });
            showToast(t('service_toast_success', '✅ Vnos uspešno shranjen!'));
            form.reset();
            loadHistory(user.id);
        } catch (err) {
            console.error('[ServiceEntry]', err);
            showError(errorEl, t('service_err_generic', 'Prišlo je do napake. Prosimo, poskusite znova.'));
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="save"></i> ${t('service_save_record', 'Shrani vnos')}`;
            if (window.lucide) window.lucide.createIcons();
        }
    });
}

function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
}

function showToast(msg) {
    const toast = document.getElementById('se-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function loadHistory(mechanicId) {
    const root = document.getElementById('se-history');
    if (!root) return;
    const typeLabel = Object.fromEntries(getServiceTypes().map(x => [x.value, x.label]));
    try {
        const rows = await listRecordsByMechanic(mechanicId);
        if (!rows.length) {
            root.innerHTML = `<p class="se-subtitle">${t('service_no_entries', 'Še nimate vnosov.')}</p>`;
            return;
        }
        root.innerHTML = `
            <div style="overflow-x:auto;">
            <table class="b2b-table" style="width:100%;">
                <thead><tr><th>VIN</th><th>${t('service_date_label', 'Datum servisa')}</th><th>${t('service_type_label', 'Vrsta servisa')}</th><th>km</th><th></th></tr></thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            <td><code>${esc(r.vin)}</code></td>
                            <td>${esc(r.date || '—')}</td>
                            <td>
                                ${esc(typeLabel[r.serviceType] || r.serviceType || '—')}
                                ${r.description ? `<div class="b2b-cell-sub">${esc(r.description)}</div>` : ''}
                            </td>
                            <td>${r.mileage != null ? esc(Number(r.mileage).toLocaleString('sl-SI')) : '—'}</td>
                            <td><button type="button" class="b2b-icon-btn danger" data-del-record="${esc(r.id)}" title="${t('delete', 'Izbriši')}"><i data-lucide="trash-2"></i></button></td>
                        </tr>`).join('')}
                </tbody>
            </table>
            </div>`;
        root.querySelectorAll('[data-del-record]').forEach(btn => btn.addEventListener('click', async () => {
            if (!confirm(t('service_delete_confirm', 'Izbrisati ta vnos iz servisne knjižice?'))) return;
            btn.disabled = true;
            try { await deleteServiceRecord(btn.dataset.delRecord); await loadHistory(mechanicId); }
            catch (err) { alert(err.message); btn.disabled = false; }
        }));
        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('[ServiceEntry] history', err);
        root.innerHTML = `<p class="se-subtitle">${t('service_err_generic', 'Prišlo je do napake. Prosimo, poskusite znova.')}</p>`;
    }
}
