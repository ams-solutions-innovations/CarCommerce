// b2bService.js — B2B operations (Supabase)
// All writes are scoped to the authenticated provider (provider_id / owner_id);
// RLS in supabase/policies.sql + supabase/b2b.sql enforces the same on the DB.
//
// Data shape: the pages work with FLAT camelCase objects (e.g. { customerName,
// tireSize, … }). Tables with a `data jsonb` column keep their real columns
// (status, date, …) as columns and everything else inside `data`; the helpers
// below convert in both directions so pages never see the storage layout.

import { supabase } from '../lib/supabase.js';
import { uploadImage } from '../lib/uploads.js';
import { PLATFORM } from '../config/platform.js';
import { getB2BProfile, getRoles } from '../core/b2bContext.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requireProvider() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in required.');
    return user.id;
}

/** Unwrap a Supabase response: throw on error, return data. */
function must({ data, error }) {
    if (error) throw new Error(error.message);
    return data;
}

const META_KEYS = new Set(['id', 'providerId', 'createdAt', 'updatedAt', 'provider_id', 'created_at', 'updated_at']);

const snakeToCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

/** Row → flat object: `data` spread first, real columns win, camelCase aliases added. */
function unpackRow(row) {
    if (!row) return null;
    const { data, ...cols } = row;
    const out = { ...(data || {}), ...cols };
    for (const [k, v] of Object.entries(cols)) {
        const camel = snakeToCamel(k);
        if (camel !== k) out[camel] = v;
    }
    return out;
}

/** Flat object → { cols, data } according to colMap (flat key → column name). */
function packRow(flat, colMap = {}) {
    const cols = {};
    const data = {};
    const colNames = new Set(Object.values(colMap));
    for (const [k, v] of Object.entries(flat || {})) {
        if (META_KEYS.has(k)) continue;
        if (k in colMap) cols[colMap[k]] = v;
        else if (colNames.has(k)) cols[k] = v;
        else if (v !== undefined) data[k] = v;
    }
    return { cols, data };
}

async function listRows(table, uid, { status, orderBy = 'created_at' } = {}) {
    let q = supabase.from(table).select('*').eq('provider_id', uid).order(orderBy, { ascending: false });
    if (status) q = q.eq('status', status);
    return (must(await q) || []).map(unpackRow);
}

async function insertRow(table, uid, flat, colMap) {
    const { cols, data } = packRow(flat, colMap);
    const row = must(await supabase.from(table).insert({ ...cols, provider_id: uid, data }).select('id').single());
    return row.id;
}

/** Merge-update: `data` is merged into the stored jsonb so partial updates are safe. */
async function updateRow(table, id, uid, flat, colMap) {
    const existing = must(await supabase.from(table).select('*').eq('id', id).eq('provider_id', uid).maybeSingle());
    if (!existing) throw new Error('Access denied.');
    const { cols, data } = packRow(flat, colMap);
    must(await supabase.from(table).update({ ...cols, data: { ...(existing.data || {}), ...data } })
        .eq('id', id).eq('provider_id', uid));
    return id;
}

async function deleteRow(table, id, uid) {
    must(await supabase.from(table).delete().eq('id', id).eq('provider_id', uid));
}

// ════════════════════════════════════════════════════════════════════════════
// BUSINESS / PUBLIC PROFILE
// businesses(id, owner_id, platform, name, role, tier, logo_url, cover_url, data)
// The profile editor works with { name, logo, coverImage, …rest }; `rest`
// (tagline, description, contact, social, workingHours, gallery, …) lives in data.
// ════════════════════════════════════════════════════════════════════════════

function businessFromRow(row) {
    if (!row) return null;
    const { data, logo_url, cover_url, owner_id, ...cols } = row;
    return {
        ...(data || {}),
        id: cols.id,
        ownerId: owner_id,
        name: cols.name || '',
        role: cols.role || null,
        tier: cols.tier,
        platform: cols.platform,
        logo: logo_url || '',
        coverImage: cover_url || '',
    };
}

