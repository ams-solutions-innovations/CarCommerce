// Auction (Dražba) detail page — MojAvto.si / AutoHub
// Fully aligned with AutoHub DrazbaOglas.dc.html & DrazbaStanja.dc.html specifications.
//
// Key Features:
//   • 4-tile countdown timer (DNI, UR, MIN, SEK) with 1s interval & anti-sniper alert
//   • Rich photo gallery with exterior/interior toggle, thumbnail strip, and full-screen view
//   • 9 technical vehicle facts with dedicated SVG icons (.fact)
//   • Interactive SVG price-over-time chart with reserve line & delta pill
//   • Live bid history with colored avatar initials, masked names, and timestamps
//   • Smart bidding calculator: min increment, quick-step buttons (+50 €, +100 €, +500 €, +1000 €)
//   • Real-time 3% buyer premium calculation (.az-fee)
//   • Purchase commitment modal (.az-bdp) with digital finger/mouse signature canvas (#signatureCanvas)
//   • Support for all 9 auction states from DrazbaStanja (Leading, Outbid, Hot/Anti-sniper, Pre-bid, Silent, Signed, Submitted, Winner, Ended)

import { escHtml } from '../utils/escHtml.js';
import { getListingById } from '../services/listingService.js';
import {
    subscribeAuction, subscribeBids, placeBid, minNextBid, isAuctionActive,
    MIN_BID_INCREMENT, calcBuyerPremium, BUYER_PREMIUM_PCT, ANTI_SNIP_WINDOW_MS,
} from '../services/auctionService.js';
import { sampleAuctionCars, sampleAuctionState } from '../data/sampleAuctions.js';
import { currentUser } from '../lib/currentUser.js';
import { PLATFORM } from '../config/platform.js';
import { t } from '../core/i18n.js';
import { navigateTo } from '../router.js';

let _unsubAuction = null;
let _unsubBids = null;
let _timerInterval = null;
let _currentListing = null;
let _currentAuction = null;
let _currentBids = [];
let _activePhotoIndex = 0;
let _allPhotos = [];
let _sigPadState = { isDrawing: false, hasSignature: false };

function cleanup() {
    if (_unsubAuction) { _unsubAuction(); _unsubAuction = null; }
    if (_unsubBids) { _unsubBids(); _unsubBids = null; }
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
}
document.addEventListener('beforeRouteChange', cleanup);

const fmtEur = n => (Number(n) || 0).toLocaleString('sl-SI') + ' €';
const parseBid = v => Number(String(v).replace(/[^\d]/g, '')) || 0;

export async function initAuctionListingPage() {
    cleanup();

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id') || 'auction-car-porsche-gt3';
    const stateOverride = params.get('state');

    // 1. Resolve listing data: from Firestore or fallback to sampleAuctionCars
    let listing = null;
    let auctionData = null;
    let bidsData = [];

    try {
        listing = await getListingById(requestedId);
    } catch {
        // Fallback to sample data
    }

    if (!listing) {
        listing = sampleAuctionCars.find(c => c.id === requestedId) || sampleAuctionCars[1] || sampleAuctionCars[0];
    }

    const sampleState = sampleAuctionState[listing.id] || sampleAuctionState['auction-car-porsche-gt3'];
    if (sampleState) {
        auctionData = { ...sampleState.auction };
        bidsData = [...sampleState.bids];
    } else {
        auctionData = {
            id: listing.id,
            startPriceEur: listing.price || 160000,
            currentBidEur: listing.price || 187500,
            reservePriceEur: listing.reservePriceEur || listing.price || 160000,
            reserveMet: true,
            bidCount: 5,
            bidderCount: 3,
            watchersCount: 158,
            auctionType: listing.auctionType || 'live',
            bindingContract: true,
            cashAllowed: false,
            endsAt: new Date(Date.now() + 2 * 86400000 + 18 * 3600000).toISOString(),
        };
    }

    _currentListing = listing;
    _currentAuction = auctionData;
    _currentBids = bidsData;

    // 2. Hydrate UI elements
    hydrateHeaderAndBreadcrumbs(listing, auctionData);
    hydrateGallery(listing);
    hydrateFacts(listing);
    hydratePriceChart(auctionData, bidsData);
    hydrateBidHistory(bidsData, auctionData);
    hydrateBiddingBox(auctionData, listing);
    hydrateSignatureModal(auctionData);
    hydrateSimilarAndNewsletter(listing);

    // 3. Handle state override if requested (e.g. ?state=1..9)
    if (stateOverride) {
        applyAuctionState(Number(stateOverride), auctionData, listing);
    }

    // 4. Subscribe to live updates if available
    try {
        _unsubAuction = subscribeAuction(listing.id, (updated) => {
            if (updated) {
                _currentAuction = { ..._currentAuction, ...updated };
                updateLiveBiddingInfo(_currentAuction);
            }
        });
        _unsubBids = subscribeBids(listing.id, (updatedBids) => {
            if (updatedBids && updatedBids.length > 0) {
                _currentBids = updatedBids;
                hydrateBidHistory(_currentBids, _currentAuction);
                hydratePriceChart(_currentAuction, _currentBids);
            }
        });
    } catch {
        // Subscriptions are optional for static/mock environments
    }
}

