import { getLowestPrice } from './catalogService.js';
const number=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
export const normalText=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function safeShopUrl(value){try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
export function catalogItem(product){return {...product,key:`catalog:${product.id}`,source:'catalog',category:product.vehicleCategory||'avto',images:(product.images?.exterior||product.images||[]).filter?.(value=>typeof value==='string')||[],offers:(product.offers||[]).filter(offer=>!offer.currency||offer.currency==='EUR'),price:getLowestPrice(product),a:product.attributes||{}};}
export function peerItem(listing){return {...listing,key:`peer:${listing.id}`,source:'peer',category:(listing.vehicleCategory||listing.category)==='motor'?'moto':listing.vehicleCategory||listing.category||'avto',imageUrl:listing.images?.exterior?.[0]||'',images:listing.images?.exterior||[],price:number(listing.salePriceEur||listing.priceEur||listing.priceRaw),a:{...listing.attributes,size:listing.tireSize||listing.attributes?.size,width:listing.tireWidth||listing.attributes?.width,aspect:listing.tireAspect||listing.attributes?.aspect,rim:listing.tireRim||listing.attributes?.rim,season:listing.tireSeason||listing.attributes?.season,loadIndex:listing.tireLoadIndex||listing.attributes?.loadIndex,speedRating:listing.tireSpeedRating||listing.attributes?.speedRating,partGroup:listing.partGroup||listing.attributes?.partGroup,partType:listing.partType||listing.attributes?.partType,equipmentGroup:listing.equipmentGroup||listing.attributes?.equipmentGroup,equipmentType:listing.equipmentType||listing.attributes?.equipmentType,oemNumber:listing.oemNumber,dot:listing.dotYear||listing.attributes?.dot,compatibility:listing.compatibility||listing.attributes?.compatibility||(listing.vehicleApplication?.make?[{...listing.vehicleApplication,verified:false}]:[])}};}
export function tireSpec(item){const a=item.a||{};const match=String(a.size||'').match(/(\d{3})\s*\/\s*(\d{2})\s*(?:Z?R)?\s*(\d{2}(?:\.\d)?)/i);return {width:number(a.width??match?.[1]),aspect:number(a.aspect??match?.[2]),rim:number(a.rim??match?.[3]),loadIndex:a.loadIndex,speedRating:a.speedRating};}
export function vehicleTires(vehicle,season='zimske'){const tires=vehicle?.tires||{};const selected=season==='letne'?tires.summer:season==='celoletne'?tires.allSeason||tires.winter:tires.winter;return selected?{...selected,aspect:selected.aspect??selected.profile}:null;}
export function fitForVehicle(item,vehicle,season='zimske'){
    if(!vehicle)return {state:'unknown',reason:'select'};
    if(item.itemType==='tire'){
        const target=vehicleTires(vehicle,season);const spec=tireSpec(item);
        if(!target||![target.width,target.aspect,target.rim,spec.width,spec.aspect,spec.rim].every(value=>number(value)>0))return {state:'unknown',reason:'missing'};
        if(['width','aspect','rim'].some(key=>Number(target[key])!==Number(spec[key])))return {state:'no',reason:'dimension'};
        if(target.loadIndex&&spec.loadIndex&&Number(spec.loadIndex)<Number(target.loadIndex))return {state:'no',reason:'index'};
        if(!target.loadIndex||!target.speedRating||!spec.loadIndex||spec.speedRating!==target.speedRating)return {state:'unknown',reason:'indices'};
        if(target.xl===true&&item.a.xl!==true)return {state:'unknown',reason:'indices'};
        return {state:'yes',reason:'recorded'};
    }
    const entries=Array.isArray(item.a.compatibility)?item.a.compatibility:[];
    if(!entries.length)return {state:'unknown',reason:'missing'};
    if(!vehicle.make||!vehicle.model)return {state:'unknown',reason:'missing'};
    const matches=entries.filter(entry=>normalText(entry.make)===normalText(vehicle.make)&&normalText(entry.model)===normalText(vehicle.model)&&(!vehicle.year||!entry.yearFrom||Number(vehicle.year)>=Number(entry.yearFrom))&&(!vehicle.year||!entry.yearTo||Number(vehicle.year)<=Number(entry.yearTo)));
    if(!matches.length)return {state:'no',reason:'vehicle'};
    return matches.some(entry=>entry.verified===true&&(!entry.yearFrom&&!entry.yearTo||Number(vehicle.year)>0)&&(!entry.engine||normalText(entry.engine)===normalText(vehicle.engine)))?{state:'yes',reason:'recorded'}:{state:'unknown',reason:'variant'};
}
export function matchesPart(item,filters,vehicle){
    if(item.category!==filters.category||item.itemType!==filters.itemType)return false;
    if(filters.source!=='all'&&item.source!==filters.source)return false;
    const a=item.a;const spec=tireSpec(item);
    const terms=normalText(filters.q).split(/\s+/).filter(Boolean);const haystack=normalText([item.title,item.brand,a.size,a.oemNumber,a.partType,item.description].filter(Boolean).join(' '));if(!terms.every(term=>haystack.includes(term)))return false;
    for(const key of ['width','aspect','rim'])if(item.itemType==='tire'&&filters[key]&&Number(filters[key])!==spec[key])return false;
    if(item.itemType==='tire'&&filters.season&&a.season!==filters.season)return false;
    if(filters.brand&&item.brand!==filters.brand)return false;
    if(filters.group&&(item.itemType==='oprema'?a.equipmentGroup:a.partGroup)!==filters.group)return false;
    if(filters.partType&&(item.itemType==='oprema'?a.equipmentType:a.partType)!==filters.partType)return false;
    if(filters.oem&&!normalText(a.oemNumber).includes(normalText(filters.oem)))return false;
    const condition=value=>({used:'rabljeno',new:'novo'}[normalText(value)]||normalText(value));
    if(filters.condition&&condition(item.condition||a.condition)!==condition(filters.condition))return false;
    if(filters.priceFrom&&(item.price===null||item.price<Number(filters.priceFrom)))return false;
    if(filters.priceTo&&(item.price===null||item.price>Number(filters.priceTo)))return false;
    for(const key of ['wetGrip','fuelEfficiency'])if(item.itemType==='tire'&&filters[key]&&(a[key]||a[key==='wetGrip'?'wetClass':'fuelClass'])!==filters[key])return false;
    if(item.itemType==='tire'&&filters.noiseTo&&(a.noiseDb==null||Number(a.noiseDb)>Number(filters.noiseTo)))return false;
    if(item.itemType==='tire'&&(filters.snow&&a.snow3PMSF!==true||filters.xl&&a.xl!==true||filters.runFlat&&a.runFlat!==true||filters.mounting&&!item.offers?.some(offer=>offer.businessId&&offer.mounting===true)))return false;
    if(filters.vehicle&&vehicle&&item.itemType!=='tire'&&fitForVehicle(item,vehicle,filters.season).state==='no')return false;
    return true;
}
