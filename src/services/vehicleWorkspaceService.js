import { key as lsKey } from '../config/storageKeys.js';

export const VEHICLE_COMPARE_LIMIT=4;
const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
export function vehicleSnapshot(car){
 const keys=['id','title','make','model','variant','subtitle','year','priceEur','salePriceEur','priceRaw','price','mileageKm','mileage','powerKw','power','fuel','transmission','fuelL100km','kwhPer100km','kWhPer100km','engineType','engineStroke','previousOwners','owners','category','vehicleCategory','status','entryType','sellerType','tcoMonthly'];
 const result=Object.fromEntries(keys.filter(key=>car[key]!=null).map(key=>[key,car[key]]));
 result.image=car.images?.exterior?.[0]||car.image||'';
 result.location=typeof car.location==='object'?car.location.city||car.location.region||'':car.location;
 result.seller=typeof car.seller==='object'?car.seller.name||car.seller.companyName||'':car.seller||car.contact?.name||'';
 return result;
}
export function readVehicleComparison(){const list=read(lsKey('compare'));return Array.isArray(list)?list.filter(car=>car&&typeof car==='object'&&car.id).slice(0,VEHICLE_COMPARE_LIMIT):[];}
export function writeVehicleComparison(cars){const unique=[...new Map(cars.map(car=>[String(car.id),vehicleSnapshot(car)])).values()].slice(0,VEHICLE_COMPARE_LIMIT);localStorage.setItem(lsKey('compare'),JSON.stringify(unique));window.updateHeaderCompare?.();document.dispatchEvent(new CustomEvent('autohubComparisonChanged'));return unique;}
export function historyKey(){return lsKey(`recent_${window.__currentUser?.id||'guest'}`);}
export function historyEnabled(){return localStorage.getItem(`${historyKey()}_enabled`)!=='0';}
export function setHistoryEnabled(enabled){localStorage.setItem(`${historyKey()}_enabled`,enabled?'1':'0');}
export function recentVehicles(){const list=read(historyKey());if(!Array.isArray(list))return [];const valid=list.filter(car=>car?.id&&Number(car.viewedAt)>Date.now()-30*86400000);if(valid.length!==list.length)localStorage.setItem(historyKey(),JSON.stringify(valid));return valid;}
export function recordRecentVehicle(car){if(!car?.id||!historyEnabled())return;const list=[{...vehicleSnapshot(car),viewedAt:Date.now()},...recentVehicles().filter(item=>item.id!==car.id)].slice(0,100);localStorage.setItem(historyKey(),JSON.stringify(list));}
export function clearRecentVehicles(){localStorage.removeItem(historyKey());}
