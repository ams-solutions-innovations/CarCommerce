import { supabase } from '../lib/supabase.js';

const pending = new Map();
async function readRow(uid) {
    if (!uid) throw new Error('Za shranjevanje je potrebna prijava.');
    const { data, error } = await supabase.from('profiles').select('prefs,updated_at').eq('id',uid).single();
    if (error) throw error;
    if (!data || !data.updated_at) throw new Error('Uporabniškega profila ni mogoče naložiti.');
    return data;
}
export async function readProfilePrefs(uid) {
    const row = await readRow(uid);
    return row.prefs && typeof row.prefs === 'object' ? row.prefs : {};
}
// Ownership is enforced by existing profiles RLS. Compare updated_at to avoid
// overwriting another tab's newer preferences; every retry reads fresh values.
export function mutateProfilePrefs(uid, change) {
    const previous = pending.get(uid) || Promise.resolve();
    const operation = previous.catch(()=>{}).then(async ()=>{
        for (let attempt=0;attempt<3;attempt++) {
            const row = await readRow(uid);
            const next = change(structuredClone(row.prefs || {}));
            const { data, error } = await supabase.from('profiles')
                .update({prefs:next}).eq('id',uid).eq('updated_at',row.updated_at)
                .select('prefs,updated_at').maybeSingle();
            if (error) throw error;
            if (data) return data.prefs;
        }
        throw new Error('Podatki so se med shranjevanjem spremenili. Poskusite znova.');
    });
    pending.set(uid,operation);
    operation.then(()=>{if(pending.get(uid)===operation)pending.delete(uid);},()=>{if(pending.get(uid)===operation)pending.delete(uid);});
    return operation;
}
