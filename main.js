// Main entry point — platform-aware (Carcommerce / MojaNavtika.si)
import { initI18n, translatePage } from './src/core/i18n.js';
import { reloadCurrentView } from './src/router.js';
import './src/pageController.js';
import { onAuth } from './src/auth/auth.js';
import { initHeader } from './src/components/header.js';
import { bindB2BContext, onB2BChange } from './src/core/b2bContext.js';
import { registerDefaultExtensions } from './src/core/extensions.js';
import { PLATFORM } from './src/config/platform.js';
import { initMonitoring, setMonitoringUser } from './src/lib/monitoring.js';
import './src/index.css';
import autoHubStylesheetUrl from './css/autohub.css?url';
import autoHubWorkspaceStylesheetUrl from './css/autohub-workspace.css?url';
import autoHubPartsStylesheetUrl from './css/autohub-parts.css?url';
import autoHubVehicleStylesheetUrl from './css/autohub-vehicles.css?url';
import autoHubAccountStylesheetUrl from './css/autohub-accounts.css?url';
import autoHubSellerStylesheetUrl from './css/autohub-seller.css?url';
import autoHubDashboardStylesheetUrl from './css/autohub-dashboard.css?url';
import autoHubSearchStylesheetUrl from './css/autohub-search.css?url';
import autoHubDetailStylesheetUrl from './css/autohub-detail.css?url';
import autoHubMobileStylesheetUrl from './css/autohub-mobile.css?url';
import { initResponsiveViewport } from './src/components/autohub/responsive.js';

// Hijack window.fetch to automatically prefix absolute resource fetches with the base path
const originalFetch = window.fetch;
window.fetch = function (resource, options) {
    let urlStr = null;
    if (typeof resource === 'string') urlStr = resource;
    else if (resource instanceof URL) urlStr = resource.pathname + resource.search + resource.hash;
    
    if (urlStr && urlStr.startsWith('/') && !urlStr.startsWith('//')) {
        const base = import.meta.env.BASE_URL;
        if (base !== '/') {
            const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
            const newUrl = `${cleanBase}${urlStr}`;
            
            if (resource instanceof URL) {
                resource = new URL(newUrl, window.location.origin);
            } else if (typeof resource === 'string') {
                resource = newUrl;
            }
        }
    }
    return originalFetch.call(this, resource, options);
};

// Global click interceptor for SPA routing
document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    const a = e.target.closest('a');
    if (!a) return;
    
    if (a.target === '_blank' || a.hasAttribute('download') || a.hostname !== window.location.hostname) {
        return;
    }
    
    const href = a.getAttribute('href');
    if (!href) return;
    
    if (href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault();
        import('./src/router.js').then(m => m.navigateTo(href));
        return;
    }

    // Legacy hash-style links ("#/b2b/storitve") from the pre-History-API router:
    // translate them to real paths so they navigate instead of doing nothing.
    if (href.startsWith('#/')) {
        e.preventDefault();
        import('./src/router.js').then(m => m.navigateTo(href.slice(1)));
    }
});

// Initialize monitoring (Sentry + PostHog) — non-blocking, runs in background.
initMonitoring();

// Apply platform brand colors + document title before first paint.
applyPlatformBranding();
if (PLATFORM.id === 'avto') initResponsiveViewport();

// Restore saved theme before any render to avoid flash
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// Initialize translations
await initI18n();

// Register B2B extension registry (once)
registerDefaultExtensions();

// Boot header (persists across route changes)
initHeader();

// Boot footer
fetch('views/footer.html')
    .then(r => r.text())
    .then(html => {
        const footerEl = document.getElementById('footer');
        if (footerEl) {
            let htmlText = html;
            const base = import.meta.env.BASE_URL;
            if (base !== '/') {
                const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
                htmlText = htmlText
                    .replaceAll('href="/icons/', `href="${cleanBase}/icons/`)
                    .replaceAll('src="/images/', `src="${cleanBase}/images/`);
            }
            footerEl.innerHTML = htmlText;
            translatePage(footerEl);
            applyPlatformFooter(footerEl);
        }
    })
    .catch(err => console.error("Error loading footer:", err));

// When the language changes, re-render the current view so JS-built views (which
// call t() at render time, not via data-i18n-key) pick up the new strings.
// The header and footer re-translate themselves via their own langChanged hooks.
document.addEventListener('langChanged', () => {
    reloadCurrentView();
    // Re-apply the footer's translatable strings (footer is outside the router view)
    const footerEl = document.getElementById('footer');
    if (footerEl) translatePage(footerEl);
});


// Track auth state globally so views can use it
window.__authReady = new Promise(resolve => {
    onAuth(user => {
        // Compatibility shim: pages written against the Firebase user shape read
        // `.uid` / `.displayName`; a raw Supabase user only has `.id` / user_metadata.
        if (user) {
            if (!user.uid) user.uid = user.id;
            if (!user.displayName) user.displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || '';
        }
        window.__currentUser = user || null;
        bindB2BContext(user);
        setMonitoringUser(user);
        resolve(user);
    });
});

