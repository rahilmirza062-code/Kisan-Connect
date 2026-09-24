/**
 * Kisan Connect - Centralized Government Minimum Support Price (MSP) Configuration
 * Single Source of Truth for Crop MSP and Rate Resolution across the platform.
 */

const CROP_MSP_DATA = [
  {
    id: 'wheat',
    name: 'Wheat',
    category: 'CEREALS',
    bilingualLabel: 'Wheat (गहू / गेहूं)',
    mspPrice: 2585,
    unit: '₹ / quintal'
  },
  {
    id: 'rice_common',
    name: 'Rice (Paddy - Common)',
    category: 'CEREALS',
    bilingualLabel: 'Rice (Paddy - Common) (तांदूळ - सामान्य / धान - सामान्य)',
    mspPrice: 2441,
    unit: '₹ / quintal'
  },
  {
    id: 'rice_grade_a',
    name: 'Rice (Paddy - Grade A)',
    category: 'CEREALS',
    bilingualLabel: 'Rice (Paddy - Grade A) (तांदूळ - ग्रेड ए / धान - ग्रेड ए)',
    mspPrice: 2461,
    unit: '₹ / quintal'
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    category: 'CEREALS',
    bilingualLabel: 'Maize (Corn) (मका / मक्का)',
    mspPrice: 2410,
    unit: '₹ / quintal'
  },
  {
    id: 'gram_chana',
    name: 'Gram (Chana)',
    category: 'PULSES',
    bilingualLabel: 'Gram (Chana) (हरभरा / चना)',
    mspPrice: 5875,
    unit: '₹ / quintal'
  },
  {
    id: 'tur_arhar',
    name: 'Tur / Arhar (Pigeon Pea)',
    category: 'PULSES',
    bilingualLabel: 'Tur / Arhar (Pigeon Pea) (तूर / अरहर)',
    mspPrice: 8450,
    unit: '₹ / quintal'
  },
  {
    id: 'moong',
    name: 'Moong (Green Gram)',
    category: 'PULSES',
    bilingualLabel: 'Moong (Green Gram) (मूग / मूंग)',
    mspPrice: 8780,
    unit: '₹ / quintal'
  },
  {
    id: 'urad',
    name: 'Urad (Black Gram)',
    category: 'PULSES',
    bilingualLabel: 'Urad (Black Gram) (उडीद / उड़द)',
    mspPrice: 8200,
    unit: '₹ / quintal'
  },
  {
    id: 'lentil_masur',
    name: 'Lentil (Masur)',
    category: 'PULSES',
    bilingualLabel: 'Lentil (Masur) (मसूर)',
    mspPrice: 7000,
    unit: '₹ / quintal'
  },
  {
    id: 'soybean_yellow',
    name: 'Soybean (Yellow)',
    category: 'OILSEED',
    bilingualLabel: 'Soybean (Yellow) (सोयाबीन)',
    mspPrice: 5708,
    unit: '₹ / quintal'
  },
  {
    id: 'cotton_medium_staple',
    name: 'Cotton (Medium Staple)',
    category: 'COMMERCIAL CROPS',
    bilingualLabel: 'Cotton (Medium Staple) (कापूस - मध्यम स्टेपल / कपास)',
    mspPrice: 8267,
    unit: '₹ / quintal'
  },
  {
    id: 'cotton_long_staple',
    name: 'Cotton (Long Staple)',
    category: 'COMMERCIAL CROPS',
    bilingualLabel: 'Cotton (Long Staple) (कापूस - लांब स्टेपल / कपास)',
    mspPrice: 8667,
    unit: '₹ / quintal'
  }
];

/**
 * Normalizes input string and strictly resolves the matching crop MSP config.
 * Handles exact names, IDs, bilingual labels, and partial strings without confusing:
 * - Rice Common vs Rice Grade A
 * - Cotton Medium Staple vs Cotton Long Staple
 *
 * @param {string} input - Crop name, label, or identifier
 * @returns {object|null} - Matching crop object or null if unresolved
 */
