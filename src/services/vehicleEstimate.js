import { getComparables } from '../utils/valuationScore.js';
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const fuel=value=>({petrol:'petrol',bencin:'petrol',diesel:'diesel',dizel:'diesel',hybrid:'hybrid',hibrid:'hybrid',electric:'electric',elektricni:'electric',elektrika:'electric','plug-in hibrid':'plugin','plug-in hybrid':'plugin'})[normalize(value)]||normalize(value);
const transmission=value=>/avtomat|automatic|pdk|dsg/i.test(value||'')?'automatic':/rocni|manual/i.test(normalize(value))?'manual':normalize(value);
const price=car=>Number(car.salePriceEur||car.priceEur||car.priceRaw)||0;
export function estimateVehicle(target,listings,{wide=false}={}){
 const valid=listings.filter(car=>(!car.itemType||car.itemType==='vehicle')&&car.entryType!=='auction'&&car.status!=='sold'&&price(car)>0&&(!target.fuel||fuel(car.fuel)===fuel(target.fuel))&&(!target.transmission||transmission(car.transmission)===transmission(target.transmission))&&(!target.mileageKm||car.mileageKm!=null&&Number.isFinite(Number(car.mileageKm))&&Math.abs(Number(car.mileageKm)-Number(target.mileageKm))<=Math.max(20000,Number(target.mileageKm)*(wide ? .6 : .3)))&&(!target.powerKw||car.powerKw!=null&&Number.isFinite(Number(car.powerKw))&&Math.abs(Number(car.powerKw)-Number(target.powerKw))<=Math.max(10,Number(target.powerKw)*.15)));
 const candidates=getComparables(valid.map(car=>({...car,priceEur:price(car)})),target,{yearTolerance:wide?4:2});const prices=candidates.map(price).sort((a,b)=>a-b);const quantile=q=>{if(!prices.length)return null;const index=(prices.length-1)*q;const floor=Math.floor(index);return prices[floor]+(prices[Math.ceil(index)]-prices[floor])*(index-floor);};
 return {candidates,prices,count:prices.length,median:prices.length>=3?quantile(.5):null,low:quantile(.1),high:quantile(.9),confidence:prices.length>=20?'high':prices.length>=8?'medium':'low',wide};
}
