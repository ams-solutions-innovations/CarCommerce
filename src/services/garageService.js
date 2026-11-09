// Vehicles and favourites share profiles.prefs with AutoHub collections.
import { readProfilePrefs, mutateProfilePrefs } from './profilePrefsService.js';
export async function addVehicle(uid,vehicle) {
 const id='v_'+crypto.randomUUID();
 await mutateProfilePrefs(uid,prefs=>({...prefs,vehicles:[{id,...vehicle,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},...(Array.isArray(prefs.vehicles)?prefs.vehicles:[])]}));
 return id;
}
export async function getVehicles(uid) {const prefs=await readProfilePrefs(uid);return Array.isArray(prefs.vehicles)?prefs.vehicles:[];}
export async function updateVehicle(uid,vehicleId,updates) {await mutateProfilePrefs(uid,prefs=>({...prefs,vehicles:(prefs.vehicles||[]).map(vehicle=>vehicle.id===vehicleId?{...vehicle,...updates,updatedAt:new Date().toISOString()}:vehicle)}));}
export async function deleteVehicle(uid,vehicleId) {await mutateProfilePrefs(uid,prefs=>({...prefs,vehicles:(prefs.vehicles||[]).filter(vehicle=>vehicle.id!==vehicleId)}));}
export async function addToFavourites(uid,listing) {
 await mutateProfilePrefs(uid,prefs=>{
  const favourites=Array.isArray(prefs.favourites)?prefs.favourites:[];
  if(favourites.some(item=>item.listingId===listing.id))return prefs;
  return {...prefs,favourites:[{listingId:listing.id,title:listing.title||'',price:listing.price||'',priceEur:Number(listing.salePriceEur||listing.priceEur||listing.priceRaw)||null,image:listing.images?.exterior?.[0]||listing.image||'',savedAt:new Date().toISOString()},...favourites]};
 });
 document.dispatchEvent(new CustomEvent('autohubFavouritesChanged',{detail:{uid}}));
}
export async function removeFromFavourites(uid,listingId) {await mutateProfilePrefs(uid,prefs=>({...prefs,favourites:(prefs.favourites||[]).filter(item=>item.listingId!==listingId)}));document.dispatchEvent(new CustomEvent('autohubFavouritesChanged',{detail:{uid}}));}
export async function getFavourites(uid) {const prefs=await readProfilePrefs(uid);return(Array.isArray(prefs.favourites)?prefs.favourites:[]).sort((a,b)=>(b.savedAt||'').localeCompare(a.savedAt||''));}
export async function isFavourite(uid,listingId){return(await getFavourites(uid)).some(item=>item.listingId===listingId);}