export async function getMyBusiness() {
    const uid = await requireProvider();
    const row = must(await supabase.from('businesses').select('*').eq('owner_id', uid).maybeSingle());
    return businessFromRow(row);
}

/**
 * Create or update the caller's public business profile. Accepts a PARTIAL
 * object (the onboarding saves it step by step): keys that are absent are left
 * untouched, `data` is merged.
 */
export async function saveMyBusiness(partial = {}) {
    const uid = await requireProvider();
    const { name, logo, coverImage, ...rest } = partial;
    // Server-owned columns must never be written through the profile form.
    for (const k of ['id', 'ownerId', 'role', 'tier', 'platform']) delete rest[k];

    const existing = must(await supabase.from('businesses').select('id, name, data').eq('owner_id', uid).maybeSingle());

    const fallbackName = getB2BProfile()?.companyDetails?.companyName || getB2BProfile()?.displayName || '';
    const payload = { data: { ...(existing?.data || {}), ...rest } };
    if (name !== undefined) payload.name = name || fallbackName;
    if (logo !== undefined) payload.logo_url = logo || null;
    if (coverImage !== undefined) payload.cover_url = coverImage || null;
    const primaryRole = getRoles()[0];
    if (primaryRole) payload.role = primaryRole;

    if (existing) {
        must(await supabase.from('businesses').update(payload).eq('owner_id', uid));
    } else {
        // id = uid keeps "businessId" interchangeable with the owner's user id,
        // which booking links and tire-order URLs already rely on.
        must(await supabase.from('businesses').insert({
            id: uid,
            owner_id: uid,
            platform: PLATFORM.id,
            name: payload.name || fallbackName || 'Podjetje',
            ...payload,
        }));
    }
}

/**
 * Checklist behind the "profile completeness" meter (onboarding + dashboard banner).
 * `biz` is the flat profile object (same shape as getMyBusiness / the editor form).
 */
export function profileChecklist(biz, servicesCount = 0) {
    const b = biz || {};
    const hasHours = Object.values(b.workingHours || {}).some(v => String(v || '').trim());
    return [
        { key: 'name',        label: 'Ime podjetja',                  ok: !!String(b.name || '').trim() },
        { key: 'description', label: 'Opis podjetja (vsaj 40 znakov)', ok: String(b.description || '').trim().length >= 40 },
        { key: 'contact',     label: 'Telefon ali e-mail',            ok: !!(b.contact?.phone || b.contact?.email) },
        { key: 'address',     label: 'Naslov',                        ok: !!String(b.contact?.address || '').trim() },
        { key: 'hours',       label: 'Delovni čas',                   ok: hasHours },
        { key: 'logo',        label: 'Logotip',                       ok: !!b.logo },
        { key: 'cover',       label: 'Naslovna slika',                ok: !!b.coverImage },
        { key: 'services',    label: 'Vsaj ena storitev v ceniku',    ok: servicesCount > 0 },
    ];
}

/** 0–100 */
export function profileCompleteness(biz, servicesCount = 0) {
    const items = profileChecklist(biz, servicesCount);
    return Math.round((100 * items.filter(i => i.ok).length) / items.length);
}

