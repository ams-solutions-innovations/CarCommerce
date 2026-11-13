// ═══════════════════════════════════════════════════════════════════════════════
// Vehicle body type (vrsta vozila) — shared taxonomy helpers — Carcommerce
// Used by create-listing (auto-fill on entry) and advanced-search (auto-select
// the body-type card when a model with a known body_type is chosen).
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps a taxonomy body_type value (English or Slovenian, any case) to the
 * canonical Slovenian value used by the search filter + category subcategories.
 */
export const BODY_TYPE_MAP = {
    'limuzina': 'Limuzina', 'sedan': 'Limuzina', 'saloon': 'Limuzina', 'limousine': 'Limuzina',
    'kombilimuzina': 'Kombilimuzina', 'hatchback': 'Kombilimuzina', 'combi': 'Kombilimuzina',
    'karavan': 'Karavan', 'wagon': 'Karavan', 'estate': 'Karavan', 'touring': 'Karavan',
    'avant': 'Karavan', 'station wagon': 'Karavan', 'kombi': 'Karavan',
    'terensko': 'Terensko', 'suv': 'Terensko', 'crossover': 'Terensko', 'offroad': 'Terensko',
    'off-road': 'Terensko', 'gelandewagen': 'Terensko',
    'enoprostorec': 'Enoprostorec', 'minivan': 'Enoprostorec', 'mpv': 'Enoprostorec', 'van': 'Enoprostorec',
    'kabriolet': 'Kabriolet', 'convertible': 'Kabriolet', 'cabrio': 'Kabriolet',
    'cabriolet': 'Kabriolet', 'roadster': 'Kabriolet', 'spider': 'Kabriolet', 'spyder': 'Kabriolet',
    'coupe': 'Coupe', 'coupé': 'Coupe',
    'sportni': 'Sportni', 'sports': 'Sportni', 'sport': 'Sportni',
    'pick-up': 'Pick-up', 'pickup': 'Pick-up', 'pick up': 'Pick-up',
    'oldtimer': 'Oldtimer', 'classic': 'Oldtimer',

    // Moto types
    'sportnimotor': 'SportniMotor', 'sportnitourer': 'SportniTourer', 'adventure': 'Adventure',
    'nakedbike': 'NakedBike', 'enduro': 'Enduro', 'chopper': 'Chopper', 'tourer': 'Tourer',
    'supermoto': 'Supermoto', 'trial': 'Trial', 'cross': 'Cross', 'skuter': 'Skuter',
    'minimoto': 'Minimoto', 'cruiser': 'Cruiser', 'moped': 'Moped', 'motornesani': 'MotorneSani',
    'evozila': 'EVozila', 'atv': 'ATV', 'utv': 'UTV', 'trikolesnik': 'Trikolesnik', 'gocart': 'Gocart',

    // Prosti čas types
    'avtodom': 'Avtodom', 'pocitniiskaprikolica': 'PocitniiskaPrikolica', 'pocitniska prikolica': 'PocitniiskaPrikolica',
    'mobilnahisica': 'MobilnaHisica', 'mobilna hisica': 'MobilnaHisica',
    'snemljivbivalnik': 'SnemljivBivalnik', 'sotorskaprikolica': 'SotorskaPrikolica',

    // Commercial types
    'dostavna': 'Dostavna', 'tovorna': 'Tovorna', 'avtobusi': 'Avtobusi', 'prikolice': 'Prikolice',
    'kmetijska': 'Kmetijska', 'gradbena': 'Gradbena', 'vilicari': 'Vilicari', 'gozdarska': 'Gozdarska',
    'komunalna': 'Komunalna', 'ostalo': 'Ostalo'
};

/**
 * Normalizes a raw body_type string to a canonical value, or '' if unknown.
 */
export function normalizeBodyType(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return BODY_TYPE_MAP[raw.trim().toLowerCase()] || raw.trim();
}