function resolveCrop(input) {
  if (!input || typeof input !== 'string') return null;

  const raw = input.trim();
  const lower = raw.toLowerCase();

  // 1. Direct exact match by ID or full Name
  const exact = CROP_MSP_DATA.find(
    (c) => c.id.toLowerCase() === lower || c.name.toLowerCase() === lower || c.bilingualLabel.toLowerCase() === lower
  );
  if (exact) return exact;

  // 2. Strict disambiguation for Rice varieties
  if (lower.includes('grade a') || lower.includes('grade-a') || lower.includes('ग्रेड ए')) {
    return CROP_MSP_DATA.find((c) => c.id === 'rice_grade_a');
  }
  if (lower.includes('common') || lower.includes('सामान्य')) {
    if (lower.includes('rice') || lower.includes('paddy') || lower.includes('धान') || lower.includes('तांदूळ')) {
      return CROP_MSP_DATA.find((c) => c.id === 'rice_common');
    }
  }

  // 3. Strict disambiguation for Cotton varieties
  if (lower.includes('long staple') || lower.includes('long') || lower.includes('लांब')) {
    return CROP_MSP_DATA.find((c) => c.id === 'cotton_long_staple');
  }
  if (lower.includes('medium staple') || lower.includes('medium') || lower.includes('मध्यम')) {
    return CROP_MSP_DATA.find((c) => c.id === 'cotton_medium_staple');
  }

  // 4. Pulses disambiguation (check specific pulses before general "gram")
  if (lower.includes('moong') || lower.includes('mung') || lower.includes('green gram') || lower.includes('मूग') || lower.includes('मूंग')) {
    return CROP_MSP_DATA.find((c) => c.id === 'moong');
  }
  if (lower.includes('urad') || lower.includes('black gram') || lower.includes('उडीद') || lower.includes('उड़द')) {
    return CROP_MSP_DATA.find((c) => c.id === 'urad');
  }
  if (lower.includes('lentil') || lower.includes('masur') || lower.includes('मसूर')) {
    return CROP_MSP_DATA.find((c) => c.id === 'lentil_masur');
  }
  if (lower.includes('tur') || lower.includes('arhar') || lower.includes('pigeon') || lower.includes('तूर') || lower.includes('अरहर')) {
    return CROP_MSP_DATA.find((c) => c.id === 'tur_arhar');
  }
  if (lower.includes('gram') || lower.includes('chana') || lower.includes('हरभरा') || lower.includes('चना')) {
    return CROP_MSP_DATA.find((c) => c.id === 'gram_chana');
  }

  // 5. Oilseed & Cereals
  if (lower.includes('soybean') || lower.includes('soya') || lower.includes('सोयाबीन')) {
    return CROP_MSP_DATA.find((c) => c.id === 'soybean_yellow');
  }
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('मका') || lower.includes('मक्का')) {
    return CROP_MSP_DATA.find((c) => c.id === 'maize');
  }
  if (lower.includes('wheat') || lower.includes('गहू') || lower.includes('गेहूं')) {
    return CROP_MSP_DATA.find((c) => c.id === 'wheat');
  }

  // 6. Generic Cotton fallback if not specified as Long
  if (lower.includes('cotton') || lower.includes('कापूस') || lower.includes('कपास')) {
    return CROP_MSP_DATA.find((c) => c.id === 'cotton_medium_staple');
  }

  // 7. Generic Rice fallback if not specified as Grade A
  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('तांदूळ') || lower.includes('धान')) {
    return CROP_MSP_DATA.find((c) => c.id === 'rice_common');
  }

  return null;
}

/**
 * Resolves the numeric MSP price for a crop name or input string.
 *
 * @param {string} input - Crop name or label
 * @param {number|null} fallback - Optional fallback price if unresolved
 * @returns {number} - Applicable MSP per quintal
 */
function getCropMspPrice(input, fallback = 2585) {
  const crop = resolveCrop(input);
  return crop ? crop.mspPrice : fallback;
}

module.exports = {
  CROP_MSP_DATA,
  resolveCrop,
  getCropMspPrice
};
