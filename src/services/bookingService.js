// bookingService.js — Booking & Service business logic — Carcommerce
// Pure functions. No DOM. localStorage for persistence.
// TODO: Replace localStorage calls with Firestore when backend is ready.

import {
    mockVehicles,
    mockBookings,
    mockProducts,
    servicePrices,
    perTyreServices,
    serviceIcons,
} from '../data/bookingData.js';
import { key as lsKey } from '../config/storageKeys.js';
import { serviceLabels } from '../data/businesses.js';

// ── ID generator ──────────────────────────────────────────────
function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Format price label ────────────────────────────────────────
function formatPriceLabel(serviceId) {
    const price = servicePrices[serviceId];
    if (price === undefined || price === 0) return 'Po ogledu';
    if (perTyreServices.includes(serviceId)) return `od ${price * 4} € (4 gume)`;
    return `od ${price} €`;
}

// ── Get services for a business ───────────────────────────────
/**
 * Returns enriched service objects for a business's servicesOffered array.
 * @param {Object} business
 * @returns {{ id, label, icon, price, priceLabel, isQuoteOnly }[]}
 */
export function getServicesForBusiness(business) {
    return (business.servicesOffered || []).map(id => {
        const price = servicePrices[id] ?? 0;
        const isQuoteOnly = price === 0;
        const effectivePrice = perTyreServices.includes(id) ? price * 4 : price;
        return {
            id,
            label: serviceLabels[id] || id,
            icon: serviceIcons[id] || 'settings',
            price: effectivePrice,
            priceLabel: formatPriceLabel(id),
            isQuoteOnly,
        };
    });
}

// ── Get products relevant to selected services ────────────────
/**
 * Returns products whose serviceId is in the selectedServiceIds list.
 * @param {string[]} serviceIds
 * @returns {Object[]}
 */
export function getProductsForServices(serviceIds) {
    return mockProducts.filter(p => serviceIds.includes(p.serviceId));
}

// ── Calculate booking total ───────────────────────────────────
/**
 * Calculates total price from selected services and products.
 * @param {string[]} serviceIds
 * @param {{ productId: string, qty: number }[]} selectedProducts
 * @returns {{ lineItems: {label: string, price: number, isQuote: boolean}[], total: number, hasQuoteItems: boolean }}
 */
export function calculateTotal(serviceIds, selectedProducts) {
    const lineItems = [];
    let total = 0;
    let hasQuoteItems = false;

    for (const id of serviceIds) {
        const price = servicePrices[id] ?? 0;
        const label = serviceLabels[id] || id;

        if (price === 0) {
            hasQuoteItems = true;
            lineItems.push({ label, price: 0, isQuote: true });
        } else {
            const effectivePrice = perTyreServices.includes(id) ? price * 4 : price;
            lineItems.push({ label, price: effectivePrice, isQuote: false });
            total += effectivePrice;
        }
    }

    for (const { productId, qty } of selectedProducts) {
        const product = mockProducts.find(p => p.id === productId);
        if (!product) continue;
        const lineTotal = product.price * qty;
        lineItems.push({
            label: `${product.name} × ${qty}`,
            price: lineTotal,
            isQuote: false
        });
        total += lineTotal;
    }

    return { lineItems, total, hasQuoteItems };
}

// ── Vehicle persistence ───────────────────────────────────────
/**
 * Returns vehicles for a user. Falls back to mockVehicles for demo user.
 * @param {string} userId
 * @returns {Object[]}
 */
export function getVehiclesForUser(userId) {
    try {
        const stored = localStorage.getItem(lsKey('vehicles', userId));
        const vehicles = stored ? JSON.parse(stored) : [];
        // Always include mock vehicles for the demo user
        if (!userId || userId === 'mock-user') {
            const storedIds = vehicles.map(v => v.id);
            const extras = mockVehicles.filter(v => !storedIds.includes(v.id));
            return [...extras, ...vehicles];
        }
        return vehicles;
    } catch {
        return userId === 'mock-user' ? mockVehicles : [];
    }
}

/**
 * Saves a new vehicle to localStorage. Returns saved vehicle with id.
 * @param {string} userId
 * @param {{ brand: string, model: string, year: number, licensePlate: string }} vehicleData
 * @returns {Object}
 */
export function saveVehicle(userId, vehicleData) {
    const vehicle = { ...vehicleData, id: generateId('v'), userId };
    try {
        const existing = getVehiclesForUser(userId).filter(v => v.userId === userId);
        const updated = [...existing, vehicle];
        localStorage.setItem(lsKey('vehicles', userId), JSON.stringify(updated));
    } catch {
        console.warn('[BookingService] Could not save vehicle to localStorage');
    }
    // TODO: replace with Firestore setDoc
    return vehicle;
}