const KNOWN_MODEL_BODY_TYPES = {
    'Terensko': new Set([
        'mokka', 'grandland', 'crossland', 'antara', 'frontera', 'monterey',
        'q2', 'q3', 'q4 e-tron', 'q5', 'q7', 'q8', 'e-tron',
        'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'ix', 'ix1', 'ix2', 'ix3',
        'gla', 'glb', 'glc', 'gle', 'glk', 'gls', 'g-class', 'g-razred', 'eqa', 'eqb', 'eqc', 'eqe suv', 'eqs suv',
        'tiguan', 'touareg', 't-roc', 't-cross', 'taigo', 'id.4', 'id.5',
        'kodiaq', 'karoq', 'kamiq', 'enyaq', 'yeti',
        '2008', '3008', '5008', '4008',
        'captur', 'kadjar', 'austral', 'arkana', 'koleos', 'rafale', 'symbioz',
        'duster', 'bigster',
        'rav4', 'yaris cross', 'corolla cross', 'c-hr', 'highlander', 'land cruiser', 'bz4x',
        'tucson', 'kona', 'santa fe', 'bayon', 'ioniq 5',
        'sportage', 'sorento', 'niro', 'xceed', 'stonic', 'ev6', 'ev9',
        'cr-v', 'hr-v', 'zr-v', 'e:ny1',
        'qashqai', 'x-trail', 'juke', 'ariya',
        'kuga', 'puma', 'ecosport', 'explorer', 'bronco', 'mustang mach-e',
        'cx-3', 'cx-30', 'cx-5', 'cx-60', 'cx-80',
        'xc40', 'xc60', 'xc90', 'ex30', 'ex90',
        'cayenne', 'macan',
        'model y', 'model x',
        'formentor', 'ateca', 'tavascan', 'terramar', 'arona', 'tarraco',
        'stelvio', 'tonale', 'junior',
        'vitara', 's-cross', 'jimny',
        'outlander', 'asx', 'eclipse cross',
        'forester', 'outback', 'xv', 'crosstrek',
        'defender', 'discovery', 'range rover', 'range rover evoque', 'range rover sport', 'range rover velar'
    ]),
    'Kombilimuzina': new Set([
        'corsa', 'adam', 'karl', 'agila', 'astra', 'kadett', 'signum',
        'golf', 'polo', 'up!', 'id.3', 'scirocco',
        'a1', 'a3',
        'series 1', 'serija 1', 'i3',
        'a-class', 'a-razred',
        'fabia', 'scala', 'citigo',
        'clio', 'megane', 'twingo', 'zoe', 'renault 5',
        '208', '308', '108', '206', '207', '307',
        'fiesta', 'focus', 'ka',
        'yaris', 'corolla', 'auris', 'aygo', 'prius',
        'i10', 'i20', 'i30',
        'picanto', 'rio', 'ceed',
        'civic', 'jazz',
        'micra', 'leaf', 'note',
        'ibiza', 'leon', 'born',
        'c3', 'c4', 'ds3', 'ds4',
        '500', 'panda', 'punto', 'tipo', 'bravo',
        'mazda2', 'mazda3',
        'swift', 'ignis', 'baleno',
        'giulietta', 'mito',
        'cooper', 'one', 'clubman'
    ]),
    'Karavan': new Set([
        'astra', 'insignia', 'vectra', 'omega',
        'octavia', 'superb', 'fabia',
        'passat', 'golf', 'arteon',
        'a4', 'a6', 'rs4', 'rs 4', 'rs6', 'rs 6',
        'series 3', 'serija 3', 'series 5', 'serija 5',
        'c-class', 'c-razred', 'e-class', 'e-razred',
        'focus', 'mondeo',
        'megane', 'talisman', 'laguna',
        '308', '508',
        'corolla', 'avensis',
        'i30', 'i40',
        'ceed', 'proceed', 'optima',
        'v60', 'v90', 'v40', 'v70',
        'mazda6', 'leon'
    ]),
    'Limuzina': new Set([
        'insignia', 'vectra', 'omega', 'senator', 'rekord', 'ascona', 'diplomat', 'commodore', 'ampera',
        'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'e-tron gt',
        'series 3', 'serija 3', 'series 4', 'serija 4', 'series 5', 'serija 5', 'series 7', 'serija 7', 'i4', 'i5', 'i7',
        'c-class', 'c-razred', 'e-class', 'e-razred', 's-class', 's-razred', 'cla', 'cls', 'eqe', 'eqs',
        'passat', 'arteon', 'jetta', 'phaeton', 'id.7',
        'octavia', 'superb',
        'model 3', 'model s',
        '508', 'talisman', 'camry', 'accord', 'mazda6', 's60', 's90', 'giulia', 'taycan', 'panamera'
    ]),
    'Coupe': new Set([
        'calibra', 'tigra', 'gt', 'manta', 'monza',
        '911', 'cayman', '718',
        'tt', 'r8', 'a5',
        'series 2', 'serija 2', 'series 4', 'serija 4', 'series 8', 'serija 8', 'm2', 'm4', 'm8', 'i8',
        'cle', 'clk', 'cl', 'amg gt',
        'mustang', 'supra', 'gr86', 'gt86', 'brz', '350z', '370z', 'gt-r', 'rcz'
    ]),
    'Kabriolet': new Set([
        'cascada', 'speedster', 'tigra', 'gt',
        'boxster', '911',
        'z3', 'z4',
        'sl', 'slc', 'slk',
        'mx-5', 'tt', 's2000', 'barchetta', '124 spider'
    ]),
    'Enoprostorec': new Set([
        'zafira', 'meriva', 'sintra',
        'touran', 'sharan', 'sportsvan',
        'alhambra', 'altea',
        'scenic', 'grand scenic', 'espace', 'modus',
        's-max', 'galaxy', 'c-max', 'b-max',
        'b-class', 'b-razred',
        'series 2', 'serija 2',
        'c4 picasso', 'c4 spacetourer', 'xsara picasso',
        '500l', 'multipla'
    ]),
    'Kombi': new Set([
        'combo', 'vivaro', 'movano',
        'transporter', 'multivan', 'caravelle', 'California', 'caddy', 'crafter', 'id. buzz',
        'sprinter', 'vito', 'v-class', 'v-razred', 'citan',
        'master', 'trafic', 'kangoo', 'express',
        'transit', 'transit custom', 'tourneo', 'tourneo custom',
        'berlingo', 'jumpy', 'spacetourer', 'jumper',
        'partner', 'rifter', 'expert', 'traveller', 'boxer',
        'doblo', 'scudo', 'talento', 'ducato',
        'proace', 'proace city', 'hiace',
        'daily'
    ]),
    'Pick-up': new Set([
        'campo', 'ranger', 'hilux', 'amarok', 'navara', 'l200', 'd-max', 'fullback', 'gladiator', 'ram', 'f-150'
    ])
};

