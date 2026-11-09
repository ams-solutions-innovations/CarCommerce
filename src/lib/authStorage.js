import { ENV } from './env.js';
const modeKey='autohub_auth_storage_mode';
const target=()=>sessionStorage.getItem(modeKey)==='session'?sessionStorage:localStorage;
export const authStorage={getItem:key=>target().getItem(key),setItem:(key,value)=>target().setItem(key,value),removeItem:key=>{localStorage.removeItem(key);sessionStorage.removeItem(key);}};
export function setAuthPersistence(remember){
 const key=`sb-${new URL(ENV.supabaseUrl).hostname.split('.')[0]}-auth-token`;
 const previous=target();const next=remember?localStorage:sessionStorage;
 sessionStorage.setItem(modeKey,remember?'local':'session');
 for(const name of [key,`${key}-code-verifier`]){const value=previous.getItem(name);if(value&&previous!==next){next.setItem(name,value);previous.removeItem(name);}}
}