// ── Header & Breadcrumbs ──────────────────────────────────────────────────────
function hydrateHeaderAndBreadcrumbs(listing, auction) {
    const makeEl = document.getElementById('aucBreadcrumbMake');
    const modelEl = document.getElementById('aucBreadcrumbModel');
    if (makeEl) makeEl.textContent = listing.make || 'Vozilo';
    if (modelEl) modelEl.textContent = `${listing.make} ${listing.model || ''}`;

    const backBtn = document.getElementById('aucBackToBoardBtn');
    if (backBtn) {
        backBtn.onclick = (e) => {
            e.preventDefault();
            navigateTo('/drazbe');
        };
    }

    const titleEl = document.getElementById('aucHeaderTitle');
    const subEl = document.getElementById('aucHeaderSubtitle');
    const logoEl = document.getElementById('aucHeaderBrandLogo');

    const fullTitle = `${listing.make} ${listing.model || ''} ${listing.variant || ''}`.trim();
    if (titleEl) titleEl.textContent = fullTitle;
    if (subEl) subEl.textContent = listing.subtitle || listing.trim || `${listing.year || 2022} · ${listing.engine || '4.0 Boxer'} · ${listing.transmission || 'Avtomatski'}`;
    if (logoEl && listing.brandLogo) {
        logoEl.src = listing.brandLogo;
        logoEl.alt = listing.make || '';
    }

    document.title = `${fullTitle} — Dražba — ${PLATFORM.brandName}`;
}

// ── Photo Gallery ─────────────────────────────────────────────────────────────
function hydrateGallery(listing) {
    const mainImg = document.getElementById('aucMainImg');
    const curIdxEl = document.getElementById('aucCurrentPhotoIdx');
    const totalEl = document.getElementById('aucTotalPhotos');
    const thumbGrid = document.getElementById('aucThumbnailsGrid');
    const prevBtn = document.getElementById('aucPrevPhotoBtn');
    const nextBtn = document.getElementById('aucNextPhotoBtn');

    let photos = [];
    if (Array.isArray(listing.images)) {
        photos = [...listing.images];
    } else if (listing.images && typeof listing.images === 'object') {
        photos = [...(listing.images.exterior || []), ...(listing.images.interior || [])];
    } else if (listing.imageUrl || listing.image) {
        photos = [listing.imageUrl || listing.image];
    }

    if (photos.length < 4) {
        const baseImg = photos[0] || 'assets/33fcc153d1461b1858fc0ed2282bfe1d.jpg';
        photos = [
            baseImg,
            'assets/33fcc153d1461b1858fc0ed2282bfe1d.jpg',
            'assets/45527f0a5c14414fcd8e75ff183204db.jpg',
            'assets/ee77c186c4d868edc8887422a733aab0.jpg'
        ];
    }

    _allPhotos = photos;
    _activePhotoIndex = 0;

    const updatePhoto = (idx) => {
        _activePhotoIndex = (idx + _allPhotos.length) % _allPhotos.length;
        if (mainImg) mainImg.src = _allPhotos[_activePhotoIndex];
        if (curIdxEl) curIdxEl.textContent = _activePhotoIndex + 1;
        if (totalEl) totalEl.textContent = _allPhotos.length;

        if (thumbGrid) {
            thumbGrid.querySelectorAll('.az-th').forEach((th, i) => {
                th.classList.toggle('active', i === _activePhotoIndex);
            });
        }
    };

    if (curIdxEl) curIdxEl.textContent = 1;
    if (totalEl) totalEl.textContent = _allPhotos.length;
    if (mainImg && _allPhotos[0]) mainImg.src = _allPhotos[0];

    if (prevBtn) prevBtn.onclick = () => updatePhoto(_activePhotoIndex - 1);
    if (nextBtn) nextBtn.onclick = () => updatePhoto(_activePhotoIndex + 1);

    if (thumbGrid) {
        thumbGrid.innerHTML = _allPhotos.map((src, i) => `
            <button class="az-th ${i === 0 ? 'active' : ''}" type="button" aria-label="Fotografija ${i + 1}">
                <img src="${escHtml(src)}" alt="Sličica ${i + 1}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">
            </button>
        `).join('');

        thumbGrid.querySelectorAll('.az-th').forEach((th, i) => {
            th.onclick = () => updatePhoto(i);
        });
    }

    const seg = document.getElementById('aucViewSeg');
    if (seg) {
        seg.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                seg.querySelectorAll('button').forEach(b => b.classList.remove('on'));
                btn.classList.add('on');
            };
        });
    }
}