// After auth resolves, offer to resume any abandoned transaction (auction
// payment, half-filled listing draft, or unfinished plan upgrade).
window.__authReady.then(() => {
    import('./src/utils/abandonment.js')
        .then(m => m.promptResume())
        .catch(() => { /* non-critical */ });
});

// Keep <body> class in sync with B2B mode so CSS can adapt globally
onB2BChange(profile => {
    const isBiz = profile?.sellerType === 'business';
    document.body.classList.toggle('is-b2b', isBiz);
});

// ── Platform branding ──────────────────────────────────────────────────────────
// Override the brand color CSS variables and document title from the active
// PLATFORM. styles.css :root holds the Carcommerce defaults; this re-points them.
// On the navtika build it ALSO loads css/styles.navtika.css — the navtika-only
// stylesheet that Carcommerce never fetches. Edits to that file can never affect
// Carcommerce.
function applyPlatformBranding() {
    const root = document.documentElement;
    const c = PLATFORM.colors;
    root.style.setProperty('--color-primary-start', c.primaryStart);
    root.style.setProperty('--color-primary-end', c.primaryEnd);
    root.style.setProperty('--logo-accent', c.logoAccent);
    document.body?.classList.add(`platform-${PLATFORM.id}`);
    loadPlatformStylesheet();
    // Document title is also localized per-route by pageController; this is the
    // initial/default title before the first route resolves.
    document.title = `${PLATFORM.brandName}${PLATFORM.tld}`;
}

// Load the active platform's dedicated stylesheet, if it has one. Only navtika
// ships one today (css/styles.navtika.css); Carcommerce's styles live in styles.css.
// Added to <head> so it overrides styles.css cascade order and loads before paint.
function loadPlatformStylesheet() {
    const stylesheets = PLATFORM.id === 'avto' ? [autoHubStylesheetUrl,autoHubWorkspaceStylesheetUrl,autoHubPartsStylesheetUrl,autoHubVehicleStylesheetUrl,autoHubAccountStylesheetUrl,autoHubSellerStylesheetUrl,autoHubDashboardStylesheetUrl,autoHubSearchStylesheetUrl,autoHubDetailStylesheetUrl,autoHubMobileStylesheetUrl] : ['css/styles.navtika.css'];
    for (const href of stylesheets) {
    if (document.querySelector(`link[href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    }
}

// Fill the brand-specific bits of the footer from the active PLATFORM.
function applyPlatformFooter(footerEl) {
    if (PLATFORM.id === 'avto') footerEl.querySelectorAll('.footer-col').forEach((column,index) => {
        const title = column.querySelector('.footer-col-title');
        const content = column.querySelector('ul,address');
        if (!title || !content) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ah-footer-toggle';
        button.textContent = title.textContent;
        button.dataset.i18nKey = title.dataset.i18nKey;
        content.id = `ah-footer-section-${index}`;
        button.setAttribute('aria-controls',content.id);
        button.setAttribute('aria-expanded','false');
        button.addEventListener('click',() => button.setAttribute('aria-expanded',String(button.getAttribute('aria-expanded') !== 'true')));
        title.after(button);
    });
    const set = (id, fn) => { const el = footerEl.querySelector('#' + id); if (el) fn(el); };
    set('footerLogo', el => { el.innerHTML = `${PLATFORM.brandName}<span class="logo-accent">${PLATFORM.tld}</span>`; });
    set('footerCompanyName', el => { el.textContent = PLATFORM.company.name; });
    set('footerTaxNo', el => { el.textContent = PLATFORM.company.taxNo; });
    set('footerRegNo', el => { el.textContent = PLATFORM.company.regNo; });
    set('footerEmail', el => { el.textContent = PLATFORM.company.email; el.href = `mailto:${PLATFORM.company.email}`; });
    set('footerCopyrightBrand', el => { el.textContent = `${PLATFORM.brandName}${PLATFORM.tld}`; });
    // Cross-promo link to the sibling portal (Carcommerce ⇄ MojaNavtika) — rendered as logo emblem.
    set('footerSibling', el => {
        el.href = PLATFORM.siblingUrl;
        const [name, tld] = PLATFORM.siblingName.split('.');
        el.innerHTML = `
            <span class="footer-sibling-logo" aria-label="${PLATFORM.siblingName}">
                <span class="footer-sibling-wordmark">${name}</span><span class="footer-sibling-tld">.${tld}</span>
            </span>`;
        el.style.display = '';
        el.setAttribute('title', PLATFORM.siblingName);
        el.setAttribute('aria-label', `Obiščite ${PLATFORM.siblingName}`);
    });
}
