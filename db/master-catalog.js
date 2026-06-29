/**
 * ============================================================
 *  MASTER CATALOG — Indian Kirana / Grocery Store Items
 * ============================================================
 *  300+ items with real Indian brands, Jaipur 2025-26 prices,
 *  Hindi + English keywords, common misspellings & short forms.
 *
 *  Exports:
 *    MASTER_CATALOG          — full item array
 *    CATEGORIES              — category definitions
 *    searchCatalog(query)    — fuzzy search (Hindi/English)
 *    getCatalogByCategory(c) — items filtered by category
 *    getCatalogItem(id)      — single item by id
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
//  CATEGORY DEFINITIONS
// ─────────────────────────────────────────────────────────────

const CATEGORIES = {
  grocery: {
    name: 'Grocery & Staples',
    nameHi: 'किराना और अनाज',
    icon: '🛒',
    subcategories: [
      'flour', 'rice', 'dal', 'sugar', 'oil', 'ghee', 'spices',
      'dry_masala', 'other_staples', 'papad_pickle', 'salt',
      'besan_sooji_maida', 'poha_daliya',
    ],
  },
  dairy: {
    name: 'Dairy Products',
    nameHi: 'डेयरी उत्पाद',
    icon: '🥛',
    subcategories: [
      'milk', 'butter', 'paneer', 'curd', 'cheese', 'cream',
      'buttermilk', 'lassi',
    ],
  },
  sabzi: {
    name: 'Vegetables',
    nameHi: 'सब्ज़ियाँ',
    icon: '🥬',
    subcategories: ['leafy', 'root', 'gourd', 'other_veg'],
  },
  fruits: {
    name: 'Fruits',
    nameHi: 'फल',
    icon: '🍎',
    subcategories: ['seasonal', 'everyday', 'exotic'],
  },
  household: {
    name: 'Household & Cleaning',
    nameHi: 'घरेलू सामान',
    icon: '🧹',
    subcategories: [
      'detergent', 'dishwash', 'toilet_cleaner', 'floor_cleaner',
      'insecticide', 'kitchen_supplies', 'pooja', 'misc_household',
    ],
  },
  personal_care: {
    name: 'Personal Care',
    nameHi: 'व्यक्तिगत देखभाल',
    icon: '🧴',
    subcategories: [
      'soap', 'shampoo', 'toothpaste', 'toothbrush', 'hair_oil',
      'face_care', 'razor', 'feminine_hygiene', 'antiseptic', 'skin_care',
    ],
  },
  snacks: {
    name: 'Snacks & Biscuits',
    nameHi: 'नाश्ता और बिस्कुट',
    icon: '🍪',
    subcategories: [
      'noodles', 'biscuits', 'chips', 'namkeen', 'chocolate', 'rusks',
    ],
  },
  beverages: {
    name: 'Beverages',
    nameHi: 'पेय पदार्थ',
    icon: '☕',
    subcategories: [
      'tea', 'coffee', 'cold_drinks', 'water', 'juice', 'sharbat',
      'energy_drink',
    ],
  },
  pharmacy: {
    name: 'Pharmacy / OTC',
    nameHi: 'दवाइयाँ',
    icon: '💊',
    subcategories: [
      'pain_relief', 'cold_cough', 'digestive', 'first_aid',
      'balm', 'antiseptic',
    ],
  },
};


// ─────────────────────────────────────────────────────────────
//  MASTER CATALOG — 300+ items
// ─────────────────────────────────────────────────────────────

const MASTER_CATALOG = [

  // ═══════════════════════════════════════════════════════════
  //  1. GROCERY & STAPLES  (~80 items)
  // ═══════════════════════════════════════════════════════════

  // ── Flour / Aata ──────────────────────────────────────────
  { id: 1,  name: 'Ashirvaad Aata 5kg',           category: 'grocery', subcategory: 'flour', default_price: 275, unit: '5kg',  brand: 'Ashirvaad',   keywords: ['aata', 'atta', 'flour', 'wheat', 'gehun', 'ata', 'aatta', 'chakki', 'gehu', 'ashirvad', 'ashirwad'] },
  { id: 2,  name: 'Ashirvaad Aata 10kg',          category: 'grocery', subcategory: 'flour', default_price: 520, unit: '10kg', brand: 'Ashirvaad',   keywords: ['aata', 'atta', 'flour', 'wheat', 'gehun', 'ata', 'aatta', 'ashirvad'] },
  { id: 3,  name: 'Pillsbury Aata 5kg',           category: 'grocery', subcategory: 'flour', default_price: 260, unit: '5kg',  brand: 'Pillsbury',   keywords: ['aata', 'atta', 'flour', 'wheat', 'pillsburi', 'pilsbury'] },
  { id: 4,  name: 'Rajdhani Aata 5kg',            category: 'grocery', subcategory: 'flour', default_price: 230, unit: '5kg',  brand: 'Rajdhani',    keywords: ['aata', 'atta', 'flour', 'wheat', 'rajdhani'] },
  { id: 5,  name: 'Aata (Loose) 1kg',             category: 'grocery', subcategory: 'flour', default_price: 40,  unit: '1kg',  brand: 'Local',       keywords: ['aata', 'atta', 'flour', 'wheat', 'gehun', 'loose', 'khula'] },

  // ── Rice ──────────────────────────────────────────────────
  { id: 6,  name: 'India Gate Basmati Rice 1kg',   category: 'grocery', subcategory: 'rice', default_price: 180, unit: '1kg',  brand: 'India Gate',  keywords: ['chawal', 'rice', 'basmati', 'chaval', 'chaawal', 'india gate'] },
  { id: 7,  name: 'India Gate Basmati Rice 5kg',   category: 'grocery', subcategory: 'rice', default_price: 780, unit: '5kg',  brand: 'India Gate',  keywords: ['chawal', 'rice', 'basmati', 'chaval', 'chaawal'] },
  { id: 8,  name: 'Daawat Basmati Rice 1kg',      category: 'grocery', subcategory: 'rice', default_price: 170, unit: '1kg',  brand: 'Daawat',      keywords: ['chawal', 'rice', 'basmati', 'dawat', 'daawat'] },
  { id: 9,  name: 'Daawat Basmati Rice 5kg',      category: 'grocery', subcategory: 'rice', default_price: 720, unit: '5kg',  brand: 'Daawat',      keywords: ['chawal', 'rice', 'basmati', 'dawat'] },
  { id: 10, name: 'Mogra Rice (Broken Basmati) 1kg', category: 'grocery', subcategory: 'rice', default_price: 60, unit: '1kg', brand: 'Local', keywords: ['chawal', 'rice', 'mogra', 'toota', 'broken', 'tukda'] },
  { id: 11, name: 'Non-Basmati Rice 1kg',         category: 'grocery', subcategory: 'rice', default_price: 50,  unit: '1kg',  brand: 'Local',       keywords: ['chawal', 'rice', 'sona masuri', 'sona masoori', 'arwa', 'mota chawal'] },
  { id: 12, name: 'Non-Basmati Rice 5kg',         category: 'grocery', subcategory: 'rice', default_price: 230, unit: '5kg',  brand: 'Local',       keywords: ['chawal', 'rice', 'mota chawal', 'arwa', 'sona masuri'] },

  // ── Dal ───────────────────────────────────────────────────
  { id: 13, name: 'Toor Dal 1kg',                 category: 'grocery', subcategory: 'dal', default_price: 170, unit: '1kg',  brand: 'Tata Sampann', keywords: ['toor', 'arhar', 'dal', 'daal', 'tur', 'tuvar', 'toor dal', 'pigeon pea'] },
  { id: 14, name: 'Toor Dal 500g',                category: 'grocery', subcategory: 'dal', default_price: 90,  unit: '500g', brand: 'Local',        keywords: ['toor', 'arhar', 'dal', 'daal', 'tur'] },
  { id: 15, name: 'Moong Dal 1kg',                category: 'grocery', subcategory: 'dal', default_price: 160, unit: '1kg',  brand: 'Local',        keywords: ['moong', 'mung', 'dal', 'daal', 'moong dal', 'mung bean', 'dhuli moong'] },
  { id: 16, name: 'Moong Dal 500g',               category: 'grocery', subcategory: 'dal', default_price: 85,  unit: '500g', brand: 'Local',        keywords: ['moong', 'mung', 'dal', 'daal'] },
  { id: 17, name: 'Chana Dal 1kg',                category: 'grocery', subcategory: 'dal', default_price: 120, unit: '1kg',  brand: 'Local',        keywords: ['chana', 'channa', 'dal', 'daal', 'gram', 'bengal gram'] },
  { id: 18, name: 'Urad Dal 1kg',                 category: 'grocery', subcategory: 'dal', default_price: 175, unit: '1kg',  brand: 'Local',        keywords: ['urad', 'urid', 'dal', 'daal', 'black gram', 'dhuli urad', 'kaali dal'] },
  { id: 19, name: 'Masoor Dal 1kg',               category: 'grocery', subcategory: 'dal', default_price: 110, unit: '1kg',  brand: 'Local',        keywords: ['masoor', 'masur', 'lentil', 'red lentil', 'dal', 'daal', 'malka masoor'] },
  { id: 20, name: 'Masoor Dal 500g',              category: 'grocery', subcategory: 'dal', default_price: 60,  unit: '500g', brand: 'Local',        keywords: ['masoor', 'masur', 'lentil', 'dal', 'daal'] },
  { id: 21, name: 'Rajma 1kg',                    category: 'grocery', subcategory: 'dal', default_price: 180, unit: '1kg',  brand: 'Local',        keywords: ['rajma', 'kidney bean', 'rajmah', 'kidney beans'] },
  { id: 22, name: 'Kabuli Chana 1kg',             category: 'grocery', subcategory: 'dal', default_price: 170, unit: '1kg',  brand: 'Local',        keywords: ['kabuli', 'chana', 'chole', 'chickpea', 'chhole', 'garbanzo', 'safed chana'] },
  { id: 23, name: 'Moong Sabut 1kg',              category: 'grocery', subcategory: 'dal', default_price: 150, unit: '1kg',  brand: 'Local',        keywords: ['moong', 'sabut', 'whole', 'green gram', 'mung'] },
  { id: 24, name: 'Moth Dal 1kg',                 category: 'grocery', subcategory: 'dal', default_price: 140, unit: '1kg',  brand: 'Local',        keywords: ['moth', 'matki', 'moth bean', 'moth dal'] },

  // ── Sugar ─────────────────────────────────────────────────
  { id: 25, name: 'Sugar 1kg',                    category: 'grocery', subcategory: 'sugar', default_price: 48,  unit: '1kg',  brand: 'Local',      keywords: ['sugar', 'cheeni', 'chini', 'shakkar', 'suger'] },
  { id: 26, name: 'Sugar 5kg',                    category: 'grocery', subcategory: 'sugar', default_price: 230, unit: '5kg',  brand: 'Local',      keywords: ['sugar', 'cheeni', 'chini', 'shakkar'] },
  { id: 27, name: 'Gur / Jaggery 1kg',            category: 'grocery', subcategory: 'sugar', default_price: 80,  unit: '1kg',  brand: 'Local',      keywords: ['gur', 'jaggery', 'gud', 'gurr', 'bella'] },
  { id: 28, name: 'Mishri / Rock Sugar 250g',     category: 'grocery', subcategory: 'sugar', default_price: 55,  unit: '250g', brand: 'Local',      keywords: ['mishri', 'rock sugar', 'dhaga mishri', 'mishree'] },

  // ── Oil ───────────────────────────────────────────────────
  { id: 29, name: 'Fortune Refined Soyabean Oil 1L',   category: 'grocery', subcategory: 'oil', default_price: 155, unit: '1L',  brand: 'Fortune',   keywords: ['oil', 'tel', 'refined', 'soyabean', 'soybean', 'fortune', 'cooking oil'] },
  { id: 30, name: 'Fortune Refined Soyabean Oil 5L',   category: 'grocery', subcategory: 'oil', default_price: 700, unit: '5L',  brand: 'Fortune',   keywords: ['oil', 'tel', 'refined', 'soyabean', 'fortune', 'jar'] },
  { id: 31, name: 'Fortune Sunflower Oil 1L',          category: 'grocery', subcategory: 'oil', default_price: 165, unit: '1L',  brand: 'Fortune',   keywords: ['oil', 'tel', 'sunflower', 'surajmukhi', 'fortune'] },
  { id: 32, name: 'Mustard Oil (Kachi Ghani) 1L',      category: 'grocery', subcategory: 'oil', default_price: 190, unit: '1L',  brand: 'Engine',    keywords: ['sarson', 'mustard', 'oil', 'tel', 'kachi ghani', 'sarso', 'engine', 'sarsoo'] },
  { id: 33, name: 'Mustard Oil 5L',                    category: 'grocery', subcategory: 'oil', default_price: 850, unit: '5L',  brand: 'Engine',    keywords: ['sarson', 'mustard', 'oil', 'tel', 'kachi ghani', 'jar'] },
  { id: 34, name: 'Groundnut Oil 1L',                  category: 'grocery', subcategory: 'oil', default_price: 230, unit: '1L',  brand: 'Gulab',     keywords: ['groundnut', 'peanut', 'moongfali', 'mungfali', 'oil', 'tel'] },
  { id: 35, name: 'Figaro Olive Oil 200ml',            category: 'grocery', subcategory: 'oil', default_price: 260, unit: '200ml', brand: 'Figaro',  keywords: ['olive', 'oil', 'jaitun', 'figaro'] },
  { id: 36, name: 'Saffola Gold Oil 1L',               category: 'grocery', subcategory: 'oil', default_price: 200, unit: '1L',  brand: 'Saffola',   keywords: ['saffola', 'oil', 'tel', 'refined', 'gold', 'blended'] },

  // ── Ghee ──────────────────────────────────────────────────
  { id: 37, name: 'Amul Ghee 500ml',              category: 'grocery', subcategory: 'ghee', default_price: 310, unit: '500ml', brand: 'Amul',      keywords: ['ghee', 'desi ghee', 'amul', 'ghi', 'clarified butter'] },
  { id: 38, name: 'Amul Ghee 1L',                 category: 'grocery', subcategory: 'ghee', default_price: 590, unit: '1L',    brand: 'Amul',      keywords: ['ghee', 'desi ghee', 'amul', 'ghi'] },
  { id: 39, name: 'Patanjali Cow Ghee 500ml',     category: 'grocery', subcategory: 'ghee', default_price: 340, unit: '500ml', brand: 'Patanjali', keywords: ['ghee', 'cow ghee', 'gaay ka ghee', 'patanjali', 'ghi'] },

  // ── Besan / Sooji / Maida ─────────────────────────────────
  { id: 40, name: 'Besan 500g',                   category: 'grocery', subcategory: 'besan_sooji_maida', default_price: 60,  unit: '500g', brand: 'Rajdhani', keywords: ['besan', 'gram flour', 'chickpea flour', 'basan'] },
  { id: 41, name: 'Besan 1kg',                    category: 'grocery', subcategory: 'besan_sooji_maida', default_price: 110, unit: '1kg',  brand: 'Rajdhani', keywords: ['besan', 'gram flour', 'basan'] },
  { id: 42, name: 'Sooji / Rava 500g',            category: 'grocery', subcategory: 'besan_sooji_maida', default_price: 38,  unit: '500g', brand: 'Local',    keywords: ['sooji', 'suji', 'rava', 'semolina', 'rawa'] },
  { id: 43, name: 'Sooji / Rava 1kg',             category: 'grocery', subcategory: 'besan_sooji_maida', default_price: 68,  unit: '1kg',  brand: 'Local',    keywords: ['sooji', 'suji', 'rava', 'semolina', 'rawa'] },
  { id: 44, name: 'Maida 1kg',                    category: 'grocery', subcategory: 'besan_sooji_maida', default_price: 45,  unit: '1kg',  brand: 'Local',    keywords: ['maida', 'refined flour', 'all purpose', 'mayda'] },
  { id: 45, name: 'Poha (Thick) 500g',            category: 'grocery', subcategory: 'poha_daliya', default_price: 35,  unit: '500g', brand: 'Local',    keywords: ['poha', 'flattened rice', 'chivda', 'pohe', 'mota poha'] },
  { id: 46, name: 'Daliya / Broken Wheat 500g',   category: 'grocery', subcategory: 'poha_daliya', default_price: 35,  unit: '500g', brand: 'Local',    keywords: ['daliya', 'dalia', 'broken wheat', 'lapsi', 'bulgur'] },

  // ── Salt ──────────────────────────────────────────────────
  { id: 47, name: 'Tata Salt 1kg',                category: 'grocery', subcategory: 'salt', default_price: 28,  unit: '1kg',  brand: 'Tata',       keywords: ['namak', 'salt', 'tata', 'iodized', 'namk'] },
  { id: 48, name: 'Tata Rock Salt 1kg',           category: 'grocery', subcategory: 'salt', default_price: 32,  unit: '1kg',  brand: 'Tata',       keywords: ['sendha namak', 'rock salt', 'himalayan', 'tata'] },
  { id: 49, name: 'Black Salt 200g',              category: 'grocery', subcategory: 'salt', default_price: 25,  unit: '200g', brand: 'Local',      keywords: ['kala namak', 'black salt'] },

  // ── Spices / Masala ───────────────────────────────────────
  { id: 50, name: 'MDH Haldi Powder 100g',        category: 'grocery', subcategory: 'spices', default_price: 52,  unit: '100g', brand: 'MDH',       keywords: ['haldi', 'turmeric', 'haridra', 'haladi', 'mdh'] },
  { id: 51, name: 'MDH Lal Mirch Powder 100g',    category: 'grocery', subcategory: 'spices', default_price: 70,  unit: '100g', brand: 'MDH',       keywords: ['lal mirch', 'red chilli', 'mirchi', 'lal mirchi', 'chilli powder', 'mdh'] },
  { id: 52, name: 'MDH Jeera (Cumin) 100g',       category: 'grocery', subcategory: 'spices', default_price: 90,  unit: '100g', brand: 'MDH',       keywords: ['jeera', 'cumin', 'zeera', 'jira'] },
  { id: 53, name: 'MDH Dhania Powder 100g',       category: 'grocery', subcategory: 'spices', default_price: 52,  unit: '100g', brand: 'MDH',       keywords: ['dhania', 'coriander', 'dhaniya', 'dhanya'] },
  { id: 54, name: 'MDH Garam Masala 100g',        category: 'grocery', subcategory: 'spices', default_price: 95,  unit: '100g', brand: 'MDH',       keywords: ['garam masala', 'garama masala', 'mdh'] },
  { id: 55, name: 'MDH Kitchen King 100g',        category: 'grocery', subcategory: 'spices', default_price: 80,  unit: '100g', brand: 'MDH',       keywords: ['kitchen king', 'sabzi masala', 'mdh'] },
  { id: 56, name: 'MDH Chana Masala 100g',        category: 'grocery', subcategory: 'spices', default_price: 68,  unit: '100g', brand: 'MDH',       keywords: ['chana masala', 'chole masala', 'mdh'] },
  { id: 57, name: 'MDH Pav Bhaji Masala 100g',    category: 'grocery', subcategory: 'spices', default_price: 72,  unit: '100g', brand: 'MDH',       keywords: ['pav bhaji', 'pav baji', 'mdh'] },
  { id: 58, name: 'MDH Biryani Masala 50g',       category: 'grocery', subcategory: 'spices', default_price: 60,  unit: '50g',  brand: 'MDH',       keywords: ['biryani', 'biriyani', 'mdh', 'biryani masala'] },
  { id: 59, name: 'Everest Sambhar Masala 100g',  category: 'grocery', subcategory: 'spices', default_price: 68,  unit: '100g', brand: 'Everest',   keywords: ['sambhar', 'sambar', 'everest'] },
  { id: 60, name: 'Sabut Jeera 200g',             category: 'grocery', subcategory: 'spices', default_price: 90,  unit: '200g', brand: 'Local',     keywords: ['jeera', 'cumin seeds', 'sabut', 'whole cumin', 'jira'] },
  { id: 61, name: 'Sabut Dhania 200g',            category: 'grocery', subcategory: 'spices', default_price: 45,  unit: '200g', brand: 'Local',     keywords: ['dhania', 'coriander seeds', 'sabut', 'whole coriander'] },
  { id: 62, name: 'Rai / Sarson (Mustard Seeds) 200g', category: 'grocery', subcategory: 'spices', default_price: 35, unit: '200g', brand: 'Local', keywords: ['rai', 'sarson', 'mustard seeds', 'rai ka dana'] },
  { id: 63, name: 'Kali Mirch (Black Pepper) 50g', category: 'grocery', subcategory: 'spices', default_price: 75, unit: '50g', brand: 'Local',     keywords: ['kali mirch', 'black pepper', 'golki', 'kaali mirch'] },
  { id: 64, name: 'Ajwain 100g',                  category: 'grocery', subcategory: 'spices', default_price: 40,  unit: '100g', brand: 'Local',     keywords: ['ajwain', 'carom seeds', 'ajvain', 'bishop weed'] },
  { id: 65, name: 'Methi Dana 200g',              category: 'grocery', subcategory: 'spices', default_price: 38,  unit: '200g', brand: 'Local',     keywords: ['methi', 'fenugreek', 'methi dana', 'methi seeds'] },
  { id: 66, name: 'Hing (Asafoetida) 10g',        category: 'grocery', subcategory: 'spices', default_price: 65,  unit: '10g',  brand: 'LG',        keywords: ['hing', 'asafoetida', 'heeng', 'lg hing'] },
  { id: 67, name: 'Hing (Asafoetida) 50g',        category: 'grocery', subcategory: 'spices', default_price: 250, unit: '50g',  brand: 'LG',        keywords: ['hing', 'asafoetida', 'heeng', 'lg'] },
  { id: 68, name: 'Tej Patta (Bay Leaf) 50g',     category: 'grocery', subcategory: 'spices', default_price: 25,  unit: '50g',  brand: 'Local',     keywords: ['tej patta', 'bay leaf', 'tez patta'] },
  { id: 69, name: 'Dalchini (Cinnamon) 50g',      category: 'grocery', subcategory: 'spices', default_price: 40,  unit: '50g',  brand: 'Local',     keywords: ['dalchini', 'cinnamon', 'dar chini'] },
  { id: 70, name: 'Laung (Cloves) 25g',           category: 'grocery', subcategory: 'spices', default_price: 60,  unit: '25g',  brand: 'Local',     keywords: ['laung', 'cloves', 'lavang', 'long'] },
  { id: 71, name: 'Elaichi (Cardamom) 25g',       category: 'grocery', subcategory: 'spices', default_price: 80,  unit: '25g',  brand: 'Local',     keywords: ['elaichi', 'cardamom', 'ilaichi', 'elachi', 'choti elaichi'] },
  { id: 72, name: 'Kasuri Methi 25g',             category: 'grocery', subcategory: 'spices', default_price: 30,  unit: '25g',  brand: 'Local',     keywords: ['kasuri methi', 'dried fenugreek leaves', 'kasoori methi'] },
  { id: 73, name: 'Amchur Powder 100g',           category: 'grocery', subcategory: 'spices', default_price: 40,  unit: '100g', brand: 'Local',     keywords: ['amchur', 'amchoor', 'dry mango powder', 'aamchur'] },

  // ── Papad, Pickle, Misc Staples ───────────────────────────
  { id: 74, name: 'Lijjat Papad 200g',            category: 'grocery', subcategory: 'papad_pickle', default_price: 60,  unit: '200g', brand: 'Lijjat',    keywords: ['papad', 'papadum', 'pappad', 'appalam', 'lijjat'] },
  { id: 75, name: 'Moong Papad 200g',             category: 'grocery', subcategory: 'papad_pickle', default_price: 55,  unit: '200g', brand: 'Local',     keywords: ['papad', 'moong', 'papadum'] },
  { id: 76, name: 'Mother\'s Recipe Mango Pickle 300g', category: 'grocery', subcategory: 'papad_pickle', default_price: 85, unit: '300g', brand: 'Mother\'s Recipe', keywords: ['pickle', 'aachar', 'achar', 'mango', 'aam ka achar', 'achaar'] },
  { id: 77, name: 'Mixed Pickle 400g',            category: 'grocery', subcategory: 'papad_pickle', default_price: 95,  unit: '400g', brand: 'Local',     keywords: ['pickle', 'achar', 'mixed', 'achaar', 'aachar'] },
  { id: 78, name: 'Sev / Vermicelli 200g',        category: 'grocery', subcategory: 'other_staples', default_price: 30, unit: '200g', brand: 'Bambino',   keywords: ['seviyan', 'vermicelli', 'sevai', 'sev', 'sewai', 'simai'] },
  { id: 79, name: 'Sabudana 500g',                category: 'grocery', subcategory: 'other_staples', default_price: 55, unit: '500g', brand: 'Local',     keywords: ['sabudana', 'sago', 'tapioca', 'sabudaana'] },
  { id: 80, name: 'Cornflour 200g',               category: 'grocery', subcategory: 'other_staples', default_price: 40, unit: '200g', brand: 'Brown & Polson', keywords: ['cornflour', 'corn flour', 'corn starch', 'makka'] },
  { id: 81, name: 'Maggi Masala-ae-Magic 72g',    category: 'grocery', subcategory: 'spices', default_price: 25, unit: '72g', brand: 'Maggi',       keywords: ['masala ae magic', 'masala magic', 'maggi'] },
  { id: 82, name: 'Catch Sprinklers Chat Masala 100g', category: 'grocery', subcategory: 'spices', default_price: 50, unit: '100g', brand: 'Catch', keywords: ['chat masala', 'chaat masala', 'catch', 'sprinklers'] },
  { id: 83, name: 'MTR Sambar Powder 200g',       category: 'grocery', subcategory: 'spices', default_price: 75,  unit: '200g', brand: 'MTR',       keywords: ['sambar', 'sambhar', 'mtr'] },
  { id: 84, name: 'Soya Chunks 200g',             category: 'grocery', subcategory: 'other_staples', default_price: 50, unit: '200g', brand: 'Nutrela',   keywords: ['soya', 'soy', 'chunks', 'nutrela', 'meal maker', 'soya badi'] },
  { id: 85, name: 'Honey 250g',                   category: 'grocery', subcategory: 'other_staples', default_price: 175, unit: '250g', brand: 'Dabur',    keywords: ['honey', 'shahad', 'shehad', 'madhu', 'dabur honey'] },


  // ═══════════════════════════════════════════════════════════
  //  2. DAIRY  (~18 items)
  // ═══════════════════════════════════════════════════════════

  { id: 86,  name: 'Saras Full Cream Milk 1L',     category: 'dairy', subcategory: 'milk', default_price: 68,  unit: '1L',    brand: 'Saras',   keywords: ['doodh', 'dudh', 'milk', 'full cream', 'saras'] },
  { id: 87,  name: 'Saras Full Cream Milk 500ml',  category: 'dairy', subcategory: 'milk', default_price: 35,  unit: '500ml', brand: 'Saras',   keywords: ['doodh', 'dudh', 'milk', 'saras', 'half litre'] },
  { id: 88,  name: 'Saras Toned Milk 1L',          category: 'dairy', subcategory: 'milk', default_price: 56,  unit: '1L',    brand: 'Saras',   keywords: ['doodh', 'dudh', 'milk', 'toned', 'saras'] },
  { id: 89,  name: 'Saras Double Toned Milk 1L',   category: 'dairy', subcategory: 'milk', default_price: 50,  unit: '1L',    brand: 'Saras',   keywords: ['doodh', 'dudh', 'milk', 'double toned', 'saras'] },
  { id: 90,  name: 'Amul Butter 100g',             category: 'dairy', subcategory: 'butter', default_price: 56,  unit: '100g', brand: 'Amul',   keywords: ['butter', 'makhan', 'makkhan', 'amul'] },
  { id: 91,  name: 'Amul Butter 500g',             category: 'dairy', subcategory: 'butter', default_price: 270, unit: '500g', brand: 'Amul',   keywords: ['butter', 'makhan', 'makkhan', 'amul'] },
  { id: 92,  name: 'Paneer 200g',                  category: 'dairy', subcategory: 'paneer', default_price: 90,  unit: '200g', brand: 'Amul',   keywords: ['paneer', 'cottage cheese', 'panir', 'paner'] },
  { id: 93,  name: 'Paneer 1kg',                   category: 'dairy', subcategory: 'paneer', default_price: 400, unit: '1kg',  brand: 'Local',  keywords: ['paneer', 'cottage cheese', 'panir', 'paner'] },
  { id: 94,  name: 'Dahi / Curd 400g',             category: 'dairy', subcategory: 'curd', default_price: 35,  unit: '400g', brand: 'Saras',   keywords: ['dahi', 'curd', 'yogurt', 'yoghurt', 'dahee'] },
  { id: 95,  name: 'Dahi / Curd 1kg',              category: 'dairy', subcategory: 'curd', default_price: 80,  unit: '1kg',  brand: 'Saras',   keywords: ['dahi', 'curd', 'yogurt', 'yoghurt', 'dahee'] },
  { id: 96,  name: 'Amul Cheese Slices 100g (5 slices)', category: 'dairy', subcategory: 'cheese', default_price: 95, unit: '100g', brand: 'Amul', keywords: ['cheese', 'slice', 'slices', 'amul', 'cheez'] },
  { id: 97,  name: 'Amul Cheese Block 200g',       category: 'dairy', subcategory: 'cheese', default_price: 120, unit: '200g', brand: 'Amul',   keywords: ['cheese', 'block', 'processed cheese', 'amul'] },
  { id: 98,  name: 'Amul Fresh Cream 200ml',       category: 'dairy', subcategory: 'cream', default_price: 55,  unit: '200ml', brand: 'Amul',  keywords: ['cream', 'malai', 'fresh cream', 'amul'] },
  { id: 99,  name: 'Chaas / Buttermilk 200ml',     category: 'dairy', subcategory: 'buttermilk', default_price: 15, unit: '200ml', brand: 'Amul', keywords: ['chaas', 'chaach', 'buttermilk', 'mattha', 'chhachh'] },
  { id: 100, name: 'Amul Masti Chaas 1L',          category: 'dairy', subcategory: 'buttermilk', default_price: 40, unit: '1L',  brand: 'Amul',   keywords: ['chaas', 'buttermilk', 'masti', 'amul'] },
  { id: 101, name: 'Amul Lassi 200ml',             category: 'dairy', subcategory: 'lassi', default_price: 25,  unit: '200ml', brand: 'Amul',   keywords: ['lassi', 'sweet lassi', 'amul'] },
  { id: 102, name: 'Condensed Milk (Milkmaid) 400g', category: 'dairy', subcategory: 'milk', default_price: 155, unit: '400g', brand: 'Milkmaid', keywords: ['condensed milk', 'milkmaid', 'mithha doodh'] },
  { id: 103, name: 'Amul Masti Dahi 1kg',          category: 'dairy', subcategory: 'curd', default_price: 85,  unit: '1kg',  brand: 'Amul',    keywords: ['dahi', 'curd', 'yogurt', 'amul', 'masti'] },


  // ═══════════════════════════════════════════════════════════
  //  3. SABZI / VEGETABLES  (~30 items)
  // ═══════════════════════════════════════════════════════════

  { id: 104, name: 'Tamatar / Tomato 1kg',         category: 'sabzi', subcategory: 'other_veg', default_price: 40,  unit: '1kg', brand: 'Fresh', keywords: ['tamatar', 'tomato', 'tomatos', 'tamato', 'tamaatar'] },
  { id: 105, name: 'Pyaaz / Onion 1kg',            category: 'sabzi', subcategory: 'root',      default_price: 35,  unit: '1kg', brand: 'Fresh', keywords: ['pyaaz', 'pyaz', 'onion', 'kanda', 'piyaz'] },
  { id: 106, name: 'Aloo / Potato 1kg',            category: 'sabzi', subcategory: 'root',      default_price: 30,  unit: '1kg', brand: 'Fresh', keywords: ['aloo', 'alu', 'potato', 'aaloo', 'batata'] },
  { id: 107, name: 'Hari Mirch / Green Chilli 100g', category: 'sabzi', subcategory: 'other_veg', default_price: 10, unit: '100g', brand: 'Fresh', keywords: ['hari mirch', 'green chilli', 'mirchi', 'hara mirch'] },
  { id: 108, name: 'Adrak / Ginger 250g',          category: 'sabzi', subcategory: 'root',      default_price: 40,  unit: '250g', brand: 'Fresh', keywords: ['adrak', 'ginger', 'adarak', 'sonth'] },
  { id: 109, name: 'Lehsun / Garlic 250g',         category: 'sabzi', subcategory: 'root',      default_price: 50,  unit: '250g', brand: 'Fresh', keywords: ['lehsun', 'lahsun', 'garlic', 'lassan'] },
  { id: 110, name: 'Bhindi / Okra 500g',           category: 'sabzi', subcategory: 'other_veg', default_price: 40,  unit: '500g', brand: 'Fresh', keywords: ['bhindi', 'bhindi', 'okra', 'lady finger', 'ladyfinger', 'bheendi'] },
  { id: 111, name: 'Phool Gobhi / Cauliflower 1pc', category: 'sabzi', subcategory: 'other_veg', default_price: 30, unit: '1pc', brand: 'Fresh', keywords: ['gobhi', 'gobi', 'cauliflower', 'phool gobhi', 'fool gobi'] },
  { id: 112, name: 'Patta Gobhi / Cabbage 1pc',    category: 'sabzi', subcategory: 'leafy',     default_price: 25,  unit: '1pc', brand: 'Fresh', keywords: ['patta gobhi', 'band gobhi', 'cabbage', 'patta gobi'] },
  { id: 113, name: 'Palak / Spinach 1 bunch',      category: 'sabzi', subcategory: 'leafy',     default_price: 15,  unit: '1 bunch', brand: 'Fresh', keywords: ['palak', 'spinach', 'saag'] },
  { id: 114, name: 'Lauki / Bottle Gourd 1pc',     category: 'sabzi', subcategory: 'gourd',     default_price: 30,  unit: '1pc', brand: 'Fresh', keywords: ['lauki', 'louki', 'bottle gourd', 'ghiya', 'doodhi', 'kaddu'] },
  { id: 115, name: 'Tori / Ridge Gourd 500g',      category: 'sabzi', subcategory: 'gourd',     default_price: 30,  unit: '500g', brand: 'Fresh', keywords: ['tori', 'turai', 'ridge gourd', 'torai'] },
  { id: 116, name: 'Baingan / Brinjal 500g',       category: 'sabzi', subcategory: 'other_veg', default_price: 25,  unit: '500g', brand: 'Fresh', keywords: ['baingan', 'brinjal', 'eggplant', 'baigan', 'vangi'] },
  { id: 117, name: 'Shimla Mirch / Capsicum 250g', category: 'sabzi', subcategory: 'other_veg', default_price: 25,  unit: '250g', brand: 'Fresh', keywords: ['shimla mirch', 'capsicum', 'bell pepper', 'simla mirch'] },
  { id: 118, name: 'Matar / Green Peas 500g',      category: 'sabzi', subcategory: 'other_veg', default_price: 50,  unit: '500g', brand: 'Fresh', keywords: ['matar', 'mutter', 'peas', 'green peas', 'mattar'] },
  { id: 119, name: 'Gajar / Carrot 500g',          category: 'sabzi', subcategory: 'root',      default_price: 30,  unit: '500g', brand: 'Fresh', keywords: ['gajar', 'carrot', 'gaajar'] },
  { id: 120, name: 'Mooli / Radish 500g',          category: 'sabzi', subcategory: 'root',      default_price: 15,  unit: '500g', brand: 'Fresh', keywords: ['mooli', 'muli', 'radish', 'daikon'] },
  { id: 121, name: 'Kakdi / Cucumber 500g',        category: 'sabzi', subcategory: 'other_veg', default_price: 20,  unit: '500g', brand: 'Fresh', keywords: ['kakdi', 'kheera', 'cucumber', 'kira'] },
  { id: 122, name: 'Karela / Bitter Gourd 500g',   category: 'sabzi', subcategory: 'gourd',     default_price: 35,  unit: '500g', brand: 'Fresh', keywords: ['karela', 'bitter gourd', 'karele'] },
  { id: 123, name: 'Arbi / Colocasia 500g',        category: 'sabzi', subcategory: 'root',      default_price: 40,  unit: '500g', brand: 'Fresh', keywords: ['arbi', 'arvi', 'colocasia', 'taro'] },
  { id: 124, name: 'Sem / Flat Beans 250g',        category: 'sabzi', subcategory: 'other_veg', default_price: 25,  unit: '250g', brand: 'Fresh', keywords: ['sem', 'sem phali', 'flat beans', 'papdi'] },
  { id: 125, name: 'Methi / Fenugreek Leaves 1 bunch', category: 'sabzi', subcategory: 'leafy', default_price: 10, unit: '1 bunch', brand: 'Fresh', keywords: ['methi', 'fenugreek', 'methi patta'] },
  { id: 126, name: 'Hara Dhania / Coriander 1 bunch',  category: 'sabzi', subcategory: 'leafy', default_price: 10, unit: '1 bunch', brand: 'Fresh', keywords: ['dhania', 'coriander', 'cilantro', 'hara dhania', 'dhaniya'] },
  { id: 127, name: 'Pudina / Mint 1 bunch',        category: 'sabzi', subcategory: 'leafy',     default_price: 10,  unit: '1 bunch', brand: 'Fresh', keywords: ['pudina', 'mint', 'podina'] },
  { id: 128, name: 'Nimbu / Lemon 250g',           category: 'sabzi', subcategory: 'other_veg', default_price: 20,  unit: '250g', brand: 'Fresh', keywords: ['nimbu', 'lemon', 'nimbo', 'neembu', 'lime'] },
  { id: 129, name: 'Kaddu / Pumpkin 1kg',          category: 'sabzi', subcategory: 'gourd',     default_price: 25,  unit: '1kg', brand: 'Fresh', keywords: ['kaddu', 'pumpkin', 'petha', 'sitaphal'] },
  { id: 130, name: 'Parwal / Pointed Gourd 500g',  category: 'sabzi', subcategory: 'gourd',     default_price: 40,  unit: '500g', brand: 'Fresh', keywords: ['parwal', 'parval', 'pointed gourd', 'patol'] },
  { id: 131, name: 'Lal Mirch (Dry) 100g',         category: 'sabzi', subcategory: 'other_veg', default_price: 40,  unit: '100g', brand: 'Fresh', keywords: ['lal mirch', 'dry red chilli', 'sukhi mirch', 'sabut mirch'] },
  { id: 132, name: 'Curry Patta / Curry Leaves 1 bunch', category: 'sabzi', subcategory: 'leafy', default_price: 10, unit: '1 bunch', brand: 'Fresh', keywords: ['curry patta', 'curry leaves', 'kadi patta', 'meetha neem'] },
  { id: 133, name: 'Mushroom 200g',                category: 'sabzi', subcategory: 'other_veg', default_price: 40,  unit: '200g', brand: 'Fresh', keywords: ['mushroom', 'khumbi', 'guchhi', 'button mushroom'] },


  // ═══════════════════════════════════════════════════════════
  //  4. FRUITS  (~18 items)
  // ═══════════════════════════════════════════════════════════

  { id: 134, name: 'Kela / Banana 1 dozen',        category: 'fruits', subcategory: 'everyday', default_price: 50,  unit: '1 dozen', brand: 'Fresh', keywords: ['kela', 'banana', 'kele', 'kele'] },
  { id: 135, name: 'Seb / Apple 1kg',              category: 'fruits', subcategory: 'everyday', default_price: 180, unit: '1kg', brand: 'Fresh', keywords: ['seb', 'apple', 'sev', 'saib'] },
  { id: 136, name: 'Santra / Orange 1kg',          category: 'fruits', subcategory: 'everyday', default_price: 80,  unit: '1kg', brand: 'Fresh', keywords: ['santra', 'narangi', 'orange', 'santara', 'mosambi'] },
  { id: 137, name: 'Mosambi / Sweet Lime 1kg',     category: 'fruits', subcategory: 'everyday', default_price: 70,  unit: '1kg', brand: 'Fresh', keywords: ['mosambi', 'sweet lime', 'mousambi', 'mausambi'] },
  { id: 138, name: 'Papita / Papaya 1kg',          category: 'fruits', subcategory: 'everyday', default_price: 40,  unit: '1kg', brand: 'Fresh', keywords: ['papita', 'papaya', 'papeeta'] },
  { id: 139, name: 'Aam / Mango 1kg',              category: 'fruits', subcategory: 'seasonal', default_price: 120, unit: '1kg', brand: 'Fresh', keywords: ['aam', 'mango', 'aam', 'keri', 'hapus', 'dussehri', 'langda'] },
  { id: 140, name: 'Angoor / Grapes 500g',         category: 'fruits', subcategory: 'seasonal', default_price: 60,  unit: '500g', brand: 'Fresh', keywords: ['angoor', 'grapes', 'angur', 'dakh'] },
  { id: 141, name: 'Tarbooz / Watermelon 1pc',     category: 'fruits', subcategory: 'seasonal', default_price: 60,  unit: '1pc', brand: 'Fresh', keywords: ['tarbooz', 'watermelon', 'tarbuz', 'tarbuj'] },
  { id: 142, name: 'Kharbooja / Muskmelon 1pc',    category: 'fruits', subcategory: 'seasonal', default_price: 50,  unit: '1pc', brand: 'Fresh', keywords: ['kharbooja', 'muskmelon', 'kharbuja', 'kharbooj'] },
  { id: 143, name: 'Amrood / Guava 1kg',           category: 'fruits', subcategory: 'everyday', default_price: 60,  unit: '1kg', brand: 'Fresh', keywords: ['amrood', 'guava', 'amrud', 'peru'] },
  { id: 144, name: 'Ananas / Pineapple 1pc',       category: 'fruits', subcategory: 'everyday', default_price: 50,  unit: '1pc', brand: 'Fresh', keywords: ['ananas', 'pineapple', 'anannas'] },
  { id: 145, name: 'Nashpati / Pear 1kg',          category: 'fruits', subcategory: 'seasonal', default_price: 120, unit: '1kg', brand: 'Fresh', keywords: ['nashpati', 'pear', 'nashpathi', 'babbugosha'] },
  { id: 146, name: 'Anar / Pomegranate 1kg',       category: 'fruits', subcategory: 'everyday', default_price: 200, unit: '1kg', brand: 'Fresh', keywords: ['anar', 'pomegranate', 'annar', 'daadim'] },
  { id: 147, name: 'Chiku / Sapodilla 1kg',        category: 'fruits', subcategory: 'everyday', default_price: 80,  unit: '1kg', brand: 'Fresh', keywords: ['chiku', 'sapota', 'sapodilla', 'cheeku', 'chikoo'] },
  { id: 148, name: 'Kiwi 3pcs',                    category: 'fruits', subcategory: 'exotic',   default_price: 120, unit: '3pcs', brand: 'Fresh', keywords: ['kiwi', 'kivi', 'chinese gooseberry'] },
  { id: 149, name: 'Strawberry 200g',              category: 'fruits', subcategory: 'exotic',   default_price: 100, unit: '200g', brand: 'Fresh', keywords: ['strawberry', 'strawberries', 'stroberi'] },
  { id: 150, name: 'Nimbu / Lemon 500g',           category: 'fruits', subcategory: 'everyday', default_price: 40,  unit: '500g', brand: 'Fresh', keywords: ['nimbu', 'lemon', 'lime', 'neembu'] },
  { id: 151, name: 'Nariyal / Coconut 1pc',        category: 'fruits', subcategory: 'everyday', default_price: 35,  unit: '1pc', brand: 'Fresh', keywords: ['nariyal', 'coconut', 'khopra', 'nariyal'] },


  // ═══════════════════════════════════════════════════════════
  //  5. HOUSEHOLD & CLEANING  (~35 items)
  // ═══════════════════════════════════════════════════════════

  // ── Detergent ─────────────────────────────────────────────
  { id: 152, name: 'Surf Excel Easy Wash 500g',    category: 'household', subcategory: 'detergent', default_price: 95,  unit: '500g', brand: 'Surf Excel',  keywords: ['surf', 'surf excel', 'detergent', 'kapde dhone', 'washing powder', 'surf exel'] },
  { id: 153, name: 'Surf Excel Easy Wash 1kg',     category: 'household', subcategory: 'detergent', default_price: 175, unit: '1kg',  brand: 'Surf Excel',  keywords: ['surf', 'surf excel', 'detergent', 'kapde dhone', 'washing powder'] },
  { id: 154, name: 'Surf Excel Easy Wash 2kg',     category: 'household', subcategory: 'detergent', default_price: 330, unit: '2kg',  brand: 'Surf Excel',  keywords: ['surf', 'surf excel', 'detergent', 'kapde dhone'] },
  { id: 155, name: 'Rin Detergent Bar 250g',       category: 'household', subcategory: 'detergent', default_price: 25,  unit: '250g', brand: 'Rin',         keywords: ['rin', 'bar', 'detergent', 'sabun', 'kapde', 'washing bar'] },
  { id: 156, name: 'Tide Detergent Powder 1kg',    category: 'household', subcategory: 'detergent', default_price: 145, unit: '1kg',  brand: 'Tide',        keywords: ['tide', 'detergent', 'washing powder', 'taid'] },
  { id: 157, name: 'Tide Detergent Powder 500g',   category: 'household', subcategory: 'detergent', default_price: 78,  unit: '500g', brand: 'Tide',        keywords: ['tide', 'detergent', 'washing powder'] },
  { id: 158, name: 'Ghadi Detergent Powder 1kg',   category: 'household', subcategory: 'detergent', default_price: 70,  unit: '1kg',  brand: 'Ghadi',       keywords: ['ghadi', 'detergent', 'washing powder'] },
  { id: 159, name: 'Comfort Fabric Conditioner 200ml', category: 'household', subcategory: 'detergent', default_price: 55, unit: '200ml', brand: 'Comfort', keywords: ['comfort', 'fabric conditioner', 'softener'] },

  // ── Dishwash ──────────────────────────────────────────────
  { id: 160, name: 'Vim Dishwash Bar 200g',        category: 'household', subcategory: 'dishwash', default_price: 25,  unit: '200g', brand: 'Vim',   keywords: ['vim', 'bartan', 'dishwash', 'dish', 'bar', 'sabun'] },
  { id: 161, name: 'Vim Dishwash Gel 500ml',       category: 'household', subcategory: 'dishwash', default_price: 110, unit: '500ml', brand: 'Vim',  keywords: ['vim', 'liquid', 'dishwash', 'bartan', 'gel'] },
  { id: 162, name: 'Pril Dishwash Liquid 500ml',   category: 'household', subcategory: 'dishwash', default_price: 120, unit: '500ml', brand: 'Pril', keywords: ['pril', 'dishwash', 'liquid', 'bartan'] },

  // ── Toilet & Floor Cleaners ───────────────────────────────
  { id: 163, name: 'Harpic Power Plus 500ml',      category: 'household', subcategory: 'toilet_cleaner', default_price: 110, unit: '500ml', brand: 'Harpic', keywords: ['harpic', 'toilet cleaner', 'sandaas', 'latrine'] },
  { id: 164, name: 'Harpic Power Plus 1L',         category: 'household', subcategory: 'toilet_cleaner', default_price: 185, unit: '1L',    brand: 'Harpic', keywords: ['harpic', 'toilet cleaner', 'sandaas'] },
  { id: 165, name: 'Lizol Floor Cleaner 500ml',    category: 'household', subcategory: 'floor_cleaner',  default_price: 115, unit: '500ml', brand: 'Lizol',  keywords: ['lizol', 'floor cleaner', 'farsh', 'disinfectant'] },
  { id: 166, name: 'Lizol Floor Cleaner 1L',       category: 'household', subcategory: 'floor_cleaner',  default_price: 200, unit: '1L',    brand: 'Lizol',  keywords: ['lizol', 'floor cleaner', 'farsh'] },
  { id: 167, name: 'Domex Toilet Cleaner 500ml',   category: 'household', subcategory: 'toilet_cleaner', default_price: 95,  unit: '500ml', brand: 'Domex',  keywords: ['domex', 'toilet cleaner', 'bleach'] },
  { id: 168, name: 'Colin Glass Cleaner 500ml',    category: 'household', subcategory: 'floor_cleaner',  default_price: 100, unit: '500ml', brand: 'Colin',  keywords: ['colin', 'glass cleaner', 'sheeshe', 'mirror'] },
  { id: 169, name: 'Phenyl 1L',                    category: 'household', subcategory: 'floor_cleaner',  default_price: 55,  unit: '1L',    brand: 'Local',  keywords: ['phenyl', 'phenol', 'feniyl', 'floor cleaner'] },

  // ── Insecticide ───────────────────────────────────────────
  { id: 170, name: 'Hit Spray (Flying) 200ml',     category: 'household', subcategory: 'insecticide', default_price: 120, unit: '200ml', brand: 'Hit',     keywords: ['hit', 'spray', 'machhar', 'makhi', 'insecticide'] },
  { id: 171, name: 'Hit Spray (Crawling) 200ml',   category: 'household', subcategory: 'insecticide', default_price: 125, unit: '200ml', brand: 'Hit',     keywords: ['hit', 'spray', 'cockroach', 'keeda'] },
  { id: 172, name: 'All Out Liquid Refill 45ml',   category: 'household', subcategory: 'insecticide', default_price: 52,  unit: '45ml',  brand: 'All Out', keywords: ['all out', 'allout', 'machhar', 'mosquito', 'refill'] },
  { id: 173, name: 'Good Knight Liquid Refill 45ml', category: 'household', subcategory: 'insecticide', default_price: 50, unit: '45ml', brand: 'Good Knight', keywords: ['good knight', 'goodnight', 'machhar', 'mosquito'] },
  { id: 174, name: 'Mortein Coil (10 pcs)',        category: 'household', subcategory: 'insecticide', default_price: 40,  unit: '10pcs', brand: 'Mortein',  keywords: ['mortein', 'coil', 'machhar', 'agarbatti type'] },

  // ── Kitchen Supplies ──────────────────────────────────────
  { id: 175, name: 'Garbage Bags (30 pcs)',         category: 'household', subcategory: 'kitchen_supplies', default_price: 60,  unit: '30pcs', brand: 'Local', keywords: ['garbage bags', 'dustbin bags', 'kachre ki theli', 'polythene'] },
  { id: 176, name: 'Aluminium Foil 9m',            category: 'household', subcategory: 'kitchen_supplies', default_price: 80,  unit: '9m',    brand: 'Hindalco', keywords: ['aluminium foil', 'foil', 'silver paper', 'aluminium'] },
  { id: 177, name: 'Cling Wrap 30m',               category: 'household', subcategory: 'kitchen_supplies', default_price: 90,  unit: '30m',   brand: 'Local', keywords: ['cling wrap', 'plastic wrap', 'food wrap'] },
  { id: 178, name: 'Paper Napkins (100 pcs)',       category: 'household', subcategory: 'kitchen_supplies', default_price: 40,  unit: '100pcs', brand: 'Local', keywords: ['napkins', 'tissue', 'paper napkins', 'rumaal'] },
  { id: 179, name: 'Steel Scrubber (3 pcs)',        category: 'household', subcategory: 'kitchen_supplies', default_price: 30,  unit: '3pcs',  brand: 'Local', keywords: ['scrubber', 'steel scrubber', 'juna', 'bartan dhone'] },
  { id: 180, name: 'Scotch-Brite Scrub Pad 1pc',   category: 'household', subcategory: 'kitchen_supplies', default_price: 30,  unit: '1pc',   brand: 'Scotch-Brite', keywords: ['scotch brite', 'sponge', 'scrub pad', 'bartan'] },
  { id: 181, name: 'Jhadoo / Grass Broom 1pc',     category: 'household', subcategory: 'misc_household', default_price: 50,  unit: '1pc', brand: 'Local', keywords: ['jhadoo', 'jhadu', 'broom', 'jharu'] },
  { id: 182, name: 'Pocha / Floor Mop 1pc',        category: 'household', subcategory: 'misc_household', default_price: 80,  unit: '1pc', brand: 'Local', keywords: ['pocha', 'mop', 'pochha', 'floor mop'] },

  // ── Pooja & Misc ──────────────────────────────────────────
  { id: 183, name: 'Matchbox (10 boxes)',           category: 'household', subcategory: 'misc_household', default_price: 12,  unit: '10pcs', brand: 'Ship',  keywords: ['matchbox', 'maachis', 'match', 'dibbi'] },
  { id: 184, name: 'Candles (6 pcs)',               category: 'household', subcategory: 'misc_household', default_price: 20,  unit: '6pcs',  brand: 'Local', keywords: ['candle', 'mombatti', 'candles'] },
  { id: 185, name: 'Agarbatti / Incense Sticks 120pcs', category: 'household', subcategory: 'pooja', default_price: 60, unit: '120pcs', brand: 'Cycle', keywords: ['agarbatti', 'incense', 'dhoop', 'pooja', 'puja'] },
  { id: 186, name: 'Camphor / Kapoor 50g',         category: 'household', subcategory: 'pooja', default_price: 50,  unit: '50g',   brand: 'Local', keywords: ['kapoor', 'camphor', 'kapur', 'pooja'] },


  // ═══════════════════════════════════════════════════════════
  //  6. PERSONAL CARE  (~30 items)
  // ═══════════════════════════════════════════════════════════

  // ── Soap ──────────────────────────────────────────────────
  { id: 187, name: 'Lux Soap 100g',                category: 'personal_care', subcategory: 'soap', default_price: 42,  unit: '100g', brand: 'Lux',       keywords: ['lux', 'soap', 'sabun', 'nahane ka', 'bath soap'] },
  { id: 188, name: 'Dettol Soap 75g',              category: 'personal_care', subcategory: 'soap', default_price: 40,  unit: '75g',  brand: 'Dettol',    keywords: ['dettol', 'soap', 'sabun', 'antiseptic', 'dettol soap'] },
  { id: 189, name: 'Lifebuoy Soap 100g',           category: 'personal_care', subcategory: 'soap', default_price: 35,  unit: '100g', brand: 'Lifebuoy',  keywords: ['lifebuoy', 'soap', 'sabun', 'lifeboy', 'laifboy'] },
  { id: 190, name: 'Dove Soap 100g',               category: 'personal_care', subcategory: 'soap', default_price: 62,  unit: '100g', brand: 'Dove',      keywords: ['dove', 'soap', 'sabun', 'moisturizing'] },
  { id: 191, name: 'Cinthol Soap 100g',            category: 'personal_care', subcategory: 'soap', default_price: 38,  unit: '100g', brand: 'Cinthol',   keywords: ['cinthol', 'soap', 'sabun'] },
  { id: 192, name: 'Pears Soap 75g',               category: 'personal_care', subcategory: 'soap', default_price: 55,  unit: '75g',  brand: 'Pears',     keywords: ['pears', 'soap', 'sabun', 'glycerin'] },

  // ── Shampoo ───────────────────────────────────────────────
  { id: 193, name: 'Clinic Plus Shampoo 340ml',    category: 'personal_care', subcategory: 'shampoo', default_price: 190, unit: '340ml', brand: 'Clinic Plus', keywords: ['shampoo', 'clinic plus', 'baal dhone', 'hair wash'] },
  { id: 194, name: 'Head & Shoulders Shampoo 180ml', category: 'personal_care', subcategory: 'shampoo', default_price: 200, unit: '180ml', brand: 'Head & Shoulders', keywords: ['head and shoulders', 'shampoo', 'dandruff', 'rusi', 'h&s'] },
  { id: 195, name: 'Pantene Shampoo 180ml',        category: 'personal_care', subcategory: 'shampoo', default_price: 185, unit: '180ml', brand: 'Pantene',    keywords: ['pantene', 'shampoo', 'pantine'] },
  { id: 196, name: 'Dove Shampoo 180ml',           category: 'personal_care', subcategory: 'shampoo', default_price: 195, unit: '180ml', brand: 'Dove',       keywords: ['dove', 'shampoo'] },
  { id: 197, name: 'Shampoo Sachet (Re 1) x10',   category: 'personal_care', subcategory: 'shampoo', default_price: 10,  unit: '10pcs', brand: 'Various',   keywords: ['sachet', 'shampoo', 'chota packet'] },

  // ── Toothpaste & Brush ────────────────────────────────────
  { id: 198, name: 'Colgate Strong Teeth 100g',    category: 'personal_care', subcategory: 'toothpaste', default_price: 55,  unit: '100g', brand: 'Colgate',   keywords: ['colgate', 'toothpaste', 'daant', 'manjan', 'tooth paste'] },
  { id: 199, name: 'Colgate Strong Teeth 200g',    category: 'personal_care', subcategory: 'toothpaste', default_price: 100, unit: '200g', brand: 'Colgate',   keywords: ['colgate', 'toothpaste', 'daant', 'manjan'] },
  { id: 200, name: 'Colgate MaxFresh 80g',         category: 'personal_care', subcategory: 'toothpaste', default_price: 70,  unit: '80g',  brand: 'Colgate',   keywords: ['colgate', 'maxfresh', 'toothpaste', 'gel'] },
  { id: 201, name: 'Pepsodent Toothpaste 200g',    category: 'personal_care', subcategory: 'toothpaste', default_price: 92,  unit: '200g', brand: 'Pepsodent', keywords: ['pepsodent', 'toothpaste', 'daant'] },
  { id: 202, name: 'Colgate Toothbrush (1 pc)',    category: 'personal_care', subcategory: 'toothbrush', default_price: 30,  unit: '1pc',  brand: 'Colgate',   keywords: ['toothbrush', 'brush', 'daant', 'colgate', 'tooth brush'] },
  { id: 203, name: 'Oral-B Toothbrush (1 pc)',     category: 'personal_care', subcategory: 'toothbrush', default_price: 40,  unit: '1pc',  brand: 'Oral-B',    keywords: ['oral b', 'toothbrush', 'brush'] },

  // ── Hair Oil ──────────────────────────────────────────────
  { id: 204, name: 'Parachute Coconut Oil 200ml',  category: 'personal_care', subcategory: 'hair_oil', default_price: 100, unit: '200ml', brand: 'Parachute', keywords: ['parachute', 'nariyal tel', 'coconut oil', 'hair oil', 'tel'] },
  { id: 205, name: 'Parachute Coconut Oil 500ml',  category: 'personal_care', subcategory: 'hair_oil', default_price: 225, unit: '500ml', brand: 'Parachute', keywords: ['parachute', 'nariyal tel', 'coconut oil', 'hair oil'] },
  { id: 206, name: 'Dabur Amla Hair Oil 200ml',    category: 'personal_care', subcategory: 'hair_oil', default_price: 95,  unit: '200ml', brand: 'Dabur',     keywords: ['dabur amla', 'amla', 'hair oil', 'tel', 'baalon ka tel'] },
  { id: 207, name: 'Bajaj Almond Drops 200ml',     category: 'personal_care', subcategory: 'hair_oil', default_price: 120, unit: '200ml', brand: 'Bajaj',     keywords: ['bajaj', 'almond drops', 'almond oil', 'hair oil', 'badam'] },

  // ── Face Care ─────────────────────────────────────────────
  { id: 208, name: 'Himalaya Neem Face Wash 100ml', category: 'personal_care', subcategory: 'face_care', default_price: 115, unit: '100ml', brand: 'Himalaya', keywords: ['face wash', 'himalaya', 'neem', 'chehre ka'] },
  { id: 209, name: 'Garnier Men Face Wash 100ml',  category: 'personal_care', subcategory: 'face_care', default_price: 160, unit: '100ml', brand: 'Garnier',   keywords: ['face wash', 'garnier', 'men', 'chehre ka'] },
  { id: 210, name: 'Fair & Lovely (Glow & Lovely) 50g', category: 'personal_care', subcategory: 'face_care', default_price: 95, unit: '50g', brand: 'Glow & Lovely', keywords: ['fair and lovely', 'glow lovely', 'cream', 'face cream'] },

  // ── Razor / Shaving ───────────────────────────────────────
  { id: 211, name: 'Gillette Guard Razor',          category: 'personal_care', subcategory: 'razor', default_price: 55,  unit: '1pc',  brand: 'Gillette',  keywords: ['razor', 'blade', 'shaving', 'gillette', 'ustra'] },
  { id: 212, name: 'Gillette Guard Cartridge (3pc)', category: 'personal_care', subcategory: 'razor', default_price: 90, unit: '3pcs', brand: 'Gillette',  keywords: ['cartridge', 'blade', 'razor', 'gillette'] },

  // ── Feminine Hygiene ──────────────────────────────────────
  { id: 213, name: 'Whisper Choice Wings (6 pads)', category: 'personal_care', subcategory: 'feminine_hygiene', default_price: 42,  unit: '6pcs',  brand: 'Whisper',   keywords: ['whisper', 'pad', 'sanitary', 'napkin', 'periods'] },
  { id: 214, name: 'Stayfree Secure (8 pads)',     category: 'personal_care', subcategory: 'feminine_hygiene', default_price: 55,  unit: '8pcs',  brand: 'Stayfree',  keywords: ['stayfree', 'pad', 'sanitary', 'napkin'] },

  // ── Antiseptic / Skin Care ────────────────────────────────
  { id: 215, name: 'Dettol Antiseptic Liquid 120ml', category: 'personal_care', subcategory: 'antiseptic', default_price: 65, unit: '120ml', brand: 'Dettol', keywords: ['dettol', 'antiseptic', 'liquid', 'dettol liquid'] },
  { id: 216, name: 'Vaseline Petroleum Jelly 85g', category: 'personal_care', subcategory: 'skin_care', default_price: 95,  unit: '85g',  brand: 'Vaseline',  keywords: ['vaseline', 'petroleum jelly', 'jelly', 'vasline'] },
  { id: 217, name: 'Nivea Cream 60ml',             category: 'personal_care', subcategory: 'skin_care', default_price: 100, unit: '60ml', brand: 'Nivea',     keywords: ['nivea', 'cream', 'moisturizer', 'nivia'] },
  { id: 218, name: 'Boroline Cream 20g',           category: 'personal_care', subcategory: 'skin_care', default_price: 35,  unit: '20g',  brand: 'Boroline',  keywords: ['boroline', 'antiseptic cream', 'borolin'] },


  // ═══════════════════════════════════════════════════════════
  //  7. SNACKS & BISCUITS  (~25 items)
  // ═══════════════════════════════════════════════════════════

  // ── Noodles ───────────────────────────────────────────────
  { id: 219, name: 'Maggi 2-Minute Noodles (single)', category: 'snacks', subcategory: 'noodles', default_price: 14,  unit: '1pc',  brand: 'Maggi',     keywords: ['maggi', 'noodles', 'noodle', 'maggii', 'instant noodles'] },
  { id: 220, name: 'Maggi 2-Minute Noodles (4-pack)', category: 'snacks', subcategory: 'noodles', default_price: 52,  unit: '4pcs', brand: 'Maggi',     keywords: ['maggi', 'noodles', 'family pack', 'maggii'] },
  { id: 221, name: 'Yippee Noodles (single)',      category: 'snacks', subcategory: 'noodles', default_price: 14,  unit: '1pc',  brand: 'Sunfeast',  keywords: ['yippee', 'noodles', 'yipee', 'sunfeast'] },
  { id: 222, name: 'Maggi Masala (6-pack)',        category: 'snacks', subcategory: 'noodles', default_price: 78,  unit: '6pcs', brand: 'Maggi',     keywords: ['maggi', 'noodles', '6 pack'] },

  // ── Biscuits ──────────────────────────────────────────────
  { id: 223, name: 'Parle-G Biscuit 250g',         category: 'snacks', subcategory: 'biscuits', default_price: 25,  unit: '250g', brand: 'Parle',     keywords: ['parle g', 'parle-g', 'biscuit', 'glucose', 'parleg', 'biskut'] },
  { id: 224, name: 'Parle-G Biscuit (Family Pack) 800g', category: 'snacks', subcategory: 'biscuits', default_price: 60, unit: '800g', brand: 'Parle',  keywords: ['parle g', 'parle-g', 'biscuit', 'family pack'] },
  { id: 225, name: 'Britannia Marie Gold 250g',    category: 'snacks', subcategory: 'biscuits', default_price: 35,  unit: '250g', brand: 'Britannia', keywords: ['marie', 'marie gold', 'biscuit', 'britannia', 'mari', 'mari gold'] },
  { id: 226, name: 'Britannia Good Day 250g',      category: 'snacks', subcategory: 'biscuits', default_price: 40,  unit: '250g', brand: 'Britannia', keywords: ['good day', 'biscuit', 'cookies', 'britannia'] },
  { id: 227, name: 'Britannia Bourbon 150g',       category: 'snacks', subcategory: 'biscuits', default_price: 30,  unit: '150g', brand: 'Britannia', keywords: ['bourbon', 'biscuit', 'chocolate', 'cream', 'britannia'] },
  { id: 228, name: 'Cadbury Oreo 120g',            category: 'snacks', subcategory: 'biscuits', default_price: 30,  unit: '120g', brand: 'Cadbury',   keywords: ['oreo', 'biscuit', 'chocolate', 'cream', 'cadbury'] },
  { id: 229, name: 'Sunfeast Dark Fantasy 75g',    category: 'snacks', subcategory: 'biscuits', default_price: 30,  unit: '75g',  brand: 'Sunfeast',  keywords: ['dark fantasy', 'biscuit', 'choco', 'sunfeast'] },
  { id: 230, name: 'Tiger Krunch Biscuit 250g',    category: 'snacks', subcategory: 'biscuits', default_price: 25,  unit: '250g', brand: 'Britannia', keywords: ['tiger', 'biscuit', 'krunch', 'britannia'] },

  // ── Chips & Namkeen ───────────────────────────────────────
  { id: 231, name: 'Lays Classic Salted 52g',      category: 'snacks', subcategory: 'chips', default_price: 20,  unit: '52g',  brand: 'Lays',       keywords: ['lays', 'chips', 'crisps', 'aloo chips', 'layz'] },
  { id: 232, name: 'Lays Magic Masala 52g',        category: 'snacks', subcategory: 'chips', default_price: 20,  unit: '52g',  brand: 'Lays',       keywords: ['lays', 'chips', 'magic masala', 'layz'] },
  { id: 233, name: 'Lays Large Pack 130g',         category: 'snacks', subcategory: 'chips', default_price: 50,  unit: '130g', brand: 'Lays',       keywords: ['lays', 'chips', 'large', 'bada packet'] },
  { id: 234, name: 'Kurkure Masala Munch 90g',     category: 'snacks', subcategory: 'chips', default_price: 20,  unit: '90g',  brand: 'Kurkure',    keywords: ['kurkure', 'snack', 'masala', 'kurkurey'] },
  { id: 235, name: 'Uncle Chips 55g',              category: 'snacks', subcategory: 'chips', default_price: 20,  unit: '55g',  brand: 'Uncle Chips', keywords: ['uncle chips', 'chips', 'unkle chips'] },
  { id: 236, name: 'Haldiram Bhujia 200g',         category: 'snacks', subcategory: 'namkeen', default_price: 55, unit: '200g', brand: 'Haldiram',  keywords: ['bhujia', 'namkeen', 'haldiram', 'haldirams', 'bikaneri'] },
  { id: 237, name: 'Haldiram Navratan Mix 200g',   category: 'snacks', subcategory: 'namkeen', default_price: 60, unit: '200g', brand: 'Haldiram',  keywords: ['namkeen', 'mixture', 'navratan', 'haldiram'] },
  { id: 238, name: 'Haldiram Aloo Bhujia 200g',    category: 'snacks', subcategory: 'namkeen', default_price: 50, unit: '200g', brand: 'Haldiram',  keywords: ['aloo bhujia', 'namkeen', 'haldiram', 'potato'] },
  { id: 239, name: 'Haldiram Moong Dal 200g',      category: 'snacks', subcategory: 'namkeen', default_price: 50, unit: '200g', brand: 'Haldiram',  keywords: ['moong dal namkeen', 'haldiram', 'fried moong'] },

  // ── Chocolates ────────────────────────────────────────────
  { id: 240, name: 'Cadbury Dairy Milk (13.2g)',    category: 'snacks', subcategory: 'chocolate', default_price: 10,  unit: '13.2g', brand: 'Cadbury',  keywords: ['dairy milk', 'chocolate', 'cadbury', 'dairymilk'] },
  { id: 241, name: 'Cadbury Dairy Milk Silk 60g',  category: 'snacks', subcategory: 'chocolate', default_price: 90,  unit: '60g',   brand: 'Cadbury',  keywords: ['dairy milk silk', 'chocolate', 'cadbury', 'silk'] },
  { id: 242, name: 'Cadbury 5 Star 40g',           category: 'snacks', subcategory: 'chocolate', default_price: 30,  unit: '40g',  brand: 'Cadbury',   keywords: ['5 star', 'five star', 'chocolate', 'cadbury'] },
  { id: 243, name: 'Nestle KitKat 36.5g',          category: 'snacks', subcategory: 'chocolate', default_price: 30,  unit: '36.5g', brand: 'Nestle',   keywords: ['kitkat', 'kit kat', 'chocolate', 'nestle', 'kitket'] },
  { id: 244, name: 'Cadbury Perk 15g',             category: 'snacks', subcategory: 'chocolate', default_price: 10,  unit: '15g',  brand: 'Cadbury',   keywords: ['perk', 'chocolate', 'cadbury', 'wafer'] },

  // ── Rusks ─────────────────────────────────────────────────
  { id: 245, name: 'Britannia Toast Rusk 300g',    category: 'snacks', subcategory: 'rusks', default_price: 42,  unit: '300g', brand: 'Britannia', keywords: ['rusk', 'toast', 'britannia', 'tost', 'suji rusk'] },


  // ═══════════════════════════════════════════════════════════
  //  8. BEVERAGES  (~28 items)
  // ═══════════════════════════════════════════════════════════

  // ── Tea ───────────────────────────────────────────────────
  { id: 246, name: 'Tata Tea Gold 250g',           category: 'beverages', subcategory: 'tea', default_price: 110, unit: '250g', brand: 'Tata Tea',  keywords: ['chai', 'tea', 'tata tea', 'chai patti', 'patti'] },
  { id: 247, name: 'Tata Tea Gold 500g',           category: 'beverages', subcategory: 'tea', default_price: 210, unit: '500g', brand: 'Tata Tea',  keywords: ['chai', 'tea', 'tata tea', 'chai patti'] },
  { id: 248, name: 'Brooke Bond Red Label 250g',   category: 'beverages', subcategory: 'tea', default_price: 100, unit: '250g', brand: 'Brooke Bond', keywords: ['red label', 'chai', 'tea', 'brooke bond'] },
  { id: 249, name: 'Brooke Bond Red Label 500g',   category: 'beverages', subcategory: 'tea', default_price: 195, unit: '500g', brand: 'Brooke Bond', keywords: ['red label', 'chai', 'tea', 'brooke bond'] },
  { id: 250, name: 'Taj Mahal Tea 250g',           category: 'beverages', subcategory: 'tea', default_price: 145, unit: '250g', brand: 'Brooke Bond', keywords: ['taj mahal', 'chai', 'tea', 'premium'] },
  { id: 251, name: 'Wagh Bakri Tea 250g',          category: 'beverages', subcategory: 'tea', default_price: 100, unit: '250g', brand: 'Wagh Bakri', keywords: ['wagh bakri', 'chai', 'tea', 'waghbakri'] },
  { id: 252, name: 'Society Tea 250g',             category: 'beverages', subcategory: 'tea', default_price: 115, unit: '250g', brand: 'Society',    keywords: ['society', 'chai', 'tea'] },

  // ── Coffee ────────────────────────────────────────────────
  { id: 253, name: 'Nescafe Classic 50g',          category: 'beverages', subcategory: 'coffee', default_price: 140, unit: '50g',  brand: 'Nescafe', keywords: ['nescafe', 'coffee', 'instant coffee', 'nescaffe'] },
  { id: 254, name: 'Nescafe Classic 100g',         category: 'beverages', subcategory: 'coffee', default_price: 260, unit: '100g', brand: 'Nescafe', keywords: ['nescafe', 'coffee', 'instant coffee'] },
  { id: 255, name: 'Nescafe Classic 200g',         category: 'beverages', subcategory: 'coffee', default_price: 485, unit: '200g', brand: 'Nescafe', keywords: ['nescafe', 'coffee', 'instant coffee'] },
  { id: 256, name: 'Bru Instant Coffee 50g',       category: 'beverages', subcategory: 'coffee', default_price: 120, unit: '50g',  brand: 'Bru',     keywords: ['bru', 'coffee', 'instant', 'broo'] },
  { id: 257, name: 'Bru Instant Coffee 100g',      category: 'beverages', subcategory: 'coffee', default_price: 215, unit: '100g', brand: 'Bru',     keywords: ['bru', 'coffee', 'instant'] },

  // ── Cold Drinks ───────────────────────────────────────────
  { id: 258, name: 'Coca-Cola 750ml',              category: 'beverages', subcategory: 'cold_drinks', default_price: 38,  unit: '750ml', brand: 'Coca-Cola', keywords: ['coca cola', 'coke', 'cold drink', 'cola', 'cocacola', 'thanda'] },
  { id: 259, name: 'Coca-Cola 2L',                 category: 'beverages', subcategory: 'cold_drinks', default_price: 95,  unit: '2L',    brand: 'Coca-Cola', keywords: ['coca cola', 'coke', 'cold drink', 'cola', 'family pack'] },
  { id: 260, name: 'Pepsi 750ml',                  category: 'beverages', subcategory: 'cold_drinks', default_price: 38,  unit: '750ml', brand: 'Pepsi',     keywords: ['pepsi', 'cold drink', 'cola', 'thanda'] },
  { id: 261, name: 'Sprite 750ml',                 category: 'beverages', subcategory: 'cold_drinks', default_price: 38,  unit: '750ml', brand: 'Sprite',    keywords: ['sprite', 'lemon', 'cold drink', 'nimbu soda'] },
  { id: 262, name: 'Thums Up 750ml',               category: 'beverages', subcategory: 'cold_drinks', default_price: 38,  unit: '750ml', brand: 'Thums Up',  keywords: ['thums up', 'thumsup', 'cold drink', 'cola', 'thumps up'] },
  { id: 263, name: 'Limca 750ml',                  category: 'beverages', subcategory: 'cold_drinks', default_price: 38,  unit: '750ml', brand: 'Limca',     keywords: ['limca', 'lemon', 'cold drink', 'nimbu'] },
  { id: 264, name: 'Maaza 600ml',                  category: 'beverages', subcategory: 'cold_drinks', default_price: 35,  unit: '600ml', brand: 'Maaza',     keywords: ['maaza', 'mango', 'cold drink', 'aam', 'maza'] },
  { id: 265, name: 'Frooti 600ml',                 category: 'beverages', subcategory: 'cold_drinks', default_price: 30,  unit: '600ml', brand: 'Frooti',    keywords: ['frooti', 'mango', 'fruti', 'fruiti', 'aam'] },
  { id: 266, name: 'Frooti Tetra Pack 200ml',      category: 'beverages', subcategory: 'cold_drinks', default_price: 10,  unit: '200ml', brand: 'Frooti',    keywords: ['frooti', 'mango', 'tetra', 'chota'] },
  { id: 267, name: 'Mountain Dew 750ml',           category: 'beverages', subcategory: 'cold_drinks', default_price: 38,  unit: '750ml', brand: 'Mountain Dew', keywords: ['mountain dew', 'dew', 'cold drink'] },

  // ── Water ─────────────────────────────────────────────────
  { id: 268, name: 'Bisleri Water 1L',             category: 'beverages', subcategory: 'water', default_price: 20,  unit: '1L',  brand: 'Bisleri',   keywords: ['bisleri', 'water', 'paani', 'mineral water', 'pani'] },
  { id: 269, name: 'Bisleri Water 5L',             category: 'beverages', subcategory: 'water', default_price: 40,  unit: '5L',  brand: 'Bisleri',   keywords: ['bisleri', 'water', 'paani', 'can'] },
  { id: 270, name: 'Aquafina Water 1L',            category: 'beverages', subcategory: 'water', default_price: 20,  unit: '1L',  brand: 'Aquafina',  keywords: ['aquafina', 'water', 'paani'] },
  { id: 271, name: 'Kinley Water 1L',              category: 'beverages', subcategory: 'water', default_price: 20,  unit: '1L',  brand: 'Kinley',    keywords: ['kinley', 'water', 'paani'] },

  // ── Juice & Sharbat ───────────────────────────────────────
  { id: 272, name: 'Real Mango Juice 1L',          category: 'beverages', subcategory: 'juice', default_price: 100, unit: '1L',  brand: 'Real',      keywords: ['real', 'juice', 'mango', 'aam', 'ras'] },
  { id: 273, name: 'Real Mixed Fruit Juice 1L',    category: 'beverages', subcategory: 'juice', default_price: 100, unit: '1L',  brand: 'Real',      keywords: ['real', 'juice', 'mixed fruit'] },
  { id: 274, name: 'Tropicana Orange Juice 1L',    category: 'beverages', subcategory: 'juice', default_price: 110, unit: '1L',  brand: 'Tropicana', keywords: ['tropicana', 'juice', 'orange', 'santra'] },
  { id: 275, name: 'Rooh Afza 750ml',              category: 'beverages', subcategory: 'sharbat', default_price: 145, unit: '750ml', brand: 'Hamdard', keywords: ['rooh afza', 'roohafza', 'sharbat', 'ruh afza', 'sherbat'] },
  { id: 276, name: 'Glucon-D Orange 500g',         category: 'beverages', subcategory: 'energy_drink', default_price: 145, unit: '500g', brand: 'Glucon-D', keywords: ['glucon d', 'glucon-d', 'glucose', 'energy', 'glukon'] },
  { id: 277, name: 'Glucon-D Regular 100g',        category: 'beverages', subcategory: 'energy_drink', default_price: 32, unit: '100g', brand: 'Glucon-D',  keywords: ['glucon d', 'glucose', 'energy'] },
  { id: 278, name: 'Tang Orange 500g',             category: 'beverages', subcategory: 'juice', default_price: 140, unit: '500g', brand: 'Tang',      keywords: ['tang', 'orange', 'instant drink', 'powder'] },


  // ═══════════════════════════════════════════════════════════
  //  9. PHARMACY / OTC  (~18 items)
  // ═══════════════════════════════════════════════════════════

  { id: 279, name: 'Crocin 500mg (15 tablets)',    category: 'pharmacy', subcategory: 'pain_relief', default_price: 30,  unit: '15 tab', brand: 'GSK',       keywords: ['crocin', 'paracetamol', 'bukhar', 'fever', 'dard', 'pain', 'tablet'] },
  { id: 280, name: 'Dolo 650mg (15 tablets)',      category: 'pharmacy', subcategory: 'pain_relief', default_price: 32,  unit: '15 tab', brand: 'Micro Labs', keywords: ['dolo', 'paracetamol', 'bukhar', 'fever', 'pain', '650'] },
  { id: 281, name: 'Disprin (10 tablets)',          category: 'pharmacy', subcategory: 'pain_relief', default_price: 18,  unit: '10 tab', brand: 'Reckitt',   keywords: ['disprin', 'aspirin', 'sir dard', 'headache', 'pain'] },
  { id: 282, name: 'Combiflam (10 tablets)',       category: 'pharmacy', subcategory: 'pain_relief', default_price: 32,  unit: '10 tab', brand: 'Sanofi',    keywords: ['combiflam', 'pain', 'dard', 'body ache'] },
  { id: 283, name: 'Vicks VapoRub 25g',            category: 'pharmacy', subcategory: 'cold_cough', default_price: 75,  unit: '25g',    brand: 'Vicks',     keywords: ['vicks', 'vaporub', 'cold', 'jukham', 'baalm', 'sardi'] },
  { id: 284, name: 'Vicks VapoRub 50g',            category: 'pharmacy', subcategory: 'cold_cough', default_price: 140, unit: '50g',    brand: 'Vicks',     keywords: ['vicks', 'vaporub', 'cold', 'jukham'] },
  { id: 285, name: 'Vicks Cough Drops (20 pcs)',   category: 'pharmacy', subcategory: 'cold_cough', default_price: 20,  unit: '20pcs',  brand: 'Vicks',     keywords: ['vicks', 'cough drops', 'khansi', 'goli', 'throat'] },
  { id: 286, name: 'Strepsils (8 lozenges)',       category: 'pharmacy', subcategory: 'cold_cough', default_price: 50,  unit: '8pcs',   brand: 'Reckitt',   keywords: ['strepsils', 'throat', 'gale ki goli', 'lozenge'] },
  { id: 287, name: 'Burnol Cream 20g',             category: 'pharmacy', subcategory: 'first_aid', default_price: 50,  unit: '20g',    brand: 'Dr. Morepen', keywords: ['burnol', 'burn', 'jalane', 'cream'] },
  { id: 288, name: 'Band-Aid (10 strips)',         category: 'pharmacy', subcategory: 'first_aid', default_price: 30,  unit: '10pcs',  brand: 'Johnson',   keywords: ['band aid', 'bandaid', 'band-aid', 'patti', 'plaster'] },
  { id: 289, name: 'Cotton Roll 100g',             category: 'pharmacy', subcategory: 'first_aid', default_price: 35,  unit: '100g',   brand: 'Local',     keywords: ['cotton', 'rui', 'surgical cotton', 'rooi'] },
  { id: 290, name: 'ORS Sachet (Pack of 5)',       category: 'pharmacy', subcategory: 'digestive', default_price: 25,  unit: '5pcs',   brand: 'Electral',  keywords: ['ors', 'electral', 'dehydration', 'daste', 'loose motion'] },
  { id: 291, name: 'Moov Pain Relief Cream 50g',   category: 'pharmacy', subcategory: 'balm', default_price: 95,  unit: '50g',    brand: 'Moov',      keywords: ['moov', 'pain', 'dard', 'kamar dard', 'back pain'] },
  { id: 292, name: 'Iodex 40g',                    category: 'pharmacy', subcategory: 'balm', default_price: 85,  unit: '40g',    brand: 'GSK',       keywords: ['iodex', 'pain', 'dard', 'muscle pain', 'aaiyodex'] },
  { id: 293, name: 'Volini Spray 40g',             category: 'pharmacy', subcategory: 'balm', default_price: 140, unit: '40g',    brand: 'Sun Pharma', keywords: ['volini', 'spray', 'pain', 'dard', 'muscle'] },
  { id: 294, name: 'Zandu Balm 8ml',               category: 'pharmacy', subcategory: 'balm', default_price: 25,  unit: '8ml',    brand: 'Zandu',     keywords: ['zandu', 'balm', 'sir dard', 'headache', 'baalm'] },
  { id: 295, name: 'Zandu Balm 25ml',              category: 'pharmacy', subcategory: 'balm', default_price: 70,  unit: '25ml',   brand: 'Zandu',     keywords: ['zandu', 'balm', 'sir dard', 'headache'] },
  { id: 296, name: 'Digene Tablets (15 tab)',       category: 'pharmacy', subcategory: 'digestive', default_price: 50,  unit: '15 tab', brand: 'Abbott',    keywords: ['digene', 'acidity', 'gas', 'antacid', 'pet', 'stomach'] },
  { id: 297, name: 'Eno Fruit Salt 5g x 6',        category: 'pharmacy', subcategory: 'digestive', default_price: 30,  unit: '6pcs',   brand: 'GSK',       keywords: ['eno', 'acidity', 'gas', 'antacid', 'pet mein gas'] },
  { id: 298, name: 'Hajmola Regular 120 tab',      category: 'pharmacy', subcategory: 'digestive', default_price: 40,  unit: '120 tab', brand: 'Dabur',    keywords: ['hajmola', 'digestive', 'hazma', 'pachak'] },
  { id: 299, name: 'Pudin Hara 10 capsules',       category: 'pharmacy', subcategory: 'digestive', default_price: 30,  unit: '10 cap', brand: 'Dabur',     keywords: ['pudin hara', 'pudinhara', 'gas', 'indigestion', 'pet dard'] },
  { id: 300, name: 'Dettol Antiseptic Liquid 60ml', category: 'pharmacy', subcategory: 'antiseptic', default_price: 38, unit: '60ml', brand: 'Dettol',     keywords: ['dettol', 'antiseptic', 'wound', 'ghav'] },
  { id: 301, name: 'Betadine 15ml',                category: 'pharmacy', subcategory: 'antiseptic', default_price: 45,  unit: '15ml',  brand: 'Win-Medicare', keywords: ['betadine', 'antiseptic', 'wound', 'iodine'] },
  { id: 302, name: 'Benadryl Cough Syrup 100ml',  category: 'pharmacy', subcategory: 'cold_cough', default_price: 95,  unit: '100ml', brand: 'Johnson',    keywords: ['benadryl', 'cough', 'khansi', 'syrup', 'cold'] },
  { id: 303, name: 'Cough Syrup (Honitus) 100ml',  category: 'pharmacy', subcategory: 'cold_cough', default_price: 80, unit: '100ml', brand: 'Dabur',      keywords: ['honitus', 'cough', 'khansi', 'syrup', 'herbal'] },

];


// ─────────────────────────────────────────────────────────────
//  ID look-up index  (built once on require)
// ─────────────────────────────────────────────────────────────

const _idMap = new Map();
MASTER_CATALOG.forEach((item) => _idMap.set(item.id, item));


// ─────────────────────────────────────────────────────────────
//  searchCatalog(query)
//  Case-insensitive fuzzy search across name + keywords.
//  Returns array of matching items sorted by relevance.
// ─────────────────────────────────────────────────────────────

function searchCatalog(query) {
  if (!query || typeof query !== 'string') return [];

  const q = query.toLowerCase().trim();
  if (q.length === 0) return [];

  const tokens = q.split(/\s+/);

  const scored = [];

  for (const item of MASTER_CATALOG) {
    let score = 0;
    const nameLower = item.name.toLowerCase();
    const brandLower = (item.brand || '').toLowerCase();
    const allKeywords = item.keywords.map((k) => k.toLowerCase());

    // ── Exact full-query matches (highest priority) ─────────
    if (nameLower === q)                          score += 100;
    if (nameLower.includes(q))                    score += 50;
    if (allKeywords.includes(q))                  score += 45;
    if (brandLower === q)                         score += 40;

    // ── Per-token matching ──────────────────────────────────
    for (const tok of tokens) {
      if (tok.length === 0) continue;

      // Name contains token
      if (nameLower.includes(tok))                score += 20;

      // Brand match
      if (brandLower.includes(tok))               score += 15;

      // Keyword exact match
      if (allKeywords.includes(tok))              score += 25;

      // Keyword prefix / substring match (fuzzy)
      for (const kw of allKeywords) {
        if (kw.startsWith(tok))                   score += 10;
        else if (kw.includes(tok))                score += 5;
        else if (tok.length >= 3 && _fuzzyMatch(tok, kw)) score += 3;
      }

      // Subcategory match
      if (item.subcategory && item.subcategory.includes(tok)) score += 8;

      // Category match
      if (item.category.includes(tok))            score += 5;
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  // Sort by descending score, then alphabetical name
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name);
  });

  return scored.map((s) => s.item);
}


/**
 * Simple fuzzy matcher — returns true if `needle` characters appear
 * in `haystack` in order (allows gaps of 1-2 characters).
 * Handles common Hindi transliteration differences (aa↔a, ee↔i, etc.)
 */