export async function uploadBusinessAsset(file, kind /* 'logo'|'cover'|'gallery' */) {
    const uid = await requireProvider();
    return await uploadImage(file, { scope: kind === 'gallery' ? 'business-gallery' : 'business', ownerId: uid, kind });
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICES / PRICE LIST — public.services (real columns, see supabase/b2b.sql)
// ════════════════════════════════════════════════════════════════════════════

const SERVICE_COLS = {
    name: 'name',
    category: 'category',
    description: 'description',
    priceType: 'price_type',
    price: 'price',
    duration: 'duration_min',
    icon: 'icon',
    iconId: 'icon_id',
    active: 'active',
    sortOrder: 'sort_order',
};

function serviceFromRow(row) {
    if (!row) return null;
    const { data, ...c } = row;
    return {
        ...(data || {}),
        id: c.id,
        providerId: c.provider_id,
        name: c.name,
        category: c.category,
        description: c.description || '',
        priceType: c.price_type,
        price: c.price == null ? null : Number(c.price),
        duration: c.duration_min,
        icon: c.icon,
        iconId: c.icon_id,
        active: c.active,
        sortOrder: c.sort_order,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
    };
}

export async function listServices() {
    const uid = await requireProvider();
    const rows = must(await supabase.from('services').select('*').eq('provider_id', uid)
        .order('sort_order', { ascending: true }).order('created_at', { ascending: true }));
    return (rows || []).map(serviceFromRow);
}

/** Public, read-only price list of any provider (for the public business profile). */
export async function listPublicServices(providerId) {
    if (!providerId) return [];
    const rows = must(await supabase.from('services').select('*').eq('provider_id', providerId).eq('active', true)
        .order('sort_order', { ascending: true }).order('created_at', { ascending: true }));
    return (rows || []).map(serviceFromRow);
}

export async function saveService(flat) {
    const uid = await requireProvider();
    if (!flat?.name || !String(flat.name).trim()) throw new Error('Ime storitve je obvezno.');
    const { cols, data } = packRow(flat, SERVICE_COLS);
    if (cols.price !== undefined && cols.price !== null && !Number.isFinite(Number(cols.price))) cols.price = null;
    if (cols.price_type === 'quote') cols.price = null;

    if (flat.id) {
        const existing = must(await supabase.from('services').select('data').eq('id', flat.id).eq('provider_id', uid).maybeSingle());
        if (!existing) throw new Error('Access denied.');
        must(await supabase.from('services').update({ ...cols, data: { ...(existing.data || {}), ...data } })
            .eq('id', flat.id).eq('provider_id', uid));
        return flat.id;
    }
    const row = must(await supabase.from('services').insert({ ...cols, provider_id: uid, data }).select('id').single());
    return row.id;
}

export async function deleteService(id) {
    const uid = await requireProvider();
    await deleteRow('services', id, uid);
}

// ════════════════════════════════════════════════════════════════════════════
// BOOKINGS (provider side)
// bookings(provider_id, customer_id, date, time, status, total_price, notes, data)
// data holds: customerName, customerContact, services[], serviceId, vehicleLabel,
// proposedSlots[], businessName, serviceNumber, tireHandoff, …
// ════════════════════════════════════════════════════════════════════════════

export const BOOKING_COLS = {
    customerId: 'customer_id',
    date: 'date',
    time: 'time',
    status: 'status',
    totalPrice: 'total_price',
    notes: 'notes',
};

export function bookingFromRow(row) {
    const b = unpackRow(row);
    if (!b) return null;
    b.customerName = b.customerName || b.customer_name || '';
    b.proposedSlots = b.proposedSlots || b.proposed_slots || [];
    return b;
}

export async function listMyBookings(filters = {}) {
    const uid = await requireProvider();
    const rows = await listRows('bookings', uid, { status: filters.status });
    return rows
        .map(r => bookingFromRow({ ...r }))
        .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.time || '').localeCompare(a.time || ''));
}

export async function updateBookingStatus(id, status) {
    const uid = await requireProvider();
    const rows = must(await supabase.from('bookings').update({ status }).eq('id', id).eq('provider_id', uid).select('id'));
    if (!rows?.length) throw new Error('Access denied.');
}

export async function confirmBookingSlot(id, date, time) {
    const uid = await requireProvider();
    const rows = must(await supabase.from('bookings').update({ status: 'confirmed', date, time })
        .eq('id', id).eq('provider_id', uid).select('id'));
    if (!rows?.length) throw new Error('Access denied.');
}

