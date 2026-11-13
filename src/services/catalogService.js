// ═══════════════════════════════════════════════════════════════════════════════
// Catalog service — Carcommerce
// Public read access to the price-comparison catalog (`partsCatalog`).
// Currently merges Firestore products with MOCK sample data so the UI works before
// the webscraping backend exists. See docs/WEBSCRAPING_HANDOFF.md.
// ═══════════════════════════════════════════════════════════════════════════════

import { supabase } from '../lib/supabase.js';
import { SAMPLE_CATALOG } from '../data/sampleCatalog.js';

function lowest(product) {
    const offers=Array.isArray(product.offers)?product.offers:[];
    const prices=offers.filter(offer=>{if(offer.inStock===false||offer.currency&&offer.currency!=='EUR')return false;if(offer.url){try{if(!['http:','https:'].includes(new URL(offer.url).protocol))return false;}catch{return false;}}return true;}).map(o=>Number(o.price)).filter(n=>Number.isFinite(n)&&n>0);
    if(prices.length)return Math.min(...prices);
    if(offers.length)return null;
    const value=Number(product.lowestPrice??product.lowest_price);
    return Number.isFinite(value)&&value>0?value:null;
}
export function normalizeCatalogProduct(row) {
    const data=row.data&&typeof row.data==='object'?row.data:{};
    const product={...data,...row,itemType:row.itemType??row.item_type??data.itemType,vehicleCategory:row.vehicleCategory??row.vehicle_category??data.vehicleCategory,imageUrl:row.imageUrl??row.image_url??data.imageUrl??'',attributes:row.attributes||data.attributes||{}};
    product.offers=(Array.isArray(row.offers)?row.offers:Array.isArray(data.offers)?data.offers:[]).map(offer=>({...offer,inStock:offer.inStock??offer.in_stock,price:offer.price!=null&&Number.isFinite(Number(offer.price))?Number(offer.price):null}));
    return product;
}

// ── Get catalog products (optionally filtered) ────────────────────────────────
export async function getCatalogProducts({ itemType, vehicleCategory, strict=false } = {}) {
    let products = [];
    try {
        const { data,error } = await supabase.from('parts_catalog').select('*').neq('status', 'hidden');
        if(error)throw error;
        products = (data || []).map(normalizeCatalogProduct);
    } catch (err) {
        if(strict)throw err;
        console.warn('Could not fetch parts_catalog from Supabase, using sample catalog only.', err);
    }

    let all = [...products, ...(import.meta.env.DEV ? SAMPLE_CATALOG : [])].filter(p => p.status !== 'hidden');
    if (itemType) all = all.filter(p => (p.itemType ?? p.item_type) === itemType);
    if (vehicleCategory) all = all.filter(p => (p.vehicleCategory ?? p.vehicle_category) === vehicleCategory);

    return all.sort((a, b) => (lowest(a) ?? Infinity) - (lowest(b) ?? Infinity));
}

// ── Get a single catalog product ──────────────────────────────────────────────
export async function getCatalogProductById(id) {
    const sample = import.meta.env.DEV ? SAMPLE_CATALOG.find(p => p.id === id) : null;
    if (sample) return normalizeCatalogProduct(sample);

    const { data, error } = await supabase.from('parts_catalog').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data||data.status==='hidden') throw new Error('Catalog product does not exist.');
    return normalizeCatalogProduct(data);
}

export function getLowestPrice(product) {
    return lowest(product);
}