function _fuzzyMatch(needle, haystack) {
  if (needle.length < 2 || haystack.length < 2) return false;

  // Levenshtein-lite: if edit distance ≤ 1, it's a match
  if (Math.abs(needle.length - haystack.length) > 2) return false;

  let ni = 0;
  let hi = 0;
  let misses = 0;

  while (ni < needle.length && hi < haystack.length) {
    if (needle[ni] === haystack[hi]) {
      ni++;
      hi++;
    } else {
      misses++;
      if (misses > 2) return false;
      // Try skipping in haystack
      hi++;
    }
  }

  // Must have matched at least 60% of needle chars
  return ni >= needle.length * 0.6;
}


// ─────────────────────────────────────────────────────────────
//  getCatalogByCategory(category)
// ─────────────────────────────────────────────────────────────

function getCatalogByCategory(category) {
  if (!category || typeof category !== 'string') return [];
  const cat = category.toLowerCase().trim();
  return MASTER_CATALOG.filter((item) => item.category === cat);
}


// ─────────────────────────────────────────────────────────────
//  getCatalogItem(id)
// ─────────────────────────────────────────────────────────────

function getCatalogItem(id) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return _idMap.get(numId) || null;
}


// ─────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  MASTER_CATALOG,
  CATEGORIES,
  searchCatalog,
  getCatalogByCategory,
  getCatalogItem,
};