export async function blockSlot(date, time, reason) {
    const uid = await requireProvider();
    must(await supabase.from('bookings').insert({
        provider_id: uid,
        date,
        time: time || null,
        status: 'blocked',
        notes: reason || 'Blokiran termin',
        data: {},
    }));
}

// ════════════════════════════════════════════════════════════════════════════
// INVENTORY — dealer stock (inventory.data holds make, model, vin, prices, …)
// ════════════════════════════════════════════════════════════════════════════

const STATUS_ONLY = { status: 'status' };

export async function listInventory(statusFilter) {
    const uid = await requireProvider();
    return await listRows('inventory', uid, { status: statusFilter });
}

export async function saveInventoryItem(data) {
    const uid = await requireProvider();
    if (data?.id) return await updateRow('inventory', data.id, uid, data, STATUS_ONLY);
    return await insertRow('inventory', uid, { status: 'draft', ...data }, STATUS_ONLY);
}

export async function deleteInventoryItem(id) {
    const uid = await requireProvider();
    await deleteRow('inventory', id, uid);
}

// ════════════════════════════════════════════════════════════════════════════
// LEADS — dealer CRM. Rows are created by the API (server/src/routes/leads.ts)
// with data = { name, message, contactEmail, contactPhone }; normalised here to
// the names the CRM page uses.
// ════════════════════════════════════════════════════════════════════════════

const LEAD_COLS = { status: 'status' };

function leadFromRow(row) {
    const l = unpackRow(row);
    if (!l) return null;
    l.customerName = l.customerName || l.name || '';
    l.customerContact = l.customerContact || [l.contactPhone, l.contactEmail].filter(Boolean).join(' · ');
    return l;
}

export async function listLeads(statusFilter) {
    const uid = await requireProvider();
    const rows = await listRows('leads', uid, { status: statusFilter });
    return rows.map(r => leadFromRow({ ...r }));
}

export async function updateLead(id, data) {
    const uid = await requireProvider();
    await updateRow('leads', id, uid, data, LEAD_COLS);
}

// ════════════════════════════════════════════════════════════════════════════
// TIRE STORAGE — "hotel za gume"
// ════════════════════════════════════════════════════════════════════════════

export async function listTireStorage(statusFilter) {
    const uid = await requireProvider();
    return await listRows('tire_storage', uid, { status: statusFilter });
}

export async function saveTireStorage(data) {
    const uid = await requireProvider();
    if (data?.id) return await updateRow('tire_storage', data.id, uid, data, STATUS_ONLY);
    return await insertRow('tire_storage', uid, { status: 'stored', ...data }, STATUS_ONLY);
}

export async function deleteTireStorageItem(id) {
    const uid = await requireProvider();
    await deleteRow('tire_storage', id, uid);
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ════════════════════════════════════════════════════════════════════════════

export async function getDashboardStats() {
    const uid = await requireProvider();
    const [bookingsRes, servicesRes, inventoryRes, leadsRes] = await Promise.allSettled([
        supabase.from('bookings').select('status, total_price').eq('provider_id', uid),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('provider_id', uid),
        supabase.from('inventory').select('id', { count: 'exact', head: true }).eq('provider_id', uid),
        supabase.from('leads').select('status').eq('provider_id', uid),
    ]);

    const ok = (r) => r.status === 'fulfilled' && !r.value.error;
    // 'blocked' rows are calendar blocks, not customer bookings.
    const bookingsArr = ok(bookingsRes) ? (bookingsRes.value.data || []).filter(b => b.status !== 'blocked') : [];
    const servicesCount = ok(servicesRes) ? (servicesRes.value.count || 0) : 0;
    const inventoryCount = ok(inventoryRes) ? (inventoryRes.value.count || 0) : 0;
    const leadsArr = ok(leadsRes) ? (leadsRes.value.data || []) : [];

    return {
        bookings: {
            total: bookingsArr.length,
            pending: bookingsArr.filter(b => b.status === 'pending').length,
            confirmed: bookingsArr.filter(b => b.status === 'confirmed').length,
            completed: bookingsArr.filter(b => b.status === 'completed').length,
            revenue: bookingsArr.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
        },
        services: servicesCount,
        inventory: inventoryCount,
        leads: { total: leadsArr.length, new: leadsArr.filter(l => l.status === 'new').length },
    };
}

// ════════════════════════════════════════════════════════════════════════════
// TIRE ORDERS
// Flow: buyer submits → vulkanizer confirms → buyer books appointment
// ════════════════════════════════════════════════════════════════════════════

function addBusinessDays(startDate, days) {
    const d = new Date(startDate);
    let added = 0;
    while (added < days) {
        d.setDate(d.getDate() + 1);
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) added++;
    }
    return d;
}

