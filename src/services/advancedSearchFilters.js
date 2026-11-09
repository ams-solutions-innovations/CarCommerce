// The advanced form and results use the same URL contract and matching rules.
import { parseFormattedNumber } from '../utils/inputFormatters.js';

const list=(params,key)=>params.getAll(key).flatMap(value=>value.split(',')).filter(Boolean);
const number=(params,key,fallback=0)=>params.get(key)?parseFormattedNumber(params.get(key)):fallback;
const array=(params,key)=>{try{const value=JSON.parse(params.get(key)||'[]');return Array.isArray(value)?value.slice(0,20):[];}catch{return [];}};
const fuel=value=>({Petrol:'Bencin',Diesel:'Dizel',Hybrid:'Hibrid',Electric:'Elektrika'})[value]||value;
const category=value=>['motor','moto'].includes(value)?'moto':value;
const bodyType=value=>['SUV','SUV / Terensko','Terensko'].includes(value)?'SUV':value;
const numeric=value=>typeof value==='number'?value:Number(String(value||'').replace(/[^\d.,]/g,'').replaceAll('.','').replace(',','.'));
const equipment=car=>new Set([...(Array.isArray(car.features)?car.features:[]),...(Array.isArray(car.equipment)?car.equipment:[])]);
const cityPoints={'ljubljana':[46.0569,14.5058],'maribor':[46.5547,15.6459],'celje':[46.2397,15.2677],'koper':[45.5481,13.7302],'kranj':[46.2389,14.3556],'novo mesto':[45.803,15.1689]};
function distanceKm(a,b){const rad=value=>value*Math.PI/180;const dlat=rad(b[0]-a[0]);const dlng=rad(b[1]-a[1]);const h=Math.sin(dlat/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dlng/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}

export function serializeAdvancedForm(form,{activeTab,vehicles=[],excludedVehicles=[],cylFilters=[],powerUnit='kw'}){
    const params=new URLSearchParams();
    const grouped=new Map();
    const fields=new Map();
    for(const field of form.elements){if(!field.name)continue;const values=fields.get(field.name)||[];values.push(field);fields.set(field.name,values);}
    const visible=field=>field.closest('.adv-accordion')?.style.display!=='none'&&field.closest('.car-only-field')?.style.display!=='none'&&field.closest('.moto-only-field')?.style.display!=='none'&&!field.closest('.ah-electric-filters')?.hidden;
    for(const [key,value] of new FormData(form)){
        if(!String(value).trim()||['cat','make','model','variant','linija'].includes(key)&&vehicles.length)continue;
        // Equipment names occur in both car and motorcycle sections. Match the
        // successful control by value and category, rather than the last name.
        const field=fields.get(key)?.find(el=>el.value===String(value)&&!el.disabled&&(!['checkbox','radio'].includes(el.type)||el.checked)&&visible(el));
        if(!field)continue;
        const values=grouped.get(key)||[];if(!values.includes(String(value)))values.push(String(value));grouped.set(key,values);
    }
    for(const [key,values] of grouped)params.set(key,values.join(','));
    for(const key of ['priceFrom','priceTo','startPriceFrom','startPriceTo','mileageFrom','mileageTo','engineHoursFrom','engineHoursTo'])if(params.has(key))params.set(key,String(parseFormattedNumber(params.get(key))));
    for(const key of ['powerFrom','powerTo'])if(params.has(key))params.set(key,String(powerUnit==='km'?Math.round(Number(params.get(key))/1.35962):Number(params.get(key))));
    params.set('cat',activeTab);params.set('advanced','1');
    if(vehicles.length)params.set('vehicles',JSON.stringify(vehicles));
    if(excludedVehicles.length)params.set('excludedVehicles',JSON.stringify(excludedVehicles));
    if(cylFilters.length)params.set('cylFilters',JSON.stringify(cylFilters));
    return params;
}

export function matchesAdvancedSearch(car,params){
    car={...car,condition:({Used:'Rabljeno',New:'Novo','Novo vozilo':'Novo','Razstavno vozilo':'Razstavno'})[car.condition]||car.condition,engineHours:car.engineHours??car.engineHoursUsed,displacementCc:car.displacementCc??car.engineCc,seats:car.seats??car.seatsCount,drivetrain:car.drivetrain||String(car.driveType||'').split(' ')[0],paintwork:car.paintwork||({solid:'Navadna',metallic:'Metallic',pearl:'Pearl',matte:'Mat'})[car.colorType],fuelL100kmCombined:car.fuelL100kmCombined??car.fuelL100km};
    if(car.itemType&&car.itemType!=='vehicle')return false;
    if(params.get('cat')&&category(car.category)!==category(params.get('cat')))return false;
    const matchesVehicle=vehicle=>(!vehicle.make||car.make===vehicle.make)&&(!vehicle.model||car.model===vehicle.model)&&(!vehicle.variant||`${car.variant||''} ${car.title||''} ${car.subtitle||''}`.toLowerCase().includes(vehicle.variant.toLowerCase()))&&(!vehicle.linija||car.linija===vehicle.linija);
    if(array(params,'excludedVehicles').some(matchesVehicle))return false;
    const vehicles=array(params,'vehicles');
    if(vehicles.length&&!vehicles.some(matchesVehicle))return false;
    if(!vehicles.length&&!matchesVehicle({make:params.get('make'),model:params.get('model'),variant:params.get('variant'),linija:params.get('linija')}))return false;
    const body=list(params,'bodyType');
    if(body.length&&!body.some(value=>bodyType(value)===bodyType(car.bodyType)||bodyType(value)===bodyType(car.vehicleType)||(value==='EVozila'&&['EMoto','ESkiro','EKolo'].includes(car.bodyType||car.vehicleType))))return false;
    const price=Number(car.salePriceEur||car.priceEur||car.priceRaw)||0;
    if(car.callForPrice||!price){if(params.get('includeCallForPrice')!=='1')return false;}
    else if(price<number(params,'priceFrom')||price>number(params,'priceTo',Infinity))return false;
    const ranges=[['year','yearFrom','yearTo'],['mileageKm','mileageFrom','mileageTo'],['engineHours','engineHoursFrom','engineHoursTo'],['powerKw','powerFrom','powerTo'],['displacement','displacementFrom','displacementTo'],['seats','seatsFrom','seatsTo']];
    for(const [key,from,to] of ranges){if(!params.has(from)&&!params.has(to))continue;const raw=key==='mileageKm'?car.mileageKm??car.mileage:key==='displacement'?car.displacementCc??car.displacement:car[key];if(raw==null||raw===''||numeric(raw)<number(params,from)||numeric(raw)>number(params,to,Infinity))return false;}
    const doorGroups=list(params,'doors');if(doorGroups.length&&!doorGroups.some(value=>value===String(car.doors)||value.split('/').includes(String(car.doorsCount))))return false;
    const fields={condition:'condition',transmission:'transmission',drivetrain:'drivetrain',engineConfig:'engineConfig',stroke:'stroke',motoDrivetrain:'drivetrain',color:'color',paintwork:'paintwork',interior:'interior',ac:'ac',trailerCoupling:'trailerCoupling',exhaustBrand:'exhaustBrand',exhaustType:'exhaustType'};
    for(const [key,field] of Object.entries(fields)){const values=list(params,key);if(values.length&&!values.includes(String(car[field]??'')))return false;}
    const fuels=list(params,'fuel');if(fuels.length&&!fuels.some(value=>fuel(value)===fuel(car.fuel)||value==='Hibrid'&&['Plug-in hibrid','Priključni hibrid','Blagi hibrid'].includes(fuel(car.fuel))))return false;
    const damaged=car.isDamaged||car.damaged==='only'||car.condition==='Poškodovano';
    if(params.get('damaged')==='only'&&!damaged||params.get('damaged')==='exclude'&&damaged)return false;
    if(params.get('a2Eligible')==='yes'&&car.a2Eligible!==true)return false;
    const cylinderFilters=array(params,'cylFilters');
    const matchCylinder=filter=>String(car.cylinders)===String(filter.cylinders)&&(!filter.layout||String(car.engine_code||car.engineCode||'')===filter.layout||filter.layout.endsWith(' (vsi)')&&String(car.engine_code||car.engineCode||'').startsWith(filter.layout.replace(' (vsi)','')));
    if(cylinderFilters.length){const include=cylinderFilters.filter(item=>!item.exclude);if(include.length&&!include.some(matchCylinder)||cylinderFilters.filter(item=>item.exclude).some(matchCylinder))return false;}
    else if(params.get('cylinders')&&!matchCylinder({cylinders:params.get('cylinders'),layout:params.get('cylinderLayout')}))return false;
    const features=equipment(car);
    for(const [key,field] of [['rangeKmFrom','rangeKm'],['batteryKwhFrom','batteryKwh']])if(params.has(key)&&(car[field]==null||Number(car[field])<Number(params.get(key))))return false;
    if(params.get('chargeTimeTo')&&(car.chargeTimeMinutes==null||Number(car.chargeTimeMinutes)>Number(params.get('chargeTimeTo'))))return false;
    const connectors=list(params,'connector');const availableConnectors=Array.isArray(car.connectors)?car.connectors:String(car.connector||'').split(',').map(value=>value.trim()).filter(Boolean);if(connectors.length&&!connectors.some(value=>availableConnectors.includes(value)))return false;
    if(params.get('consumptionTo')&&fuel(car.fuel)!=='Elektrika'&&(car.fuelL100kmCombined==null||Number(car.fuelL100kmCombined)>Number(params.get('consumptionTo'))))return false;
    if(list(params,'features').some(value=>!features.has(value)))return false;
    const custom=(car.customEquipment||[]).map(item=>typeof item==='string'?item:item.value);
    if(list(params,'customEquipment').some(value=>!custom.includes(value)))return false;
    for(const key of ['parking','airbags','cruiseControl','history']){const values=list(params,key);const recorded=car[key];const available=Array.isArray(recorded)?recorded:recorded?[recorded]:[];if(values.some(value=>!available.includes(value)&&!features.has(value)))return false;}
    const vendor=list(params,'vendor');if(vendor.length&&!vendor.includes(car.sellerType==='private'?'Private':car.sellerType==='dealer'?'Dealer':car.sellerType))return false;
    if(params.get('country')&&car.location?.country!==params.get('country')&&car.country!==params.get('country'))return false;
    const city=params.get('city')?.split(',')[0].trim().toLowerCase();
    if(city){const origin=cityPoints[city];const location=car.location||{};const lat=location.lat??location.latitude;const lng=location.lng??location.longitude;const radius=Number(params.get('radius'))||0;
        if(origin&&radius&&lat!=null&&lng!=null&&Number.isFinite(Number(lat))&&Number.isFinite(Number(lng))){if(distanceKm(origin,[Number(lat),Number(lng)])>radius)return false;}
        else if(!String(location.city||car.city||'').toLowerCase().includes(city))return false;
    }
    if(params.get('najem')==='1'&&!car.isRental)return false;
    // Auction-specific filters
    const aucTypes=list(params,'aucType');
    if(aucTypes.length){
        const type=car.auctionType==='regular'||!car.auctionType?'live':car.auctionType;
        if(!aucTypes.includes(type))return false;
    }
    const aucStatus=params.get('aucStatus');
    const endsWithin=params.get('endsWithin');
    if((aucStatus&&aucStatus!=='all')||endsWithin){
        const endMs=car.endsAt?.toMillis?.()??(car.endsAt?new Date(car.endsAt).getTime():Infinity);
        const now=Date.now();
        const ended=endMs<=now;
        const type=car.auctionType==='regular'||!car.auctionType?'live':car.auctionType;
        if(aucStatus==='active'&&ended)return false;
        if(aucStatus==='ended'&&!ended)return false;
        if(aucStatus==='ending_soon'&&(ended||endMs-now>24*3600*1000))return false;
        if(aucStatus==='upcoming'&&(ended||type!=='prebid'))return false;
        const withinMap={'1h':3600*1000,'24h':24*3600*1000,'3d':3*24*3600*1000,'7d':7*24*3600*1000};
        if(endsWithin&&withinMap[endsWithin]&&(ended||endMs-now>withinMap[endsWithin]))return false;
    }
    const aucReserve=params.get('aucReserve');
    if(aucReserve&&aucReserve!=='all'){
        const reservePrice=Number(car.reservePriceEur)||0;
        const currentBid=Number(car.currentBidEur??car.priceEur??car.priceRaw??car.startPriceEur)||0;
        if(aucReserve==='no_reserve'&&reservePrice>0)return false;
        if(aucReserve==='with_reserve'&&reservePrice<=0)return false;
        if(aucReserve==='reserve_met'&&reservePrice>0&&currentBid<reservePrice)return false;
    }
    const aucBinding=params.get('aucBinding');
    if(aucBinding){
        const isBinding=!!(car.auctionBinding??car.bindingContract);
        if((aucBinding==='1'||aucBinding==='yes')&&!isBinding)return false;
        if(aucBinding==='no'&&isBinding)return false;
    }
    const aucCash=params.get('aucCash');
    if(aucCash){
        const isCash=!!(car.auctionCash??car.cashAllowed);
        if((aucCash==='1'||aucCash==='yes')&&!isCash)return false;
        if(aucCash==='no'&&isCash)return false;
    }
    const bidFilter=params.get('bidFilter');
    if(bidFilter&&bidFilter!=='all'){
        const bidCount=Number(car.bidCount)||0;
        if(bidFilter==='no_bids'&&bidCount>0)return false;
        if(bidFilter==='has_bids'&&bidCount<=0)return false;
    }
    if(params.has('startPriceFrom')||params.has('startPriceTo')){
        const startPrice=Number(car.startPriceEur??car.priceEur??car.priceRaw)||0;
        if(startPrice<number(params,'startPriceFrom')||startPrice>number(params,'startPriceTo',Infinity))return false;
    }
    return true;
}
