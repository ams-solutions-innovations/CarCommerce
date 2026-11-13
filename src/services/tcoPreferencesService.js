// TCO Preferences Service — Carcommerce (Supabase)
// Stored in profiles.prefs.tco with localStorage as primary cache.

import { supabase } from '../lib/supabase.js';
import { key as lsKey } from '../config/storageKeys.js';
import { mutateProfilePrefs } from './profilePrefsService.js';

const STORAGE_KEY = lsKey('tco_preferences');

const DEFAULT_PREFERENCES = { age: 35, annualMiles: 15000, state: 'SI' };

export async function getTCOPreferences() {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) { try { return JSON.parse(cached); } catch {} }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        try {
            const { data } = await supabase.from('profiles').select('prefs').eq('id', user.id).single();
            if (data?.prefs?.tco) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.prefs.tco));
                return data.prefs.tco;
            }
        } catch (e) {
            console.warn('[TCOPreferences] Could not fetch from Supabase:', e.message);
        }
    }
    return DEFAULT_PREFERENCES;
}

export async function saveTCOPreferences(preferences) {
    const validated = {
        age: Math.max(16, Math.min(120, preferences.age || 35)),
        annualMiles: Math.max(100, Math.min(200000, preferences.annualMiles || 15000)),
        state: preferences.state || preferences.region || 'SI',
        region: preferences.region || preferences.state || 'SI',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // profiles rows are created by the signup trigger and RLS only allows the
        // owner to UPDATE them (there is no INSERT policy), so this must be an
        // update, not an upsert.
        await mutateProfilePrefs(user.id,prefs=>({...prefs,tco:validated}));
    }
    return validated;
}

export function clearTCOPreferences() {
    localStorage.removeItem(STORAGE_KEY);
}

export function getPreferencesForUI() {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) { try { return JSON.parse(cached); } catch {} }
    return DEFAULT_PREFERENCES;
}