export async function submitTireOrder(tireData, vulcanizerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in required.');

    const estimatedDeliveryDate = addBusinessDays(new Date(), 3).toISOString().slice(0, 10);

    const row = must(await supabase.from('tire_orders').insert({
        vulcanizer_id: vulcanizerId,
        buyer_id: user.id,
        tire_data: {
            brand: tireData.tireBrand,
            model: tireData.tireModel,
            dimension: tireData.tireDim,
            quantity: tireData.quantity,
        },
        status: 'pending_confirmation',
        estimated_delivery_date: estimatedDeliveryDate,
        price_snapshot: tireData.price || null,
        current_price: tireData.price || null,
        booking_url: null,
    }).select('id').single());

    console.info(`[TireOrder] New order ${row.id} for tire shop ${vulcanizerId}.`);
    return { id: row.id, estimatedDeliveryDate };
}

export async function getTireOrder(tireOrderId) {
    const row = must(await supabase.from('tire_orders').select('*').eq('id', tireOrderId).maybeSingle());
    return unpackRow(row);
}

export async function listPendingTireOrders() {
    const uid = await requireProvider();
    const rows = must(await supabase.from('tire_orders').select('*')
        .eq('vulcanizer_id', uid).eq('status', 'pending_confirmation')
        .order('submitted_at', { ascending: false }));
    return (rows || []).map(unpackRow);
}

export async function confirmTireOrderReceival(tireOrderId) {
    const uid = await requireProvider();
    const order = must(await supabase.from('tire_orders').select('*').eq('id', tireOrderId).maybeSingle());
    if (!order || order.vulcanizer_id !== uid) throw new Error('Access denied.');

    const base = import.meta.env.BASE_URL || '/';
    const prefix = base === '/' ? '' : base.replace(/\/$/, '');
    const bookingUrl = `${window.location.origin}${prefix}/booking?businessId=${uid}&tireOrderId=${tireOrderId}`;
    must(await supabase.from('tire_orders')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), booking_url: bookingUrl })
        .eq('id', tireOrderId).eq('vulcanizer_id', uid));

    console.info(`[TireOrder] Order ${tireOrderId} confirmed. Booking URL: ${bookingUrl}`);
    return { bookingUrl };
}

export async function checkAndHandlePriceChange(tireOrderId, newPrice) {
    const uid = await requireProvider();
    const order = must(await supabase.from('tire_orders').select('*').eq('id', tireOrderId).maybeSingle());
    if (!order || order.vulcanizer_id !== uid) throw new Error('Access denied.');

    if (Number(order.price_snapshot) !== Number(newPrice)) {
        must(await supabase.from('tire_orders').update({ status: 'price_changed', current_price: newPrice })
            .eq('id', tireOrderId).eq('vulcanizer_id', uid));
        console.info(`[TireOrder] Price changed for ${tireOrderId}: ${order.price_snapshot} → ${newPrice}`);
    }
}

export async function markTireOrderOrdered(tireOrderId) {
    // RLS: only the vulcanizer may update; for the buyer this resolves to a no-op row set.
    must(await supabase.from('tire_orders').update({ status: 'ordered', ordered_at: new Date().toISOString() }).eq('id', tireOrderId));
}