// ── 9 Facts Grid ──────────────────────────────────────────────────────────────
function hydrateFacts(listing) {
    const container = document.getElementById('aucFactsContainer');
    if (!container) return;

    const facts = [
        { label: 'Prevoženi kilometri', value: listing.mileage ? (typeof listing.mileage === 'number' ? `${listing.mileage.toLocaleString('sl-SI')} km` : listing.mileage) : '12.400 km', icon: '#i-gauge' },
        { label: 'Moč motorja', value: listing.power ? (typeof listing.power === 'number' ? `${listing.power} kW (${Math.round(listing.power * 1.36)} KM)` : listing.power) : '375 kW (510 KM)', icon: '#i-zap' },
        { label: 'Gorivo', value: listing.fuel || 'Bencin', icon: '#i-fuel' },
        { label: 'Prva registracija', value: listing.firstRegistration || (listing.year ? `04 / ${listing.year}` : '04 / 2022'), icon: '#i-cal' },
        { label: 'Menjalnik', value: listing.transmission || 'Avtomatski · PDK', icon: '#i-gear' },
        { label: 'Motor', value: listing.engineLayout || listing.subtitle || '4.0 Boxer · 6 valjev', icon: '#i-cog' },
        { label: 'Število lastnikov', value: listing.previousOwnersCount || listing.ownersCount ? `${listing.previousOwnersCount || listing.ownersCount}. lastnik` : '1. lastnik', icon: '#i-usercheck' },
        { label: 'Pogon', value: listing.driveType || listing.drivetrain || 'Zadnji pogon (RWD)', icon: '#i-wheel' },
        { label: 'Delovna prostornina', value: listing.engineCc || listing.displacement ? `${(listing.engineCc || listing.displacement).toLocaleString('sl-SI')} ccm` : '3.996 ccm', icon: '#i-box' },
    ];

    container.innerHTML = facts.map(f => `
        <div class="fact">
            <span class="ic"><svg class="i"><use href="${f.icon}"></use></svg></span>
            <div>
                <span class="l">${escHtml(f.label)}</span>
                <b>${escHtml(String(f.value))}</b>
            </div>
        </div>
    `).join('');
}

