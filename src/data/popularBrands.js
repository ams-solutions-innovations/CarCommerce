import { PLATFORM } from '../config/platform.js';

// Top-10 "most popular" brands surfaced at the top of make dropdowns.
// Shared by the advanced-search page and the landing-page quick search so the
// two stay in lockstep. Keyed by canonical category slug ('avto', 'moto', …).
export const POPULAR_BRANDS = {
    avto: [
        'Audi',
        'BMW',
        'Mercedes-Benz',
        'Porsche',
        'Škoda',
        'Tesla',
        'Toyota',
        'Volkswagen',
        'Alfa Romeo',
        'BYD',
        'Citroën',
        'Cupra',
        'Dacia',
        'Fiat',
        'Ford',
        'Honda',
        'Hyundai',
        'Jaecoo',
        'Kia',
        'Mini',
        'Nissan',
        'Opel',
        'Peugeot',
        'Polestar',
        'Renault'
    ],
    'prosti-cas': [
        'Adria',
        'Bürstner',
        'Carthago',
        'Dethleffs',
        'Hobby',
        'Hymer',
        'Knaus',
        'Pössl',
        'Rapido',
        'Sunlight',
        'Weinsberg',
        'Westfalia',
        'Benimar',
        'Roller Team',
        'Robeta'
    ],
    moto: ['BMW Motorrad', 'BMW', 'CFMoto', 'CF Moto', 'Ducati', 'Honda', 'Husqvarna', 'Kawasaki', 'KTM', 'Piaggio', 'Suzuki', 'Yamaha'],
    plovila: ['Axopar', 'Bavaria', 'Bayliner', 'Beneteau', 'Elan', 'Jeanneau', 'Quicksilver', 'Sea Ray', 'Yamaha', 'Zodiac'],
    izvenkrmni: ['Yamaha', 'Mercury', 'Honda', 'Suzuki', 'Tohatsu', 'Torqeedo', 'Evinrude', 'Volvo Penta', 'Selva', 'Parsun'],
};

// Normalise the various category slugs used across the app to a POPULAR_BRANDS
// key. The home page emits 'motor' for motorbikes; advanced search uses 'moto'.
export function popularBrandsFor(category) {
    if (!category) {
        const defaultCat = (typeof PLATFORM !== 'undefined' && PLATFORM?.id === 'navtika') ? 'plovila' : 'avto';
        return POPULAR_BRANDS[defaultCat] || [];
    }
    const norm = String(category).toLowerCase().replace(/_/g, '-');
    if (norm === 'prosti-cas' || norm === 'prosti_cas' || norm === 'avtodom' || norm === 'avtodomi' || norm === 'prikolice' || norm === 'leisure' || norm === 'rv') return POPULAR_BRANDS['prosti-cas'];
    if (norm === 'motor' || norm === 'moto') return POPULAR_BRANDS.moto;
    if (norm === 'izvenkrmni' || norm === 'izvenkrmni-motorji') return POPULAR_BRANDS.izvenkrmni;
    if (norm === 'colni' || norm === 'jadrnice' || norm === 'gumenjaki' || norm === 'jet-ski' || norm === 'plovila' || norm === 'navtika' || norm === 'plovilo') {
        return POPULAR_BRANDS.plovila;
    }
    return POPULAR_BRANDS[norm] || [];
}

export const BRAND_COUNTS = {
    'Audi': 12480,
    'BMW': 14210,
    'Mercedes-Benz': 11930,
    'Porsche': 1140,
    'Škoda': 9760,
    'Tesla': 860,
    'Toyota': 8320,
    'Volkswagen': 18050,
    'Renault': 16540,
    'Peugeot': 8420,
    'Ford': 7210,
    'Fiat': 4830,
    'Hyundai': 6120,
    'Kia': 5410,
    'Nissan': 3920,
    'Opel': 6240,
    'Citroën': 5130,
    'Cupra': 1260,
    'Dacia': 2840,
    'Alfa Romeo': 960,
    'Mini': 1820,
    'Honda': 1430,
    'Mazda': 2950,
    'Volvo': 3240,
    'Seat': 4670,
    'Land Rover': 1120,
    'Jaguar': 640,
    'Jeep': 1380,
    'Suzuki': 2140,
    'Mitsubishi': 1050,
    'Subaru': 520,
    'BYD': 340,
    'Polestar': 190,
    'Jaecoo': 120,
    'MG': 890,
    'BMW Motorrad': 3420,
    'Yamaha': 4150,
    'Kawasaki': 2840,
    'KTM': 2190,
    'Ducati': 1420,
    'Piaggio': 1960,
    'CFMoto': 1150,
    'Adria': 2450,
    'Hymer': 1120,
    'Bürstner': 980,
    'Knaus': 890,
    'Dethleffs': 840,
    'Carthago': 620,
    'Pössl': 540,
};

export function formatNumberWithDots(val) {
    if (!val && val !== 0) return '';
    return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function getBrandCount(brandName) {
    if (!brandName) return null;
    const count = BRAND_COUNTS[brandName];
    if (typeof count === 'number') {
        return formatNumberWithDots(count);
    }
    return null;
}