import { supabase } from '../lib/supabase.js';
import { bookingFromRow } from './b2bService.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ── Booking persistence ───────────────────────────────────────
/**
 * Returns all bookings for a user (flat objects, same shape the provider sees).
 * Falls back to mockBookings for the demo user.
 * @param {string} userId
 * @returns {Promise<Object[]>}
 */
export async function getBookingsForUser(userId,{strict=false}={}) {
    if (!userId || userId === 'mock-user') {
        return mockBookings;
    }
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('customer_id', userId)
            .neq('status', 'blocked')
            .order('date', { ascending: false });
        if (error) throw error;
        return [...(data || []).map(bookingFromRow), ...(strict?[]:localBookings(userId))];
    } catch (err) {
        console.error('[BookingService] Failed to fetch bookings from Supabase', err);
        if(strict)throw err;
        return localBookings(userId);
    }
}

// Bookings kept in localStorage (demo user / mock business directory).
function localBookings(userId) {
    try {
        const stored = localStorage.getItem(lsKey('bookings', userId));
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Saves a booking to Supabase. Returns the saved booking (flat object).
 * Columns: provider_id, customer_id, date, time, status, total_price, notes.
 * Everything else (services, vehicle, proposed slots, …) goes into `data`.
 * @param {Object} bookingData
 * @returns {Promise<Object>}
 */
export async function saveBooking(bookingData) {
    const userId = bookingData.userId || 'mock-user';
    const { businessId, date, time, notes, totalPrice, ...rest } = bookingData;
    // Identity / column fields are stored in real columns, not in the data blob.
    delete rest.userId;
    delete rest.total_price;

    const booking = {
        ...rest,
        id: generateId('bk'),
        businessId,
        userId,
        status: 'pending',
        date: date || null,
        time: time || null,
        notes: notes || '',
        totalPrice: totalPrice ?? null,
        customerId: userId,
        providerId: businessId,
        createdAt: new Date().toISOString(),
    };

    // Only real accounts booking with a real (uuid) provider can be persisted;
    // demo users and the mock business directory stay local.
    if (userId !== 'mock-user' && UUID_RE.test(userId) && UUID_RE.test(String(businessId || ''))) {
        const { data: row, error } = await supabase.from('bookings').insert({
            provider_id: businessId,
            customer_id: userId,
            date: date || null,
            time: time || null,
            status: 'pending',
            total_price: totalPrice ?? null,
            notes: notes || null,
            data: { ...rest, customerName: rest.customerName || '' },
        }).select('id').single();
        if (error) {
            console.error('[BookingService] Failed to save booking to Supabase', error);
            throw new Error(error.message);
        }
        booking.id = row.id;
        return booking;
    }

    // Local-only fallback (demo user / mock business)
    try {
        const stored = localStorage.getItem(lsKey('bookings', userId));
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem(lsKey('bookings', userId), JSON.stringify([...existing, booking]));
    } catch { /* storage unavailable — booking is returned but not persisted */ }
    return booking;
}

/**
 * Cancels a booking by id for a user.
 * @param {string} userId
 * @param {string} bookingId
 * @returns {Promise<boolean>} success
 */
export async function cancelBooking(userId, bookingId) {
    if (userId === 'mock-user') return true;
    try {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId)
            .eq('customer_id', userId)
            .select('id');
        if (error) throw error;
        return (data || []).length > 0;
    } catch (err) {
        console.error('[BookingService] Failed to cancel booking', err);
        return false;
    }
}

// ── Format booking date for display ──────────────────────────
/**
 * Formats ISO date string to Slovenian readable format.
 * @param {string} dateStr — 'YYYY-MM-DD'
 * @returns {string} e.g. '15. april 2026'
 */
export function formatBookingDate(dateStr) {
    if (!dateStr) return '';
    const months = ['januar', 'februar', 'marec', 'april', 'maj', 'junij',
        'julij', 'avgust', 'september', 'oktober', 'november', 'december'];
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${day}. ${months[month - 1]} ${year}`;
}

/**
 * Returns status label in Slovenian.
 * @param {string} status
 * @returns {{ label: string, cls: string }}
 */
export function getStatusInfo(status) {
    return {
        pending:   { label: 'Čaka potrditve', cls: 'status-pending' },
        confirmed: { label: 'Potrjeno',       cls: 'status-confirmed' },
        completed: { label: 'Zaključeno',      cls: 'status-completed' },
        cancelled: { label: 'Preklicano',      cls: 'status-cancelled' },
    }[status] || { label: status, cls: '' };
}