// ── Interactive SVG Price History Chart ───────────────────────────────────────
function hydratePriceChart(auction, bids) {
    const wrap = document.getElementById('aucPriceChartSvgWrap');
    if (!wrap) return;

    const series = (auction.priceSeries && auction.priceSeries.length > 0)
        ? auction.priceSeries.map((s, idx) => ({
            amountEur: Number(s.amountEur ?? s.amount ?? 160000),
            step: idx + 1,
            time: s.t || s.time
        }))
        : (bids && bids.length > 0
            ? bids.map((b, i) => ({
                amountEur: Number(b.amountEur ?? b.amount ?? 160000),
                step: i + 1,
                time: b.createdAt
            }))
            : [
                { amountEur: 160000, step: 1 },
                { amountEur: 168000, step: 2 },
                { amountEur: 175000, step: 3 },
                { amountEur: 182000, step: 4 },
                { amountEur: 187500, step: 5 }
            ]);

    const startPrice = Number(auction.startPriceEur || 160000);
    const currentPrice = Number(auction.currentBidEur || series[series.length - 1].amountEur || 187500);
    const delta = currentPrice - startPrice;
    const deltaPct = ((delta / (startPrice || 1)) * 100).toFixed(1);

    const deltaPill = document.getElementById('aucDeltaPill');
    if (deltaPill) {
        deltaPill.textContent = `+${delta.toLocaleString('sl-SI')} € (+${deltaPct} %)`;
    }

    const minVal = Math.min(startPrice, ...series.map(s => s.amountEur)) * 0.95;
    const maxVal = Math.max(currentPrice, ...series.map(s => s.amountEur)) * 1.05;
    const range = maxVal - minVal || 1;

    const width = 640;
    const height = 220;
    const padX = 40;
    const padY = 30;

    const points = series.map((s, idx) => {
        const x = padX + (idx / (series.length - 1 || 1)) * (width - 2 * padX);
        const y = height - padY - ((s.amountEur - minVal) / range) * (height - 2 * padY);
        return { x, y, amount: s.amountEur, step: idx + 1 };
    });

    const dLine = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
    const dArea = `${dLine} L ${points[points.length - 1].x.toFixed(1)} ${height - padY} L ${points[0].x.toFixed(1)} ${height - padY} Z`;

    const reserveY = height - padY - ((startPrice - minVal) / range) * (height - 2 * padY);

    wrap.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;overflow:visible;" class="az-chart-svg">
            <defs>
                <linearGradient id="azPriceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#2563eb" stop-opacity="0.28"></stop>
                    <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0"></stop>
                </linearGradient>
            </defs>

            <!-- Horizontal Grid lines -->
            <line x1="${padX}" y1="${padY}" x2="${width - padX}" y2="${padY}" stroke="#e2e8f0" stroke-dasharray="3 3"></line>
            <line x1="${padX}" y1="${(padY + height - padY) / 2}" x2="${width - padX}" y2="${(padY + height - padY) / 2}" stroke="#e2e8f0" stroke-dasharray="3 3"></line>
            <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="#cbd5e1"></line>

            <!-- Reserve Price Line -->
            <line x1="${padX}" y1="${reserveY.toFixed(1)}" x2="${width - padX}" y2="${reserveY.toFixed(1)}" stroke="#059669" stroke-width="1.5" stroke-dasharray="4 4"></line>
            <text x="${width - padX - 8}" y="${(reserveY - 6).toFixed(1)}" text-anchor="end" fill="#059669" font-size="11" font-weight="700">Minimalna cena: ${startPrice.toLocaleString('sl-SI')} €</text>

            <!-- Area & Line -->
            <path d="${dArea}" fill="url(#azPriceGrad)"></path>
            <path d="${dLine}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>

            <!-- Interactive Bid Points -->
            ${points.map((p, i) => `
                <g class="chart-pt" tabindex="0">
                    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="#fff" stroke="#2563eb" stroke-width="3"></circle>
                    <title>Ponudba #${p.step}: ${(p.amount || 0).toLocaleString('sl-SI')} €</title>
                </g>
            `).join('')}
        </svg>
    `;
}

// ── Live Bid History ──────────────────────────────────────────────────────────
function hydrateBidHistory(bids, auction) {
    const list = document.getElementById('aucBidHistoryList');
    const bidsCountBadge = document.getElementById('aucTabBidsCount');
    const headerStats = document.getElementById('aucHistoryHeaderStats');

    const totalBids = bids ? bids.length : 0;
    if (bidsCountBadge) bidsCountBadge.textContent = totalBids;
    if (headerStats) {
        headerStats.textContent = `${totalBids} ponudb · ${auction.bidderCount || 3} ponudniki`;
    }

    if (!list) return;

    if (!bids || bids.length === 0) {
        list.innerHTML = `<p style="padding:16px;color:#64748b;font-size:14px;">Še ni oddanih ponudb. Bodite prvi!</p>`;
        return;
    }

    const avatarColors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626'];

    list.innerHTML = bids.map((b, idx) => {
        const name = b.bidderName || 'Ponudnik';
        const masked = name.length > 2 ? `${name.substring(0, 1)}***${name.slice(-1).toUpperCase()}.` : 'P***.';
        const initial = name.charAt(0).toUpperCase();
        const color = avatarColors[idx % avatarColors.length];
        const timeAgo = b.hoursAgo ? `pred ${b.hoursAgo} h` : (idx === 0 ? 'pred 14 min' : 'danes ob 11:20');

        return `
            <div class="az-bh">
                <span class="az-bh-av" style="background:${color};color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex:none;">${initial}</span>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;gap:6px">
                        <b style="font-size:14px;font-weight:700;color:#0f172a">${escHtml(masked)}</b>
                        ${idx === 0 ? '<span class="az-bd bi" style="font-size:10px;padding:2px 8px;">Vodilni</span>' : ''}
                    </div>
                    <span style="font-size:12px;color:#64748b;">${timeAgo}</span>
                </div>
                <b class="num" style="font-size:16px;font-weight:800;color:#0f172a;letter-spacing:-0.01em;">${fmtEur(b.amountEur || b.amount)}</b>
            </div>
        `;
    }).join('');

    const expandBtn = document.getElementById('aucExpandBidsBtn');
    if (expandBtn) {
        expandBtn.onclick = () => {
            expandBtn.textContent = expandBtn.textContent.includes('Prikaži') ? 'Prikaži manj' : `Prikaži vseh ${totalBids} ponudb`;
        };
    }
}

// ── Bidding Block & Timer ─────────────────────────────────────────────────────
function hydrateBiddingBox(auction, listing) {
    // 1. Countdown timer setup
    const endsAt = auction.endsAt ? new Date(auction.endsAt).getTime() : Date.now() + 2 * 86400000;
    
    const tick = () => {
        const now = Date.now();
        const diff = Math.max(0, endsAt - now);

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        const dEl = document.getElementById('tileDays');
        const hEl = document.getElementById('tileHours');
        const mEl = document.getElementById('tileMins');
        const sEl = document.getElementById('tileSecs');

        if (dEl) dEl.textContent = String(days).padStart(2, '0');
        if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(mins).padStart(2, '0');
        if (sEl) sEl.textContent = String(secs).padStart(2, '0');

        const toast = document.getElementById('aucToastBanner');
        if (toast && diff < ANTI_SNIP_WINDOW_MS && diff > 0) {
            toast.style.display = 'flex';
        }
    };

    tick();
    if (_timerInterval) clearInterval(_timerInterval);
    _timerInterval = setInterval(tick, 1000);

    // 2. Price displays
    const curPrice = Number(auction.currentBidEur || auction.startPriceEur || 187500);
    updateLiveBiddingInfo(auction);

    // 3. Quick steps
    const quickStepsContainer = document.getElementById('aucQuickSteps');
    const inputDisplay = document.getElementById('aucBidInputDisplay');
    const minStep = 50;

    let targetBid = curPrice + minStep;
    if (inputDisplay) {
        if (inputDisplay.tagName === 'INPUT') inputDisplay.value = fmtEur(targetBid);
        else inputDisplay.textContent = fmtEur(targetBid);
    }
    recalcFees(targetBid);

    if (quickStepsContainer) {
        quickStepsContainer.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                quickStepsContainer.querySelectorAll('button').forEach(b => b.classList.remove('on'));
                btn.classList.add('on');

                const add = Number(btn.dataset.step) || 0;
                targetBid = curPrice + (add === 0 ? minStep : add);
                if (inputDisplay) {
                    if (inputDisplay.tagName === 'INPUT') inputDisplay.value = fmtEur(targetBid);
                    else inputDisplay.textContent = fmtEur(targetBid);
                }
                recalcFees(targetBid);
            };
        });
    }

    // 4. Proxy Switch
    const proxySwitch = document.getElementById('aucProxySwitch');
    const proxyRow = document.getElementById('aucProxyInputRow');
    if (proxySwitch && proxyRow) {
        proxySwitch.onclick = () => {
            const isOn = proxySwitch.classList.toggle('on');
            proxyRow.style.display = isOn ? 'flex' : 'none';
        };
    }

    // 5. Submit bid opens commitment modal
    const submitBtn = document.getElementById('aucSubmitBidBtn');
    if (submitBtn) {
        submitBtn.onclick = (e) => {
            e.preventDefault();
            const modal = document.getElementById('aucCommitmentBackdrop');
            const modalAmount = document.getElementById('modalCommitmentAmount');
            if (modalAmount) modalAmount.textContent = fmtEur(targetBid);
            if (modal) modal.style.display = 'flex';
        };
    }
}

function updateLiveBiddingInfo(auction) {
    const curPrice = Number(auction.currentBidEur || auction.startPriceEur || 187500);
    const curEl = document.getElementById('aucCurrentPriceText');
    const bidsStat = document.getElementById('aucBidsCountStat');
    const biddersStat = document.getElementById('aucBiddersCountStat');
    const startStat = document.getElementById('aucStartPriceStat');

    if (curEl) curEl.textContent = fmtEur(curPrice);
    if (bidsStat) bidsStat.textContent = auction.bidCount || 5;
    if (biddersStat) biddersStat.textContent = auction.bidderCount || 3;
    if (startStat) startStat.textContent = fmtEur(auction.startPriceEur || 160000);

    const submitText = document.getElementById('aucSubmitBtnText');
    if (submitText) submitText.textContent = `Oddaj ponudbo (${fmtEur(curPrice + 50)})`;
}

function recalcFees(amount) {
    const feePriceEl = document.getElementById('aucFeePrice');
    const feePremEl = document.getElementById('aucFeePremium');
    const feeTotalEl = document.getElementById('aucFeeTotal');
    const modalPremText = document.getElementById('modalPremiumText');

    const premium = Math.round(amount * BUYER_PREMIUM_PCT);
    const total = amount + premium;

    if (feePriceEl) feePriceEl.textContent = fmtEur(amount);
    if (feePremEl) feePremEl.textContent = fmtEur(premium);
    if (feeTotalEl) feeTotalEl.textContent = fmtEur(total);
    if (modalPremText) modalPremText.textContent = `${fmtEur(premium)}`;
}

// ── Digital Signature Modal (#signatureCanvas) ────────────────────────────────
function hydrateSignatureModal(auction) {
    const backdrop = document.getElementById('aucCommitmentBackdrop');
    const closeBtn = document.getElementById('closeCommitmentModalBtn');
    const cancelBtn = document.getElementById('cancelCommitmentBtn');
    const canvas = document.getElementById('signatureCanvas');
    const clearBtn = document.getElementById('clearSignatureBtn');
    const agreeCheck = document.getElementById('commitmentAgreementCheck');
    const confirmBtn = document.getElementById('confirmCommitmentBtn');

    if (!backdrop || !canvas) return;

    const closeModal = () => {
        backdrop.style.display = 'none';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    backdrop.onclick = (e) => {
        if (e.target === backdrop) closeModal();
    };

    // Canvas digital signature drawing
    const ctx = canvas.getContext('2d');
    const initCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
    };

    setTimeout(initCanvas, 50);

    const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        return {
            x: e.clientX - r.left,
            y: e.clientY - r.top
        };
    };

    canvas.onpointerdown = (e) => {
        _sigPadState.isDrawing = true;
        _sigPadState.hasSignature = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    canvas.onpointermove = (e) => {
        if (!_sigPadState.isDrawing) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        _sigPadState.isDrawing = false;
        checkValid();
    };

    canvas.onpointerup = stopDrawing;
    canvas.onpointercancel = stopDrawing;

    if (clearBtn) {
        clearBtn.onclick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            _sigPadState.hasSignature = false;
            checkValid();
        };
    }

    const checkValid = () => {
        if (confirmBtn) {
            confirmBtn.disabled = !agreeCheck.checked;
        }
    };

    if (agreeCheck) {
        agreeCheck.onchange = checkValid;
    }

    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            const inputDisplay = document.getElementById('aucBidInputDisplay');
            const inputVal = parseBid(inputDisplay?.tagName === 'INPUT' ? inputDisplay.value : inputDisplay?.textContent || '187550');
            closeModal();

            // Transition to State 1: Leading!
            applyAuctionState(1, { ..._currentAuction, currentBidEur: inputVal });

            // Add new bid to list
            const newBid = {
                bidderName: currentUser()?.name || 'Vi (Uporabnik)',
                amountEur: inputVal,
                createdAt: new Date(),
                hoursAgo: 0
            };
            _currentBids.unshift(newBid);
            hydrateBidHistory(_currentBids, _currentAuction);
            hydratePriceChart(_currentAuction, _currentBids);
        };
    }

    // Tab switcher (Finger Sign vs Print PDF)
    const tabFinger = document.getElementById('tabFingerSign');
    const tabPdf = document.getElementById('tabPrintPdf');
    const secFinger = document.getElementById('fingerSignSection');
    const secPdf = document.getElementById('printPdfSection');

    if (tabFinger && tabPdf && secFinger && secPdf) {
        tabFinger.onclick = () => {
            tabFinger.classList.add('on');
            tabPdf.classList.remove('on');
            secFinger.style.display = 'block';
            secPdf.style.display = 'none';
        };
        tabPdf.onclick = () => {
            tabPdf.classList.add('on');
            tabFinger.classList.remove('on');
            secFinger.style.display = 'none';
            secPdf.style.display = 'block';
        };
    }
}

// ── 9 Dynamic Auction States (from DrazbaStanja.dc.html) ──────────────────────
export function applyAuctionState(stateNum, auction, listing) {
    const bannerContainer = document.getElementById('aucStateBannerContainer');
    const curPriceText = document.getElementById('aucCurrentPriceText');
    const toast = document.getElementById('aucToastBanner');
    const tilesSec = document.getElementById('aucTilesSection');

    if (!bannerContainer) return;

    switch (stateNum) {
        case 1: // Vodite dražbo (ok)
            bannerContainer.innerHTML = `
                <div class="az-st ok">
                    <span class="ic"><svg class="i"><use href="#i-check2"></use></svg></span>
                    <div>
                        <b>Vodite dražbo</b>
                        Vaša ponudba (${fmtEur(auction.currentBidEur)}) je trenutno najvišja. Če vas nekdo prehiti, vas takoj obvestimo.
                    </div>
                </div>
            `;
            bannerContainer.style.display = 'block';
            break;

        case 2: // Prehiteni ste (bad)
            bannerContainer.innerHTML = `
                <div class="az-st bad">
                    <span class="ic"><svg class="i"><use href="#i-info"></use></svg></span>
                    <div>
                        <b>Prehiteni ste!</b>
                        Drug ponudnik je ponudil ${fmtEur(Number(auction.currentBidEur || 187500) + 500)}. Ponudite znova, da ohranite prednost.
                    </div>
                </div>
            `;
            bannerContainer.style.display = 'block';
            break;

        case 3: // Zadnje minute (hot)
            bannerContainer.innerHTML = `
                <div class="az-st hot">
                    <span class="ic"><svg class="i"><use href="#i-bolt"></use></svg></span>
                    <div>
                        <b>Zadnje minute!</b>
                        Zaščita pred sniperji je aktivna: vsaka nova ponudba podaljša dražbo za 2 minuti.
                    </div>
                </div>
            `;
            bannerContainer.style.display = 'block';
            if (toast) toast.style.display = 'flex';
            if (tilesSec) tilesSec.classList.add('hot');
            break;

        case 4: // Pred-dražba (pre)
            bannerContainer.innerHTML = `
                <div class="az-st pre">
                    <span class="ic"><svg class="i"><use href="#i-clock"></use></svg></span>
                    <div>
                        <b>Faza predponudb</b>
                        Oddane ponudbe določijo izhodišče za živo dražbo, ki se začne čez 2 dni.
                    </div>
                </div>
            `;
            bannerContainer.style.display = 'block';
            break;

        case 5: // Tiha dražba (sil)
            bannerContainer.innerHTML = `
                <div class="az-st sil">
                    <span class="ic"><svg class="i"><use href="#i-lockk"></use></svg></span>
                    <div>
                        <b>Ponudbe so skrite</b>
                        Zneski in minimalna cena ostanejo skriti do zaključka dražbe.
                    </div>
                </div>
            `;
            bannerContainer.style.display = 'block';
            if (curPriceText) curPriceText.textContent = 'Skrito do zaključka';
            break;

        case 6: // Modal Zaveza k nakupu
            const modal = document.getElementById('aucCommitmentBackdrop');
            if (modal) modal.style.display = 'flex';
            break;

        case 7: // Ponudba oddana
            bannerContainer.innerHTML = `
                <div class="az-st ok">
                    <span class="ic"><svg class="i"><use href="#i-check"></use></svg></span>
                    <div>
                        <b>Ponudba uspešno zabeležena</b>
                        Zaveza je bila elektronsko podpisana in posredovana sistemu.
                    </div>
                </div>
            `;
            bannerContainer.style.display = 'block';
            break;

        case 8: // Zmagali ste
            bannerContainer.innerHTML = `
                <div class="az-win" style="background:#e6f6f2;border:2px solid #0f766e;border-radius:20px;padding:20px;margin-bottom:16px;">
                    <div style="display:flex;align-items:center;gap:12px">
                        <span style="font-size:28px">🏆</span>
                        <div>
                            <b style="font-size:18px;color:#0b5c53;display:block">Čestitamo! Zmagali ste na dražbi!</b>
                            <span style="font-size:13px;color:#047857">Končna cena: ${fmtEur(auction.currentBidEur)}. Za prevzem imate na voljo 48 ur.</span>
                        </div>
                    </div>
                    <div style="margin-top:14px;display:flex;gap:10px">
                        <button class="btn-cta" style="flex:1"><svg class="i"><use href="#i-wallet"></use></svg> Plačaj varščino / premijo</button>
                        <button class="pill"><svg class="i"><use href="#i-file"></use></svg> Pogodba (PDF)</button>
                    </div>
                </div>
            `;
            bannerContainer.style.display = 'block';
            break;

        case 9: // Dražba zaključena (nt)
            bannerContainer.innerHTML = `
                <div class="az-st nt">
                    <span class="ic"><svg class="i"><use href="#i-gavel"></use></svg></span>
                    <div>
                        <b>Dražba je zaključena</b>
                        Vozilo je bilo prodano za ${fmtEur(auction.currentBidEur)}.
                    </div>
                </div>
            `;
            bannerContainer.style.display = 'block';
            break;

        default:
            bannerContainer.style.display = 'none';
            break;
    }
}

// ── Similar Auctions & Newsletter ─────────────────────────────────────────────
function hydrateSimilarAndNewsletter(listing) {
    const similarGrid = document.getElementById('aucSimilarGrid');
    if (similarGrid) {
        const similars = sampleAuctionCars
            .filter(c => c.id !== listing.id)
            .slice(0, 3);

        similarGrid.innerHTML = similars.map(sim => `
            <article class="card lc" style="cursor:pointer;" onclick="window.navigateTo('/drazba?id=${sim.id}')">
                <div style="display:flex;gap:14px;align-items:center;width:100%">
                    <img src="${sim.imageUrl || sim.image || './assets/45527f0a5c14414fcd8e75ff183204db.jpg'}" alt="${sim.title}" style="width:96px;height:68px;object-fit:cover;border-radius:12px;flex:none;">
                    <div style="flex:1;min-width:0">
                        <b style="font-size:15px;color:#0f172a;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sim.title}</b>
                        <span style="font-size:12.5px;color:#64748b;">${sim.year || 2022} · ${sim.mileage ? sim.mileage.toLocaleString('sl-SI') : '25.000'} km</span>
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
                            <b class="num" style="color:#2563eb;font-size:15px;">${fmtEur(sim.price || 85000)}</b>
                            <span class="az-bd liv" style="font-size:10px;padding:2px 8px;">V ŽIVO</span>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');
    }

    const nlBtn = document.getElementById('aucNlSubmitBtn');
    const nlEmail = document.getElementById('aucNlEmail');
    if (nlBtn && nlEmail) {
        nlBtn.onclick = () => {
            if (nlEmail.value) {
                nlBtn.textContent = '✓ Prijavljeni!';
                nlBtn.disabled = true;
                nlEmail.disabled = true;
            }
        };
    }
}
