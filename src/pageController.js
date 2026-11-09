// Page controller — maps view names to their init functions
// Called by router on every route change

import { initLoginPage } from './auth/login.js';
import { initRegisterPage } from './auth/register.js';
import { PLATFORM } from './config/platform.js';

// Lazy imports — only loaded when needed
const pageModules = {
    'account-confirm': () => import('./pages/accounts.autohub.js').then(m => m.initAutoHubAccountsPage('confirm')),
    'account-forgot': () => import('./pages/accounts.autohub.js').then(m => m.initAutoHubAccountsPage('forgot')),
    'account-reset': () => import('./pages/accounts.autohub.js').then(m => m.initAutoHubAccountsPage('reset')),
    onboarding: () => import('./pages/onboarding.autohub.js').then(m => m.initAutoHubOnboardingPage()),
    'business-onboarding': () => import('./pages/business-onboarding.autohub.js').then(m => m.initAutoHubBusinessOnboardingPage()),
    collections: () => import('./pages/collections.js').then(m => m.initCollectionsPage()),
    boards: () => import('./pages/boards.js').then(m => m.initBoardsPage()),
    'business-directory': () => import('./pages/business-directory.js').then(m => m.initBusinessDirectoryPage()),
    home: () => import('./pages/home.js').then(m => m.initHomePage()),
    oglasi: () => {
        if (window.PLATFORM_ID === 'navtika' || document.documentElement.dataset.platform === 'navtika' || (typeof PLATFORM !== 'undefined' && PLATFORM.id === 'navtika')) {
            return import('./pages/oglasi.navtika.js').then(m => m.initNavtikaOglasiPage());
        }
        return import('./pages/oglasi.js').then(m => m.initOglasiPage());
    },
    'advanced-search': () => {
        if (window.PLATFORM_ID === 'navtika' || document.documentElement.dataset.platform === 'navtika' || (typeof PLATFORM !== 'undefined' && PLATFORM.id === 'navtika')) {
            return import('./pages/advanced-search.navtika.js').then(m => m.initAdvancedSearchPage());
        }
        return import('./pages/advanced-search.js').then(m => m.initAdvancedSearchPage());
    },
    'advanced-search-auctions': () => {
        if (window.PLATFORM_ID === 'navtika' || document.documentElement.dataset.platform === 'navtika' || (typeof PLATFORM !== 'undefined' && PLATFORM.id === 'navtika')) {
            return import('./pages/advanced-search.navtika.js').then(m => m.initAdvancedSearchAuctionsPage());
        }
        return import('./pages/advanced-search.js').then(m => m.initAdvancedSearchAuctionsPage());
    },
    listing: () => {
        if (PLATFORM.id === 'navtika') {
            return import('./pages/listing.navtika.js').then(m => m.initNavtikaListingPage());
        }
        return import('./pages/listing.js').then(m => m.initListingPage());
    },
    drazbe: () => import('./pages/drazbe.js').then(m => m.initDrazbePage()),
    'auction-listing': () => import('./pages/auction-listing.js').then(m => m.initAuctionListingPage()),
    najem: () => import('./pages/najem.js').then(m => m.initNajemPage()),
    'advanced-search-rental': () => import('./pages/advanced-search-rental.js').then(m => m.initAdvancedSearchRentalPage()),
    'gume-in-deli': () => import('./pages/gume-in-deli.js').then(m => m.initGumeInDeliPage()),
    'catalog-product': () => import('./pages/catalog-product.js').then(m => m.initCatalogProductPage()),
    'create-listing': () => import('./pages/create-listing.js').then(m => m.initCreateListingPage()),
    dashboard: () => import('./pages/dashboard.js').then(m => m.initDashboardPage()),
    profile: () => import('./pages/profile.js').then(m => m.initProfilePage()),
    compare: () => import('./pages/compare.js').then(m => m.initComparePage()),
    evaluate: () => import('./pages/evaluate.js').then(m => m.initEvaluatePage()),
    login: () => initLoginPage(),
    register: () => initRegisterPage(),
    map: () => import('./pages/map.js').then(m => m.initMapPage()),
    'business-profile': () => import('./pages/business-profile.js').then(m => m.initBusinessProfilePage()),
    booking: () => import('./pages/booking.js').then(m => m.initBookingPage()),
    admin: () => import('./pages/admin.js').then(m => m.initAdminPage()),
    'service-entry': () => import('./pages/service-entry.js').then(m => m.initServiceEntryPage()),
    'tco-settings': () => import('./pages/tco-settings.js').then(m => m.initTCOSettingsPage()),

    // ── B2B Operating System ──
    'b2b-dashboard': () => import('./pages/b2b-dashboard.js').then(m => m.initB2bDashboardPage()),
    'b2b-reservations': () => import('./pages/b2b-reservations.js').then(m => m.initB2bReservationsPage()),
    'b2b-services': () => import('./pages/b2b-services.js').then(m => m.initB2bServicesPage()),
    'b2b-profile-editor': () => import('./pages/b2b-profile-editor.js').then(m => m.initB2bProfileEditorPage()),
    'b2b-inventory': () => import('./pages/b2b-inventory.js').then(m => m.initB2bInventoryPage()),
    'b2b-leads': () => import('./pages/b2b-leads.js').then(m => m.initB2bLeadsPage()),
    'b2b-workshop': () => import('./pages/b2b-workshop.js').then(m => m.initB2bWorkshopPage()),
    'b2b-tire-hotel': () => import('./pages/b2b-tire-hotel.js').then(m => m.initB2bTireHotelPage()),
    'bulk-import': () => import('./pages/bulk-import.js').then(m => m.initBulkImportPage()),
};

import { unmountAllReactRoots } from './core/reactRootTracker.js';

document.addEventListener('beforeRouteChange', () => {
    // Tear down oglasi subscriptions and React sidebar when navigating away
    unmountAllReactRoots();
    if (window._oglasiUnsubscribe) {
        window._oglasiUnsubscribe();
        delete window._oglasiUnsubscribe;
    }
    // Clear word slider timeout if active
    if (window._wordSliderTimeout) {
        clearTimeout(window._wordSliderTimeout);
        delete window._wordSliderTimeout;
    }
});

document.addEventListener('routeChanged', (e) => {
    const view = e.detail.view;

    const initFn = pageModules[view];
    if (initFn) {
        initFn().catch(err => console.error(`[PageController] Error initializing "${view}":`, err));
    }
});