function inferBodyTypesFromTrims(entry) {
    const types = new Set();
    const variants = getModelVariants(entry);
    variants.forEach(item => {
        const trim = (typeof item === 'string' ? item : item?.trim || '').toLowerCase();
        if (!trim) return;
        if (trim.includes('sports tourer') || trim.includes('country tourer') || trim.includes('touring') || trim.includes('avant') || trim.includes('variant') || trim.includes('estate') || trim.includes('combi') || trim.includes('wagon') || trim.includes('karavan') || trim.includes('allroad') || trim.includes('alltrack') || trim.includes('shooting brake') || trim.includes('sw')) {
            types.add('Karavan');
        }
        if (trim.includes('hatchback') || trim.includes('sportback')) {
            types.add('Kombilimuzina');
        }
        if (trim.includes('limousine') || trim.includes('sedan') || trim.includes('saloon') || trim.includes('grand sport') || trim.includes('gran coupe')) {
            types.add('Limuzina');
        }
        if (trim.includes('cabrio') || trim.includes('convertible') || trim.includes('roadster') || trim.includes('spider') || trim.includes('spyder') || trim.includes('targa')) {
            types.add('Kabriolet');
        }
        if (trim.includes('coupe') || trim.includes('coupé') || trim.includes('gtc')) {
            types.add('Coupe');
        }
        if (trim.includes('sportsvan') || trim.includes('mpv') || trim.includes('plus')) {
            types.add('Enoprostorec');
        }
        if (trim.includes('suv') || trim.includes('cross') || trim.includes('rocks')) {
            types.add('Terensko');
        }
        if (trim.includes('furgon') || trim.includes('van') || trim.includes('kombi') || trim.includes('bus')) {
            types.add('Kombi');
        }
    });
    return types;
}

