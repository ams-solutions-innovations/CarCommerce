import { supabase } from '../lib/supabase.js';
import { setAuthPersistence } from '../lib/authStorage.js';
import { mutateProfilePrefs,readProfilePrefs } from './profilePrefsService.js';
import { getMyBusiness,saveMyBusiness } from './b2bService.js';
import { fetchB2BProfile } from '../core/b2bContext.js';
import { key as lsKey } from '../config/storageKeys.js';

const pendingKey=lsKey('account_pending');
export function pendingAccount(){try{return JSON.parse(sessionStorage.getItem(pendingKey)||'{}');}catch{return {};}}
export function storePendingAccount(value){const data=Object.fromEntries(['email','name','region','kind','marketing','termsAt'].filter(key=>value[key]!=null).map(key=>[key,value[key]]));sessionStorage.setItem(pendingKey,JSON.stringify(data));return data;}
export function safeAccountReturn(value,fallback='/dashboard'){try{const url=new URL(value||fallback,location.origin);if(url.origin!==location.origin||!url.pathname.startsWith('/')||url.pathname.startsWith('//')||['/prijava','/login','/registracija','/register'].includes(url.pathname))return fallback;return url.pathname+url.search;}catch{return fallback;}}
export function authFailure(error){const result=new Error(error?.message||'Dejanje ni uspelo. Poskusite znova.');result.code=error?.code;result.status=error?.status;return result;}
const must=result=>{if(result.error)throw authFailure(result.error);return result.data;};
export async function createAccount({name,email,password,region,kind='private',marketing=false}){
 if(!String(name||'').trim())throw new Error('Vnesite ime in priimek.');
 setAuthPersistence(true);const normalized=email.trim().toLowerCase();const termsAt=new Date().toISOString();
 const data=must(await supabase.auth.signUp({email:normalized,password,options:{emailRedirectTo:`${location.origin}/zacetek?kind=${kind}`,data:{display_name:name.trim(),region,autohub_intro:kind,terms_accepted_at:termsAt,marketing_consent:marketing}}}));
 if(!data.user)throw new Error('Registracija ni uspela.');storePendingAccount({email:normalized,name:name.trim(),region,kind,marketing,termsAt});return data;
}
export async function signInAccount(email,password,remember=true){setAuthPersistence(remember);return must(await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password}));}
export function takeOAuthKind(){try{const value=sessionStorage.getItem(lsKey('oauth_kind'));sessionStorage.removeItem(lsKey('oauth_kind'));return value==='business'||value==='private'?value:null;}catch{return null;}}
export async function signInGoogle({kind='private',returnTo='/zacetek',remember=true,register=false}={}){setAuthPersistence(remember);try{if(register)sessionStorage.setItem(lsKey('oauth_kind'),kind);else sessionStorage.removeItem(lsKey('oauth_kind'));}catch{}return must(await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${location.origin}${safeAccountReturn(returnTo,'/zacetek')}`}}));}
export async function emailAccountLink(email,{recovery=false,returnTo='/dashboard'}={}){const address=email.trim().toLowerCase();if(recovery)return must(await supabase.auth.resetPasswordForEmail(address,{redirectTo:`${location.origin}/ponastavi-geslo`}));return must(await supabase.auth.signInWithOtp({email:address,options:{shouldCreateUser:false,emailRedirectTo:`${location.origin}/zacetek?next=${encodeURIComponent(safeAccountReturn(returnTo))}`}}));}
export async function resendConfirmation(email,kind='private'){return must(await supabase.auth.resend({type:'signup',email:email.trim().toLowerCase(),options:{emailRedirectTo:`${location.origin}/zacetek?kind=${kind}`}}));}
export async function authenticatedAccount(){const data=must(await supabase.auth.getUser());if(!data?.user)throw new Error('Za nadaljevanje se prijavite.');return data.user;}
export async function accountMfa(){const {data,error}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();if(error)throw authFailure(error);if(data?.nextLevel!=='aal2'||data.currentLevel==='aal2')return null;const factors=must(await supabase.auth.mfa.listFactors());const factor=(factors.totp||[]).find(item=>item.status==='verified');if(!factor)throw new Error('Za ta račun je zahtevan drug način dodatne potrditve. Obrnite se na podporo.');return factor.id;}
export async function verifyAccountMfa(factorId,code){return must(await supabase.auth.mfa.challengeAndVerify({factorId,code}));}
export async function saveAccountPassword(password){return must(await supabase.auth.updateUser({password}));}
export async function savePrivateIntro(uid,value){return mutateProfilePrefs(uid,prefs=>({...prefs,region:value.region||prefs.region||'',autohubOnboarding:{...prefs.autohubOnboarding,...value,updatedAt:new Date().toISOString()}}));}
export async function readPrivateIntro(uid){const prefs=await readProfilePrefs(uid);return {prefs,intro:prefs.autohubOnboarding||{}};}
export async function saveBusinessIntro(uid,{company,roles,primaryRole}){
 const allowed=['dealer','mechanic','vulcanizer','tuner','detailing','carwash'];const selected=roles.filter(role=>allowed.includes(role)).sort((a,b)=>a===primaryRole?-1:b===primaryRole?1:0);if(!selected.length)throw new Error('Izberite dejavnost.');
 const existing=await getMyBusiness();
 await mutateProfilePrefs(uid,prefs=>({...prefs,sellerType:'business',businessTier:existing?.tier||'unverified',businessRoles:selected,companyDetails:{...prefs.companyDetails,companyName:company.name,taxId:company.taxId,address:company.address},autohubBusinessOnboarding:{...prefs.autohubBusinessOnboarding,company,roles:selected,primaryRole:selected.includes(primaryRole)?primaryRole:selected[0],step:'verification',updatedAt:new Date().toISOString()}}));
 await fetchB2BProfile({id:uid},{force:true});
 await saveMyBusiness({name:company.name,companyName:company.name,taxId:company.taxId,contact:{...existing?.contact,address:company.address,phone:company.phone||'',email:company.email||''},location:{...existing?.location,city:company.city,country:company.country||'SI'},website:company.website||'',businessTypes:selected.map(role=>role==='mechanic'?'service':role),onboardingDraft:true});
 return getMyBusiness();
}