/**
 * Returns all canonical body types associated with a (make, model), combining
 * explicit taxonomy metadata, trim heuristics, curated model knowledge, and live listings.
 */
export function getModelBodyTypes(data, make, model, listings = []) {
    const types = new Set();
    if (!model) return [];
    const modelLower = String(model).trim().toLowerCase();
    const entry = data?.[make]?.[model];

    if (entry) {
        if (typeof entry === 'object' && !Array.isArray(entry)) {
            const norm = normalizeBodyType(entry.body_type || entry.type || entry.bodyType || entry.vehicleType);
            if (norm) types.add(norm);
        } else if (Array.isArray(entry)) {
            for (const item of entry) {
                if (item && typeof item === 'object') {
                    const val = item.body_type || item.type || item.bodyType || item.vehicleType;
                    if (val) {
                        const norm = normalizeBodyType(val);
                        if (norm) types.add(norm);
                    }
                }
            }
        }
        inferBodyTypesFromTrims(entry).forEach(t => types.add(t));
    }

    for (const [bodyType, modelSet] of Object.entries(KNOWN_MODEL_BODY_TYPES)) {
        if (modelSet.has(modelLower)) {
            types.add(bodyType);
        }
    }

    if (Array.isArray(listings)) {
        listings.forEach(car => {
            if (car.make === make && String(car.model || '').toLowerCase() === modelLower) {
                if (car.bodyType) types.add(normalizeBodyType(car.bodyType));
                const seg = (car.segment || '').toLowerCase();
                if (seg.includes('suv') || seg.includes('terensko') || seg.includes('crossover')) types.add('Terensko');
                if (seg.includes('wagon') || seg.includes('karavan')) types.add('Karavan');
                if (seg.includes('hatchback') || seg.includes('kombilimuzina')) types.add('Kombilimuzina');
                if (seg.includes('sedan') || seg.includes('limuzina')) types.add('Limuzina');
                if (seg.includes('coupe') || seg.includes('sport')) types.add('Coupe');
                if (seg.includes('cabrio') || seg.includes('convertible')) types.add('Kabriolet');
                if (seg.includes('dostav') || seg.includes('kombi') || seg.includes('van')) types.add('Kombi');
            }
        });
    }

    return Array.from(types);
}

/**
 * Reads the model-level body_type from a brands/models taxonomy object.
 * Checks .body_type, .type, .bodyType, .vehicleType across object or array forms.
 *
 * @param {Object} data  — the loaded brands_models_*.json object
 * @param {string} make
 * @param {string} model
 * @returns {string} canonical body type, or '' if unknown
 */
export function getModelBodyType(data, make, model) {
    if (!data || !make || !model) return '';
    const modelData = data[make];
    if (!modelData) return '';
    const entry = modelData[model];
    if (!entry) return '';
    if (typeof entry === 'object' && !Array.isArray(entry)) {
        return normalizeBodyType(entry.body_type || entry.type || entry.bodyType || entry.vehicleType);
    }
    if (Array.isArray(entry)) {
        for (const item of entry) {
            if (item && typeof item === 'object') {
                const val = item.body_type || item.type || item.bodyType || item.vehicleType;
                if (val) {
                    const res = normalizeBodyType(val);
                    if (res) return res;
                }
            }
        }
    }
    const inferred = getModelBodyTypes(data, make, model);
    return inferred.length === 1 ? inferred[0] : '';
}

/**
 * Returns the variant list for a model regardless of taxonomy shape:
 * array-form models return themselves; object-form models return .variants.
 */
export function getModelVariants(entry) {
    if (Array.isArray(entry)) return entry;
    if (entry && typeof entry === 'object' && Array.isArray(entry.variants)) return entry.variants;
    return [];
}
