/* ════════════════════════════════════════════════════════════════
   BAGGALPE MERCHANT DASHBOARD V2 — App Logic
   ════════════════════════════════════════════════════════════════ */

// ─── CONFIG ──────────────────────────────────────────────────────
const API_BASE = '/api/merchant';
let MERCHANT = null; // current merchant state

// ─── MASTER CATALOG (embedded for onboarding) ────────────────────
const CATEGORIES = {
  grocery:       { name: 'Grocery & Staples',      nameHi: 'किराना और अनाज',     icon: '🛒' },
  dairy:         { name: 'Dairy Products',          nameHi: 'डेयरी उत्पाद',        icon: '🥛' },
  sabzi:         { name: 'Vegetables',              nameHi: 'सब्ज़ियाँ',           icon: '🥬' },
  fruits:        { name: 'Fruits',                  nameHi: 'फल',                  icon: '🍎' },
  household:     { name: 'Household & Cleaning',    nameHi: 'घरेलू सामान',         icon: '🧹' },
  personal_care: { name: 'Personal Care',           nameHi: 'व्यक्तिगत देखभाल',    icon: '🧴' },
  snacks:        { name: 'Snacks & Biscuits',       nameHi: 'नाश्ता और बिस्कुट',  icon: '🍪' },
  beverages:     { name: 'Beverages',               nameHi: 'पेय पदार्थ',          icon: '☕' },
  pharmacy:      { name: 'Pharmacy / OTC',          nameHi: 'दवाइयाँ',             icon: '💊' },
};

// Full 300-item master catalog — id, name, category, default_price, unit, brand
const MASTER_CATALOG = [
  // ═══ GROCERY & STAPLES ═══
  {id:1,name:'Ashirvaad Aata 5kg',category:'grocery',default_price:275,unit:'5kg',brand:'Ashirvaad'},
  {id:2,name:'Ashirvaad Aata 10kg',category:'grocery',default_price:520,unit:'10kg',brand:'Ashirvaad'},
  {id:3,name:'Pillsbury Aata 5kg',category:'grocery',default_price:260,unit:'5kg',brand:'Pillsbury'},
  {id:4,name:'Rajdhani Aata 5kg',category:'grocery',default_price:230,unit:'5kg',brand:'Rajdhani'},
  {id:5,name:'Aata (Loose) 1kg',category:'grocery',default_price:40,unit:'1kg',brand:'Local'},
  {id:6,name:'India Gate Basmati Rice 1kg',category:'grocery',default_price:180,unit:'1kg',brand:'India Gate'},
  {id:7,name:'India Gate Basmati Rice 5kg',category:'grocery',default_price:780,unit:'5kg',brand:'India Gate'},
  {id:8,name:'Daawat Basmati Rice 1kg',category:'grocery',default_price:170,unit:'1kg',brand:'Daawat'},
  {id:9,name:'Daawat Basmati Rice 5kg',category:'grocery',default_price:720,unit:'5kg',brand:'Daawat'},
  {id:10,name:'Mogra Rice (Broken Basmati) 1kg',category:'grocery',default_price:60,unit:'1kg',brand:'Local'},
  {id:11,name:'Non-Basmati Rice 1kg',category:'grocery',default_price:50,unit:'1kg',brand:'Local'},
  {id:12,name:'Non-Basmati Rice 5kg',category:'grocery',default_price:230,unit:'5kg',brand:'Local'},
  {id:13,name:'Toor Dal 1kg',category:'grocery',default_price:170,unit:'1kg',brand:'Tata Sampann'},
  {id:14,name:'Toor Dal 500g',category:'grocery',default_price:90,unit:'500g',brand:'Local'},
  {id:15,name:'Moong Dal 1kg',category:'grocery',default_price:160,unit:'1kg',brand:'Local'},
  {id:16,name:'Moong Dal 500g',category:'grocery',default_price:85,unit:'500g',brand:'Local'},
  {id:17,name:'Chana Dal 1kg',category:'grocery',default_price:120,unit:'1kg',brand:'Local'},
  {id:18,name:'Urad Dal 1kg',category:'grocery',default_price:175,unit:'1kg',brand:'Local'},
  {id:19,name:'Masoor Dal 1kg',category:'grocery',default_price:110,unit:'1kg',brand:'Local'},
  {id:20,name:'Masoor Dal 500g',category:'grocery',default_price:60,unit:'500g',brand:'Local'},
  {id:21,name:'Rajma 1kg',category:'grocery',default_price:180,unit:'1kg',brand:'Local'},
  {id:22,name:'Kabuli Chana 1kg',category:'grocery',default_price:170,unit:'1kg',brand:'Local'},
  {id:23,name:'Moong Sabut 1kg',category:'grocery',default_price:150,unit:'1kg',brand:'Local'},
  {id:24,name:'Moth Dal 1kg',category:'grocery',default_price:140,unit:'1kg',brand:'Local'},
  {id:25,name:'Sugar 1kg',category:'grocery',default_price:48,unit:'1kg',brand:'Local'},
  {id:26,name:'Sugar 5kg',category:'grocery',default_price:230,unit:'5kg',brand:'Local'},
  {id:27,name:'Gur / Jaggery 1kg',category:'grocery',default_price:80,unit:'1kg',brand:'Local'},
  {id:28,name:'Mishri / Rock Sugar 250g',category:'grocery',default_price:55,unit:'250g',brand:'Local'},
  {id:29,name:'Fortune Refined Soyabean Oil 1L',category:'grocery',default_price:155,unit:'1L',brand:'Fortune'},
  {id:30,name:'Fortune Refined Soyabean Oil 5L',category:'grocery',default_price:700,unit:'5L',brand:'Fortune'},
  {id:31,name:'Fortune Sunflower Oil 1L',category:'grocery',default_price:165,unit:'1L',brand:'Fortune'},
  {id:32,name:'Mustard Oil (Kachi Ghani) 1L',category:'grocery',default_price:190,unit:'1L',brand:'Engine'},
  {id:33,name:'Mustard Oil 5L',category:'grocery',default_price:850,unit:'5L',brand:'Engine'},
  {id:34,name:'Groundnut Oil 1L',category:'grocery',default_price:230,unit:'1L',brand:'Gulab'},
  {id:35,name:'Figaro Olive Oil 200ml',category:'grocery',default_price:260,unit:'200ml',brand:'Figaro'},
  {id:36,name:'Saffola Gold Oil 1L',category:'grocery',default_price:200,unit:'1L',brand:'Saffola'},
  {id:37,name:'Amul Ghee 500ml',category:'grocery',default_price:310,unit:'500ml',brand:'Amul'},
  {id:38,name:'Amul Ghee 1L',category:'grocery',default_price:590,unit:'1L',brand:'Amul'},
  {id:39,name:'Patanjali Cow Ghee 500ml',category:'grocery',default_price:340,unit:'500ml',brand:'Patanjali'},
  {id:40,name:'Besan 500g',category:'grocery',default_price:60,unit:'500g',brand:'Rajdhani'},
  {id:41,name:'Besan 1kg',category:'grocery',default_price:110,unit:'1kg',brand:'Rajdhani'},
  {id:42,name:'Sooji / Rava 500g',category:'grocery',default_price:38,unit:'500g',brand:'Local'},
  {id:43,name:'Sooji / Rava 1kg',category:'grocery',default_price:68,unit:'1kg',brand:'Local'},
  {id:44,name:'Maida 1kg',category:'grocery',default_price:45,unit:'1kg',brand:'Local'},
  {id:45,name:'Poha (Thick) 500g',category:'grocery',default_price:35,unit:'500g',brand:'Local'},
  {id:46,name:'Daliya / Broken Wheat 500g',category:'grocery',default_price:35,unit:'500g',brand:'Local'},
  {id:47,name:'Tata Salt 1kg',category:'grocery',default_price:28,unit:'1kg',brand:'Tata'},
  {id:48,name:'Tata Rock Salt 1kg',category:'grocery',default_price:32,unit:'1kg',brand:'Tata'},
  {id:49,name:'Black Salt 200g',category:'grocery',default_price:25,unit:'200g',brand:'Local'},
  {id:50,name:'MDH Haldi Powder 100g',category:'grocery',default_price:52,unit:'100g',brand:'MDH'},
  {id:51,name:'MDH Lal Mirch Powder 100g',category:'grocery',default_price:70,unit:'100g',brand:'MDH'},
  {id:52,name:'MDH Jeera (Cumin) 100g',category:'grocery',default_price:90,unit:'100g',brand:'MDH'},
  {id:53,name:'MDH Dhania Powder 100g',category:'grocery',default_price:52,unit:'100g',brand:'MDH'},
  {id:54,name:'MDH Garam Masala 100g',category:'grocery',default_price:95,unit:'100g',brand:'MDH'},
  {id:55,name:'MDH Kitchen King 100g',category:'grocery',default_price:80,unit:'100g',brand:'MDH'},
  {id:56,name:'MDH Chana Masala 100g',category:'grocery',default_price:68,unit:'100g',brand:'MDH'},
  {id:57,name:'MDH Pav Bhaji Masala 100g',category:'grocery',default_price:72,unit:'100g',brand:'MDH'},
  {id:58,name:'MDH Biryani Masala 50g',category:'grocery',default_price:60,unit:'50g',brand:'MDH'},
  {id:59,name:'Everest Sambhar Masala 100g',category:'grocery',default_price:68,unit:'100g',brand:'Everest'},
  {id:60,name:'Sabut Jeera 200g',category:'grocery',default_price:90,unit:'200g',brand:'Local'},
  {id:61,name:'Sabut Dhania 200g',category:'grocery',default_price:45,unit:'200g',brand:'Local'},
  {id:62,name:'Rai / Sarson (Mustard Seeds) 200g',category:'grocery',default_price:35,unit:'200g',brand:'Local'},
  {id:63,name:'Kali Mirch (Black Pepper) 50g',category:'grocery',default_price:75,unit:'50g',brand:'Local'},
  {id:64,name:'Ajwain 100g',category:'grocery',default_price:40,unit:'100g',brand:'Local'},
  {id:65,name:'Methi Dana 200g',category:'grocery',default_price:38,unit:'200g',brand:'Local'},
  {id:66,name:'Hing (Asafoetida) 10g',category:'grocery',default_price:65,unit:'10g',brand:'LG'},
  {id:67,name:'Hing (Asafoetida) 50g',category:'grocery',default_price:250,unit:'50g',brand:'LG'},
  {id:68,name:'Tej Patta (Bay Leaf) 50g',category:'grocery',default_price:25,unit:'50g',brand:'Local'},
  {id:69,name:'Dalchini (Cinnamon) 50g',category:'grocery',default_price:40,unit:'50g',brand:'Local'},
  {id:70,name:'Laung (Cloves) 25g',category:'grocery',default_price:60,unit:'25g',brand:'Local'},
  {id:71,name:'Elaichi (Cardamom) 25g',category:'grocery',default_price:80,unit:'25g',brand:'Local'},
  {id:72,name:'Kasuri Methi 25g',category:'grocery',default_price:30,unit:'25g',brand:'Local'},
  {id:73,name:'Amchur Powder 100g',category:'grocery',default_price:40,unit:'100g',brand:'Local'},
  {id:74,name:'Lijjat Papad 200g',category:'grocery',default_price:60,unit:'200g',brand:'Lijjat'},
  {id:75,name:'Moong Papad 200g',category:'grocery',default_price:55,unit:'200g',brand:'Local'},
  {id:76,name:"Mother's Recipe Mango Pickle 300g",category:'grocery',default_price:85,unit:'300g',brand:"Mother's Recipe"},
  {id:77,name:'Mixed Pickle 400g',category:'grocery',default_price:95,unit:'400g',brand:'Local'},
  {id:78,name:'Sev / Vermicelli 200g',category:'grocery',default_price:30,unit:'200g',brand:'Bambino'},
  {id:79,name:'Sabudana 500g',category:'grocery',default_price:55,unit:'500g',brand:'Local'},
  {id:80,name:'Cornflour 200g',category:'grocery',default_price:40,unit:'200g',brand:'Brown & Polson'},
  {id:81,name:'Maggi Masala-ae-Magic 72g',category:'grocery',default_price:25,unit:'72g',brand:'Maggi'},
  {id:82,name:'Catch Sprinklers Chat Masala 100g',category:'grocery',default_price:50,unit:'100g',brand:'Catch'},
  {id:83,name:'MTR Sambar Powder 200g',category:'grocery',default_price:75,unit:'200g',brand:'MTR'},
  {id:84,name:'Soya Chunks 200g',category:'grocery',default_price:50,unit:'200g',brand:'Nutrela'},
  {id:85,name:'Honey 250g',category:'grocery',default_price:175,unit:'250g',brand:'Dabur'},

  // ═══ DAIRY ═══
  {id:86,name:'Saras Full Cream Milk 1L',category:'dairy',default_price:68,unit:'1L',brand:'Saras'},
  {id:87,name:'Saras Full Cream Milk 500ml',category:'dairy',default_price:35,unit:'500ml',brand:'Saras'},
  {id:88,name:'Saras Toned Milk 1L',category:'dairy',default_price:56,unit:'1L',brand:'Saras'},
  {id:89,name:'Saras Double Toned Milk 1L',category:'dairy',default_price:50,unit:'1L',brand:'Saras'},
  {id:90,name:'Amul Butter 100g',category:'dairy',default_price:56,unit:'100g',brand:'Amul'},
  {id:91,name:'Amul Butter 500g',category:'dairy',default_price:270,unit:'500g',brand:'Amul'},
  {id:92,name:'Paneer 200g',category:'dairy',default_price:90,unit:'200g',brand:'Amul'},
  {id:93,name:'Paneer 1kg',category:'dairy',default_price:400,unit:'1kg',brand:'Local'},
  {id:94,name:'Dahi / Curd 400g',category:'dairy',default_price:35,unit:'400g',brand:'Saras'},
  {id:95,name:'Dahi / Curd 1kg',category:'dairy',default_price:80,unit:'1kg',brand:'Saras'},
  {id:96,name:'Amul Cheese Slices 100g',category:'dairy',default_price:95,unit:'100g',brand:'Amul'},
  {id:97,name:'Amul Cheese Block 200g',category:'dairy',default_price:120,unit:'200g',brand:'Amul'},
  {id:98,name:'Amul Fresh Cream 200ml',category:'dairy',default_price:55,unit:'200ml',brand:'Amul'},
  {id:99,name:'Chaas / Buttermilk 200ml',category:'dairy',default_price:15,unit:'200ml',brand:'Amul'},
  {id:100,name:'Amul Masti Chaas 1L',category:'dairy',default_price:40,unit:'1L',brand:'Amul'},
  {id:101,name:'Amul Lassi 200ml',category:'dairy',default_price:25,unit:'200ml',brand:'Amul'},
  {id:102,name:'Condensed Milk (Milkmaid) 400g',category:'dairy',default_price:155,unit:'400g',brand:'Milkmaid'},
  {id:103,name:'Amul Masti Dahi 1kg',category:'dairy',default_price:85,unit:'1kg',brand:'Amul'},

  // ═══ SABZI / VEGETABLES ═══
  {id:104,name:'Tamatar / Tomato 1kg',category:'sabzi',default_price:40,unit:'1kg',brand:'Fresh'},
  {id:105,name:'Pyaaz / Onion 1kg',category:'sabzi',default_price:35,unit:'1kg',brand:'Fresh'},
  {id:106,name:'Aloo / Potato 1kg',category:'sabzi',default_price:30,unit:'1kg',brand:'Fresh'},
  {id:107,name:'Hari Mirch / Green Chilli 100g',category:'sabzi',default_price:10,unit:'100g',brand:'Fresh'},
  {id:108,name:'Adrak / Ginger 250g',category:'sabzi',default_price:40,unit:'250g',brand:'Fresh'},
  {id:109,name:'Lehsun / Garlic 250g',category:'sabzi',default_price:50,unit:'250g',brand:'Fresh'},
  {id:110,name:'Bhindi / Okra 500g',category:'sabzi',default_price:40,unit:'500g',brand:'Fresh'},
  {id:111,name:'Phool Gobhi / Cauliflower 1pc',category:'sabzi',default_price:30,unit:'1pc',brand:'Fresh'},
  {id:112,name:'Patta Gobhi / Cabbage 1pc',category:'sabzi',default_price:25,unit:'1pc',brand:'Fresh'},
  {id:113,name:'Palak / Spinach 1 bunch',category:'sabzi',default_price:15,unit:'1 bunch',brand:'Fresh'},
  {id:114,name:'Lauki / Bottle Gourd 1pc',category:'sabzi',default_price:30,unit:'1pc',brand:'Fresh'},
  {id:115,name:'Tori / Ridge Gourd 500g',category:'sabzi',default_price:30,unit:'500g',brand:'Fresh'},
  {id:116,name:'Baingan / Brinjal 500g',category:'sabzi',default_price:25,unit:'500g',brand:'Fresh'},
  {id:117,name:'Shimla Mirch / Capsicum 250g',category:'sabzi',default_price:25,unit:'250g',brand:'Fresh'},
  {id:118,name:'Matar / Green Peas 500g',category:'sabzi',default_price:50,unit:'500g',brand:'Fresh'},
  {id:119,name:'Gajar / Carrot 500g',category:'sabzi',default_price:30,unit:'500g',brand:'Fresh'},
  {id:120,name:'Mooli / Radish 500g',category:'sabzi',default_price:15,unit:'500g',brand:'Fresh'},
  {id:121,name:'Kakdi / Cucumber 500g',category:'sabzi',default_price:20,unit:'500g',brand:'Fresh'},
  {id:122,name:'Karela / Bitter Gourd 500g',category:'sabzi',default_price:35,unit:'500g',brand:'Fresh'},
  {id:123,name:'Arbi / Colocasia 500g',category:'sabzi',default_price:40,unit:'500g',brand:'Fresh'},
  {id:124,name:'Sem / Flat Beans 250g',category:'sabzi',default_price:25,unit:'250g',brand:'Fresh'},
  {id:125,name:'Methi / Fenugreek Leaves 1 bunch',category:'sabzi',default_price:10,unit:'1 bunch',brand:'Fresh'},
  {id:126,name:'Hara Dhania / Coriander 1 bunch',category:'sabzi',default_price:10,unit:'1 bunch',brand:'Fresh'},
  {id:127,name:'Pudina / Mint 1 bunch',category:'sabzi',default_price:10,unit:'1 bunch',brand:'Fresh'},
  {id:128,name:'Nimbu / Lemon 250g',category:'sabzi',default_price:20,unit:'250g',brand:'Fresh'},
  {id:129,name:'Kaddu / Pumpkin 1kg',category:'sabzi',default_price:25,unit:'1kg',brand:'Fresh'},
  {id:130,name:'Parwal / Pointed Gourd 500g',category:'sabzi',default_price:40,unit:'500g',brand:'Fresh'},
  {id:131,name:'Lal Mirch (Dry) 100g',category:'sabzi',default_price:40,unit:'100g',brand:'Fresh'},
  {id:132,name:'Curry Patta / Curry Leaves 1 bunch',category:'sabzi',default_price:10,unit:'1 bunch',brand:'Fresh'},
  {id:133,name:'Mushroom 200g',category:'sabzi',default_price:40,unit:'200g',brand:'Fresh'},

  // ═══ FRUITS ═══
  {id:134,name:'Kela / Banana 1 dozen',category:'fruits',default_price:50,unit:'1 dozen',brand:'Fresh'},
  {id:135,name:'Seb / Apple 1kg',category:'fruits',default_price:180,unit:'1kg',brand:'Fresh'},
  {id:136,name:'Santra / Orange 1kg',category:'fruits',default_price:80,unit:'1kg',brand:'Fresh'},
  {id:137,name:'Mosambi / Sweet Lime 1kg',category:'fruits',default_price:70,unit:'1kg',brand:'Fresh'},
  {id:138,name:'Papita / Papaya 1kg',category:'fruits',default_price:40,unit:'1kg',brand:'Fresh'},
  {id:139,name:'Aam / Mango 1kg',category:'fruits',default_price:120,unit:'1kg',brand:'Fresh'},
  {id:140,name:'Angoor / Grapes 500g',category:'fruits',default_price:60,unit:'500g',brand:'Fresh'},
  {id:141,name:'Tarbooz / Watermelon 1pc',category:'fruits',default_price:60,unit:'1pc',brand:'Fresh'},
  {id:142,name:'Kharbooja / Muskmelon 1pc',category:'fruits',default_price:50,unit:'1pc',brand:'Fresh'},
  {id:143,name:'Amrood / Guava 1kg',category:'fruits',default_price:60,unit:'1kg',brand:'Fresh'},
  {id:144,name:'Ananas / Pineapple 1pc',category:'fruits',default_price:50,unit:'1pc',brand:'Fresh'},
  {id:145,name:'Nashpati / Pear 1kg',category:'fruits',default_price:120,unit:'1kg',brand:'Fresh'},
  {id:146,name:'Anar / Pomegranate 1kg',category:'fruits',default_price:200,unit:'1kg',brand:'Fresh'},
  {id:147,name:'Chiku / Sapodilla 1kg',category:'fruits',default_price:80,unit:'1kg',brand:'Fresh'},
  {id:148,name:'Kiwi 3pcs',category:'fruits',default_price:120,unit:'3pcs',brand:'Fresh'},
  {id:149,name:'Strawberry 200g',category:'fruits',default_price:100,unit:'200g',brand:'Fresh'},
  {id:150,name:'Nimbu / Lemon 500g',category:'fruits',default_price:40,unit:'500g',brand:'Fresh'},
  {id:151,name:'Nariyal / Coconut 1pc',category:'fruits',default_price:35,unit:'1pc',brand:'Fresh'},

  // ═══ HOUSEHOLD & CLEANING ═══
  {id:152,name:'Surf Excel Easy Wash 500g',category:'household',default_price:95,unit:'500g',brand:'Surf Excel'},
  {id:153,name:'Surf Excel Easy Wash 1kg',category:'household',default_price:175,unit:'1kg',brand:'Surf Excel'},
  {id:154,name:'Surf Excel Easy Wash 2kg',category:'household',default_price:330,unit:'2kg',brand:'Surf Excel'},
  {id:155,name:'Rin Detergent Bar 250g',category:'household',default_price:25,unit:'250g',brand:'Rin'},
  {id:156,name:'Tide Detergent Powder 1kg',category:'household',default_price:145,unit:'1kg',brand:'Tide'},
  {id:157,name:'Tide Detergent Powder 500g',category:'household',default_price:78,unit:'500g',brand:'Tide'},
  {id:158,name:'Ghadi Detergent Powder 1kg',category:'household',default_price:70,unit:'1kg',brand:'Ghadi'},
  {id:159,name:'Comfort Fabric Conditioner 200ml',category:'household',default_price:55,unit:'200ml',brand:'Comfort'},
  {id:160,name:'Vim Dishwash Bar 200g',category:'household',default_price:25,unit:'200g',brand:'Vim'},
  {id:161,name:'Vim Dishwash Gel 500ml',category:'household',default_price:110,unit:'500ml',brand:'Vim'},
  {id:162,name:'Pril Dishwash Liquid 500ml',category:'household',default_price:120,unit:'500ml',brand:'Pril'},
  {id:163,name:'Harpic Power Plus 500ml',category:'household',default_price:110,unit:'500ml',brand:'Harpic'},
  {id:164,name:'Harpic Power Plus 1L',category:'household',default_price:185,unit:'1L',brand:'Harpic'},
  {id:165,name:'Lizol Floor Cleaner 500ml',category:'household',default_price:115,unit:'500ml',brand:'Lizol'},
  {id:166,name:'Lizol Floor Cleaner 1L',category:'household',default_price:200,unit:'1L',brand:'Lizol'},
  {id:167,name:'Domex Toilet Cleaner 500ml',category:'household',default_price:95,unit:'500ml',brand:'Domex'},
  {id:168,name:'Colin Glass Cleaner 500ml',category:'household',default_price:100,unit:'500ml',brand:'Colin'},
  {id:169,name:'Phenyl 1L',category:'household',default_price:55,unit:'1L',brand:'Local'},
  {id:170,name:'Hit Spray (Flying) 200ml',category:'household',default_price:120,unit:'200ml',brand:'Hit'},
  {id:171,name:'Hit Spray (Crawling) 200ml',category:'household',default_price:125,unit:'200ml',brand:'Hit'},
  {id:172,name:'All Out Liquid Refill 45ml',category:'household',default_price:52,unit:'45ml',brand:'All Out'},
  {id:173,name:'Good Knight Liquid Refill 45ml',category:'household',default_price:50,unit:'45ml',brand:'Good Knight'},
  {id:174,name:'Mortein Coil (10 pcs)',category:'household',default_price:40,unit:'10pcs',brand:'Mortein'},
  {id:175,name:'Garbage Bags (30 pcs)',category:'household',default_price:60,unit:'30pcs',brand:'Local'},
  {id:176,name:'Aluminium Foil 9m',category:'household',default_price:80,unit:'9m',brand:'Hindalco'},
  {id:177,name:'Cling Wrap 30m',category:'household',default_price:90,unit:'30m',brand:'Local'},
  {id:178,name:'Paper Napkins (100 pcs)',category:'household',default_price:40,unit:'100pcs',brand:'Local'},
  {id:179,name:'Steel Scrubber (3 pcs)',category:'household',default_price:30,unit:'3pcs',brand:'Local'},
  {id:180,name:'Scotch-Brite Scrub Pad 1pc',category:'household',default_price:30,unit:'1pc',brand:'Scotch-Brite'},
  {id:181,name:'Jhadoo / Grass Broom 1pc',category:'household',default_price:50,unit:'1pc',brand:'Local'},
  {id:182,name:'Pocha / Floor Mop 1pc',category:'household',default_price:80,unit:'1pc',brand:'Local'},
  {id:183,name:'Matchbox (10 boxes)',category:'household',default_price:12,unit:'10pcs',brand:'Ship'},
  {id:184,name:'Candles (6 pcs)',category:'household',default_price:20,unit:'6pcs',brand:'Local'},
  {id:185,name:'Agarbatti / Incense Sticks 120pcs',category:'household',default_price:60,unit:'120pcs',brand:'Cycle'},
  {id:186,name:'Camphor / Kapoor 50g',category:'household',default_price:50,unit:'50g',brand:'Local'},

  // ═══ PERSONAL CARE ═══
  {id:187,name:'Lux Soap 100g',category:'personal_care',default_price:42,unit:'100g',brand:'Lux'},
  {id:188,name:'Dettol Soap 75g',category:'personal_care',default_price:40,unit:'75g',brand:'Dettol'},
  {id:189,name:'Lifebuoy Soap 100g',category:'personal_care',default_price:35,unit:'100g',brand:'Lifebuoy'},
  {id:190,name:'Dove Soap 100g',category:'personal_care',default_price:62,unit:'100g',brand:'Dove'},
  {id:191,name:'Cinthol Soap 100g',category:'personal_care',default_price:38,unit:'100g',brand:'Cinthol'},
  {id:192,name:'Pears Soap 75g',category:'personal_care',default_price:55,unit:'75g',brand:'Pears'},
  {id:193,name:'Clinic Plus Shampoo 340ml',category:'personal_care',default_price:190,unit:'340ml',brand:'Clinic Plus'},
  {id:194,name:'Head & Shoulders Shampoo 180ml',category:'personal_care',default_price:200,unit:'180ml',brand:'H&S'},
  {id:195,name:'Pantene Shampoo 180ml',category:'personal_care',default_price:185,unit:'180ml',brand:'Pantene'},
  {id:196,name:'Dove Shampoo 180ml',category:'personal_care',default_price:195,unit:'180ml',brand:'Dove'},
  {id:197,name:'Shampoo Sachet (Re 1) x10',category:'personal_care',default_price:10,unit:'10pcs',brand:'Various'},
  {id:198,name:'Colgate Strong Teeth 100g',category:'personal_care',default_price:55,unit:'100g',brand:'Colgate'},
  {id:199,name:'Colgate Strong Teeth 200g',category:'personal_care',default_price:100,unit:'200g',brand:'Colgate'},
  {id:200,name:'Colgate MaxFresh 80g',category:'personal_care',default_price:70,unit:'80g',brand:'Colgate'},
  {id:201,name:'Pepsodent Toothpaste 200g',category:'personal_care',default_price:92,unit:'200g',brand:'Pepsodent'},
  {id:202,name:'Colgate Toothbrush (1 pc)',category:'personal_care',default_price:30,unit:'1pc',brand:'Colgate'},
  {id:203,name:'Oral-B Toothbrush (1 pc)',category:'personal_care',default_price:40,unit:'1pc',brand:'Oral-B'},
  {id:204,name:'Parachute Coconut Oil 200ml',category:'personal_care',default_price:100,unit:'200ml',brand:'Parachute'},
  {id:205,name:'Parachute Coconut Oil 500ml',category:'personal_care',default_price:225,unit:'500ml',brand:'Parachute'},
  {id:206,name:'Dabur Amla Hair Oil 200ml',category:'personal_care',default_price:95,unit:'200ml',brand:'Dabur'},
  {id:207,name:'Bajaj Almond Drops 200ml',category:'personal_care',default_price:120,unit:'200ml',brand:'Bajaj'},
  {id:208,name:'Himalaya Neem Face Wash 100ml',category:'personal_care',default_price:115,unit:'100ml',brand:'Himalaya'},
  {id:209,name:'Garnier Men Face Wash 100ml',category:'personal_care',default_price:160,unit:'100ml',brand:'Garnier'},
  {id:210,name:'Fair & Lovely (Glow & Lovely) 50g',category:'personal_care',default_price:95,unit:'50g',brand:'Glow & Lovely'},
  {id:211,name:'Gillette Guard Razor',category:'personal_care',default_price:55,unit:'1pc',brand:'Gillette'},
  {id:212,name:'Gillette Guard Cartridge (3pc)',category:'personal_care',default_price:90,unit:'3pcs',brand:'Gillette'},
  {id:213,name:'Whisper Choice Wings (6 pads)',category:'personal_care',default_price:42,unit:'6pcs',brand:'Whisper'},
  {id:214,name:'Stayfree Secure (8 pads)',category:'personal_care',default_price:55,unit:'8pcs',brand:'Stayfree'},
  {id:215,name:'Dettol Antiseptic Liquid 120ml',category:'personal_care',default_price:65,unit:'120ml',brand:'Dettol'},
  {id:216,name:'Vaseline Petroleum Jelly 85g',category:'personal_care',default_price:95,unit:'85g',brand:'Vaseline'},
  {id:217,name:'Nivea Cream 60ml',category:'personal_care',default_price:100,unit:'60ml',brand:'Nivea'},
  {id:218,name:'Boroline Cream 20g',category:'personal_care',default_price:35,unit:'20g',brand:'Boroline'},

  // ═══ SNACKS & BISCUITS ═══
  {id:219,name:'Maggi 2-Minute Noodles (single)',category:'snacks',default_price:14,unit:'1pc',brand:'Maggi'},
  {id:220,name:'Maggi 2-Minute Noodles (4-pack)',category:'snacks',default_price:52,unit:'4pcs',brand:'Maggi'},
  {id:221,name:'Yippee Noodles (single)',category:'snacks',default_price:14,unit:'1pc',brand:'Sunfeast'},
  {id:222,name:'Maggi Masala (6-pack)',category:'snacks',default_price:78,unit:'6pcs',brand:'Maggi'},
  {id:223,name:'Parle-G Biscuit 250g',category:'snacks',default_price:25,unit:'250g',brand:'Parle'},
  {id:224,name:'Parle-G Biscuit (Family Pack) 800g',category:'snacks',default_price:60,unit:'800g',brand:'Parle'},
  {id:225,name:'Britannia Marie Gold 250g',category:'snacks',default_price:35,unit:'250g',brand:'Britannia'},
  {id:226,name:'Britannia Good Day 250g',category:'snacks',default_price:40,unit:'250g',brand:'Britannia'},
  {id:227,name:'Britannia Bourbon 150g',category:'snacks',default_price:30,unit:'150g',brand:'Britannia'},
  {id:228,name:'Cadbury Oreo 120g',category:'snacks',default_price:30,unit:'120g',brand:'Cadbury'},
  {id:229,name:'Sunfeast Dark Fantasy 75g',category:'snacks',default_price:30,unit:'75g',brand:'Sunfeast'},
  {id:230,name:'Tiger Krunch Biscuit 250g',category:'snacks',default_price:25,unit:'250g',brand:'Britannia'},
  {id:231,name:'Lays Classic Salted 52g',category:'snacks',default_price:20,unit:'52g',brand:'Lays'},
  {id:232,name:'Lays Magic Masala 52g',category:'snacks',default_price:20,unit:'52g',brand:'Lays'},
  {id:233,name:'Lays Large Pack 130g',category:'snacks',default_price:50,unit:'130g',brand:'Lays'},
  {id:234,name:'Kurkure Masala Munch 90g',category:'snacks',default_price:20,unit:'90g',brand:'Kurkure'},
  {id:235,name:'Uncle Chips 55g',category:'snacks',default_price:20,unit:'55g',brand:'Uncle Chips'},
  {id:236,name:'Haldiram Bhujia 200g',category:'snacks',default_price:55,unit:'200g',brand:'Haldiram'},
  {id:237,name:'Haldiram Navratan Mix 200g',category:'snacks',default_price:60,unit:'200g',brand:'Haldiram'},
  {id:238,name:'Haldiram Aloo Bhujia 200g',category:'snacks',default_price:50,unit:'200g',brand:'Haldiram'},
  {id:239,name:'Haldiram Moong Dal 200g',category:'snacks',default_price:50,unit:'200g',brand:'Haldiram'},
  {id:240,name:'Cadbury Dairy Milk (13.2g)',category:'snacks',default_price:10,unit:'13.2g',brand:'Cadbury'},
  {id:241,name:'Cadbury Dairy Milk Silk 60g',category:'snacks',default_price:90,unit:'60g',brand:'Cadbury'},
  {id:242,name:'Cadbury 5 Star 40g',category:'snacks',default_price:30,unit:'40g',brand:'Cadbury'},
  {id:243,name:'Nestle KitKat 36.5g',category:'snacks',default_price:30,unit:'36.5g',brand:'Nestle'},
  {id:244,name:'Cadbury Perk 15g',category:'snacks',default_price:10,unit:'15g',brand:'Cadbury'},
  {id:245,name:'Britannia Toast Rusk 300g',category:'snacks',default_price:42,unit:'300g',brand:'Britannia'},

  // ═══ BEVERAGES ═══
  {id:246,name:'Tata Tea Gold 250g',category:'beverages',default_price:110,unit:'250g',brand:'Tata Tea'},
  {id:247,name:'Tata Tea Gold 500g',category:'beverages',default_price:210,unit:'500g',brand:'Tata Tea'},
  {id:248,name:'Brooke Bond Red Label 250g',category:'beverages',default_price:100,unit:'250g',brand:'Brooke Bond'},
  {id:249,name:'Brooke Bond Red Label 500g',category:'beverages',default_price:195,unit:'500g',brand:'Brooke Bond'},
  {id:250,name:'Taj Mahal Tea 250g',category:'beverages',default_price:145,unit:'250g',brand:'Brooke Bond'},
  {id:251,name:'Wagh Bakri Tea 250g',category:'beverages',default_price:100,unit:'250g',brand:'Wagh Bakri'},
  {id:252,name:'Society Tea 250g',category:'beverages',default_price:115,unit:'250g',brand:'Society'},
  {id:253,name:'Nescafe Classic 50g',category:'beverages',default_price:140,unit:'50g',brand:'Nescafe'},
  {id:254,name:'Nescafe Classic 100g',category:'beverages',default_price:260,unit:'100g',brand:'Nescafe'},
  {id:255,name:'Bru Instant Coffee 50g',category:'beverages',default_price:120,unit:'50g',brand:'Bru'},
  {id:256,name:'Coca-Cola 750ml',category:'beverages',default_price:40,unit:'750ml',brand:'Coca-Cola'},
  {id:257,name:'Coca-Cola 2L',category:'beverages',default_price:90,unit:'2L',brand:'Coca-Cola'},
  {id:258,name:'Thums Up 750ml',category:'beverages',default_price:40,unit:'750ml',brand:'Thums Up'},
  {id:259,name:'Sprite 750ml',category:'beverages',default_price:40,unit:'750ml',brand:'Sprite'},
  {id:260,name:'Pepsi 750ml',category:'beverages',default_price:40,unit:'750ml',brand:'Pepsi'},
  {id:261,name:'Limca 750ml',category:'beverages',default_price:40,unit:'750ml',brand:'Limca'},
  {id:262,name:'Maaza 600ml',category:'beverages',default_price:35,unit:'600ml',brand:'Maaza'},
  {id:263,name:'Frooti 600ml',category:'beverages',default_price:30,unit:'600ml',brand:'Frooti'},
  {id:264,name:'Appy Fizz 600ml',category:'beverages',default_price:35,unit:'600ml',brand:'Appy Fizz'},
  {id:265,name:'Bisleri Water 1L',category:'beverages',default_price:20,unit:'1L',brand:'Bisleri'},
  {id:266,name:'Bisleri Water 5L',category:'beverages',default_price:50,unit:'5L',brand:'Bisleri'},
  {id:267,name:'Kinley Water 1L',category:'beverages',default_price:20,unit:'1L',brand:'Kinley'},
  {id:268,name:'Real Fruit Juice 1L',category:'beverages',default_price:110,unit:'1L',brand:'Real'},
  {id:269,name:'Tropicana Juice 1L',category:'beverages',default_price:120,unit:'1L',brand:'Tropicana'},
  {id:270,name:'Rooh Afza 750ml',category:'beverages',default_price:155,unit:'750ml',brand:'Hamdard'},
  {id:271,name:'Rasna (makes 32 glasses)',category:'beverages',default_price:80,unit:'1 pack',brand:'Rasna'},
  {id:272,name:'Red Bull 250ml',category:'beverages',default_price:115,unit:'250ml',brand:'Red Bull'},
  {id:273,name:'Sting Energy Drink 250ml',category:'beverages',default_price:20,unit:'250ml',brand:'Sting'},

  // ═══ PHARMACY / OTC ═══
  {id:274,name:'Crocin 650mg (15 tabs)',category:'pharmacy',default_price:30,unit:'15 tabs',brand:'Crocin'},
  {id:275,name:'Dolo 650mg (15 tabs)',category:'pharmacy',default_price:30,unit:'15 tabs',brand:'Dolo'},
  {id:276,name:'Disprin (10 tabs)',category:'pharmacy',default_price:18,unit:'10 tabs',brand:'Disprin'},
  {id:277,name:'Combiflam (10 tabs)',category:'pharmacy',default_price:35,unit:'10 tabs',brand:'Combiflam'},
  {id:278,name:'Ibuprofen 400mg (10 tabs)',category:'pharmacy',default_price:25,unit:'10 tabs',brand:'Various'},
  {id:279,name:'Vicks Vaporub 25ml',category:'pharmacy',default_price:65,unit:'25ml',brand:'Vicks'},
  {id:280,name:'Vicks Action 500 (10 tabs)',category:'pharmacy',default_price:40,unit:'10 tabs',brand:'Vicks'},
  {id:281,name:'Benadryl Cough Syrup 100ml',category:'pharmacy',default_price:95,unit:'100ml',brand:'Benadryl'},
  {id:282,name:'Strepsils (8 lozenges)',category:'pharmacy',default_price:50,unit:'8pcs',brand:'Strepsils'},
  {id:283,name:'Hajmola (120 tabs)',category:'pharmacy',default_price:50,unit:'120 tabs',brand:'Dabur'},
  {id:284,name:'ENO Sachet (5g)',category:'pharmacy',default_price:10,unit:'5g',brand:'ENO'},
  {id:285,name:'Digene Tablets (15 tabs)',category:'pharmacy',default_price:40,unit:'15 tabs',brand:'Digene'},
  {id:286,name:'Pudin Hara 10 caps',category:'pharmacy',default_price:25,unit:'10 caps',brand:'Dabur'},
  {id:287,name:'Gelusil MPS (15 tabs)',category:'pharmacy',default_price:42,unit:'15 tabs',brand:'Pfizer'},
  {id:288,name:'Imodium 6 caps',category:'pharmacy',default_price:35,unit:'6 caps',brand:'J&J'},
  {id:289,name:'Band-Aid (10 strips)',category:'pharmacy',default_price:30,unit:'10pcs',brand:'J&J'},
  {id:290,name:'Cotton Roll 100g',category:'pharmacy',default_price:35,unit:'100g',brand:'Various'},
  {id:291,name:'ORS Sachets (5 pcs)',category:'pharmacy',default_price:30,unit:'5pcs',brand:'Electral'},
  {id:292,name:'Dettol Antiseptic Cream 15g',category:'pharmacy',default_price:30,unit:'15g',brand:'Dettol'},
  {id:293,name:'Burnol Cream 20g',category:'pharmacy',default_price:55,unit:'20g',brand:'Burnol'},
  {id:294,name:'Zandu Balm 8ml',category:'pharmacy',default_price:25,unit:'8ml',brand:'Zandu'},
  {id:295,name:'Amrutanjan Balm 9ml',category:'pharmacy',default_price:35,unit:'9ml',brand:'Amrutanjan'},
  {id:296,name:'Moov Spray 80g',category:'pharmacy',default_price:195,unit:'80g',brand:'Moov'},
  {id:297,name:'Volini Spray 60g',category:'pharmacy',default_price:200,unit:'60g',brand:'Volini'},
  {id:298,name:'Savlon Antiseptic Liquid 100ml',category:'pharmacy',default_price:45,unit:'100ml',brand:'Savlon'},
  {id:299,name:'Betadine Antiseptic 15ml',category:'pharmacy',default_price:42,unit:'15ml',brand:'Betadine'},
  {id:300,name:'Soframycin Cream 30g',category:'pharmacy',default_price:55,unit:'30g',brand:'Sanofi'},
];


// ─── HELPERS ─────────────────────────────────────────────────────
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span><span>${msg}</span>`;
  $('#toast-container').appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 3000);
}

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (MERCHANT?.id) headers['x-merchant-id'] = MERCHANT.id;
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    toast(err.message, 'error');
    throw err;
  }
}

function switchScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#${id}`).classList.add('active');
}

function switchSection(name) {
  $$('.content-section').forEach(s => s.classList.remove('active'));
  $(`#section-${name}`).classList.add('active');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === name));
  // Close mobile sidebar
  $('#sidebar').classList.remove('open');
  $('#sidebar-overlay').classList.add('hidden');
}


// ═════════════════════════════════════════════════════════════════
//  1. AUTH
// ═════════════════════════════════════════════════════════════════

$('#show-register').addEventListener('click', e => {
  e.preventDefault();
  $('#login-card').classList.add('hidden');
  $('#register-card').classList.remove('hidden');
});

$('#show-login').addEventListener('click', e => {
  e.preventDefault();
  $('#register-card').classList.add('hidden');
  $('#login-card').classList.remove('hidden');
});

// Radius slider
$('#reg-radius').addEventListener('input', e => {
  $('#radius-value').textContent = e.target.value;
});

// Get Location
$('#get-location-btn').addEventListener('click', () => {
  if (!navigator.geolocation) return toast('Geolocation not supported', 'error');
  toast('Getting location...', 'info');
  navigator.geolocation.getCurrentPosition(
    pos => {
      MERCHANT = MERCHANT || {};
      MERCHANT.lat = pos.coords.latitude;
      MERCHANT.lng = pos.coords.longitude;
      toast('Location captured!', 'success');
    },
    () => toast('Location access denied', 'error')
  );
});

// Login
$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const phone = $('#login-phone').value.trim();
  const pin = $('#login-pin').value.trim();
  if (phone.length !== 10) return toast('Enter valid 10-digit phone', 'error');
  if (pin.length !== 4) return toast('Enter 4-digit PIN', 'error');
  try {
    const data = await api('/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin })
    });
    MERCHANT = data.merchant || data;
    toast('Welcome back!', 'success');
    enterDashboard();
  } catch (_e) { /* toast already shown */ }
});

// Register
$('#register-form').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    name: $('#reg-shop-name').value.trim(),
    owner_name: $('#reg-owner-name').value.trim(),
    phone: $('#reg-phone').value.trim(),
    pin: $('#reg-pin').value.trim(),
    address: $('#reg-address').value.trim(),
    city: $('#reg-city').value.trim(),
    pincode: $('#reg-pincode').value.trim(),
    type: $('#reg-shop-type').value,
    delivery_radius_km: parseInt($('#reg-radius').value),
    lat: MERCHANT?.lat || null,
    lng: MERCHANT?.lng || null,
  };
  if (body.phone.length !== 10) return toast('Enter valid 10-digit phone', 'error');
  if (body.pin.length !== 4) return toast('Enter 4-digit PIN', 'error');
  try {
    const data = await api('/register', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    MERCHANT = data.merchant || data;
    toast('Account created!', 'success');
    startOnboarding();
  } catch (_e) { /* toast already shown */ }
});


// ═════════════════════════════════════════════════════════════════
//  2. ONBOARDING WIZARD
// ═════════════════════════════════════════════════════════════════

let selectedCategories = new Set();
let onboardItemState = {}; // { catalogId: { price, in_stock } }

function startOnboarding() {
  switchScreen('onboarding-screen');
  renderCategoryGrid();
}

function renderCategoryGrid() {
  const grid = $('#category-grid');
  grid.innerHTML = '';
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const label = document.createElement('label');
    label.className = 'checkbox-card';
    label.innerHTML = `
      <input type="checkbox" value="${key}" data-cat="${key}">
      <span class="checkbox-mark"></span>
      <span class="cat-icon">${cat.icon}</span>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-name-hi">${cat.nameHi}</span>
    `;
    label.querySelector('input').addEventListener('change', handleCatToggle);
    grid.appendChild(label);
  });
}

function handleCatToggle(e) {
  const key = e.target.dataset.cat;
  const card = e.target.closest('.checkbox-card');
  if (e.target.checked) {
    selectedCategories.add(key);
    card.classList.add('checked');
  } else {
    selectedCategories.delete(key);
    card.classList.remove('checked');
  }
  // Update select-all
  $('#select-all-cats').checked = selectedCategories.size === Object.keys(CATEGORIES).length;
  $('#onboard-next-btn').disabled = selectedCategories.size === 0;
}

$('#select-all-cats').addEventListener('change', e => {
  const checked = e.target.checked;
  $$('#category-grid input[type=checkbox]').forEach(cb => {
    cb.checked = checked;
    const card = cb.closest('.checkbox-card');
    if (checked) {
      selectedCategories.add(cb.dataset.cat);
      card.classList.add('checked');
    } else {
      selectedCategories.delete(cb.dataset.cat);
      card.classList.remove('checked');
    }
  });
  if (checked) {
    e.target.closest('.checkbox-card').classList.add('checked');
  } else {
    e.target.closest('.checkbox-card').classList.remove('checked');
  }
  $('#onboard-next-btn').disabled = selectedCategories.size === 0;
});

// Next → Step 2
$('#onboard-next-btn').addEventListener('click', () => {
  if (selectedCategories.size === 0) return;
  // Init item state
  onboardItemState = {};
  MASTER_CATALOG.filter(i => selectedCategories.has(i.category)).forEach(item => {
    onboardItemState[item.id] = { price: item.default_price, in_stock: 1 };
  });
  // Update stepper
  $$('.step')[0].classList.remove('active');
  $$('.step')[0].classList.add('completed');
  $$('.step')[1].classList.add('active');
  // Switch step
  $('#onboard-step-1').classList.remove('active');
  $('#onboard-step-2').classList.add('active');
  // Render tabs
  renderOnboardTabs();
});

$('#onboard-back-btn').addEventListener('click', () => {
  $$('.step')[1].classList.remove('active');
  $$('.step')[0].classList.remove('completed');
  $$('.step')[0].classList.add('active');
  $('#onboard-step-2').classList.remove('active');
  $('#onboard-step-1').classList.add('active');
});

let activeOnboardCat = null;

function renderOnboardTabs() {
  const tabs = $('#onboard-cat-tabs');
  tabs.innerHTML = '';
  const cats = [...selectedCategories];
  activeOnboardCat = cats[0];
  cats.forEach(key => {
    const tab = document.createElement('button');
    tab.className = `cat-tab ${key === activeOnboardCat ? 'active' : ''}`;
    tab.textContent = `${CATEGORIES[key].icon} ${CATEGORIES[key].name}`;
    tab.addEventListener('click', () => {
      activeOnboardCat = key;
      tabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderOnboardItems();
    });
    tabs.appendChild(tab);
  });
  renderOnboardItems();
}

function renderOnboardItems() {
  const container = $('#onboard-items-container');
  const items = MASTER_CATALOG.filter(i => i.category === activeOnboardCat);
  container.innerHTML = items.map(item => {
    const state = onboardItemState[item.id];
    return `
      <div class="onboard-item">
        <div>
          <div class="onboard-item-name">${item.name}</div>
          <div class="onboard-item-brand">${item.brand}</div>
        </div>
        <input type="number" class="onboard-price-input" value="${state.price}" min="0"
          data-id="${item.id}" onchange="updateOnboardPrice(${item.id}, this.value)">
        <div class="onboard-item-unit">${item.unit}</div>
        <label class="toggle">
          <input type="checkbox" ${state.in_stock ? 'checked' : ''}
            onchange="updateOnboardStock(${item.id}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    `;
  }).join('');
}

window.updateOnboardPrice = (id, val) => {
  if (onboardItemState[id]) onboardItemState[id].price = parseInt(val) || 0;
};
window.updateOnboardStock = (id, checked) => {
  if (onboardItemState[id]) onboardItemState[id].in_stock = checked ? 1 : 0;
};

// Save & Go Live
$('#onboard-save-btn').addEventListener('click', async () => {
  const categories = [...selectedCategories];
  const items = Object.entries(onboardItemState).map(([id, s]) => ({
    catalog_id: parseInt(id),
    price: s.price,
    in_stock: s.in_stock,
  }));
  try {
    await api('/onboard', {
      method: 'POST',
      body: JSON.stringify({ categories, items })
    });
    toast('Store is live! 🚀', 'success');
    enterDashboard();
  } catch (_e) { /* toast already shown */ }
});


// ═════════════════════════════════════════════════════════════════
//  3. DASHBOARD
// ═════════════════════════════════════════════════════════════════

let inventoryItems = [];
let inventoryFilter = 'all';
let inventorySearch = '';

async function enterDashboard() {
  switchScreen('dashboard-screen');
  loadInventory();
  loadOrders();
  loadRequests();
  loadProfile();
}

// ─── SIDEBAR NAVIGATION ──────────────────────────────────────────
$$('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchSection(item.dataset.section));
});

// Mobile menu
$('#menu-toggle').addEventListener('click', () => {
  $('#sidebar').classList.add('open');
  $('#sidebar-overlay').classList.remove('hidden');
});
$('#sidebar-overlay').addEventListener('click', () => {
  $('#sidebar').classList.remove('open');
  $('#sidebar-overlay').classList.add('hidden');
});

// Logout
function handleLogout() {
  MERCHANT = null;
  inventoryItems = [];
  switchScreen('auth-screen');
  toast('Logged out', 'info');
}
$('#logout-btn').addEventListener('click', handleLogout);
$('#logout-btn-mobile').addEventListener('click', handleLogout);


// ═════════════════════════════════════════════════════════════════
//  4. INVENTORY
// ═════════════════════════════════════════════════════════════════

async function loadInventory() {
  try {
    const data = await api('/inventory');
    inventoryItems = data.items || data || [];
  } catch {
    inventoryItems = [];
  }
  renderInventoryCatTabs();
  renderInventory();
}

function renderInventoryCatTabs() {
  const tabs = $('#inv-cat-tabs');
  // Collect unique categories
  const cats = [...new Set(inventoryItems.map(i => i.category))];
  let html = `<button class="cat-tab ${inventoryFilter === 'all' ? 'active' : ''}" data-cat="all">All</button>`;
  cats.forEach(c => {
    const cat = CATEGORIES[c];
    if (cat) html += `<button class="cat-tab ${inventoryFilter === c ? 'active' : ''}" data-cat="${c}">${cat.icon} ${cat.name}</button>`;
  });
  tabs.innerHTML = html;
  tabs.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      inventoryFilter = tab.dataset.cat;
      tabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderInventory();
    });
  });
}

$('#inv-search').addEventListener('input', e => {
  inventorySearch = e.target.value.toLowerCase();
  renderInventory();
});

function renderInventory() {
  let items = inventoryItems;
  if (inventoryFilter !== 'all') items = items.filter(i => i.category === inventoryFilter);
  if (inventorySearch) items = items.filter(i => i.name.toLowerCase().includes(inventorySearch));

  // Stats
  const total = inventoryItems.length;
  const inStock = inventoryItems.filter(i => i.in_stock).length;
  $('#stat-total').textContent = total;
  $('#stat-instock').textContent = inStock;
  $('#stat-outstock').textContent = total - inStock;

  const grid = $('#inventory-grid');
  const empty = $('#inventory-empty');

  if (items.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = items.map(item => {
    const cat = CATEGORIES[item.category];
    return `
      <div class="inv-card" data-id="${item.id}">
        <div class="inv-card-top">
          <div>
            <div class="inv-card-name">${item.name}</div>
            <div class="inv-card-unit">${item.unit || ''}</div>
          </div>
          <label class="toggle" title="Toggle stock">
            <input type="checkbox" ${item.in_stock ? 'checked' : ''}
              onchange="toggleStock(${item.id}, this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="inv-card-bottom">
          <div class="inv-price-wrap">
            <span class="inv-price-prefix">₹</span>
            <input type="number" class="inv-price-input" value="${item.price}"
              min="0" onchange="updatePrice(${item.id}, this.value)">
          </div>
          <span class="stock-indicator ${item.in_stock ? 'in-stock' : 'out-of-stock'}"></span>
        </div>
        <div class="inv-card-cat">${cat ? cat.icon + ' ' + cat.name : item.category}</div>
      </div>
    `;
  }).join('');
}

window.toggleStock = async (id, checked) => {
  try {
    await api(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ in_stock: checked ? 1 : 0 })
    });
    const item = inventoryItems.find(i => i.id === id);
    if (item) item.in_stock = checked ? 1 : 0;
    renderInventory();
    toast(checked ? 'Item in stock' : 'Item out of stock', 'success');
  } catch { /* toast shown */ }
};

window.updatePrice = async (id, val) => {
  const price = parseInt(val) || 0;
  try {
    await api(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ price })
    });
    const item = inventoryItems.find(i => i.id === id);
    if (item) item.price = price;
    toast('Price updated', 'success');
  } catch { /* toast shown */ }
};

// ─── ADD FROM CATALOG MODAL ──────────────────────────────────────
let catalogFilter = 'all';
let catalogSearchQuery = '';

$('#add-from-catalog-btn').addEventListener('click', () => {
  catalogFilter = 'all';
  catalogSearchQuery = '';
  $('#catalog-search').value = '';
  renderCatalogModal();
  $('#catalog-modal').classList.remove('hidden');
});

function renderCatalogModal() {
  // Tabs
  const tabs = $('#catalog-cat-tabs');
  let html = `<button class="cat-tab ${catalogFilter === 'all' ? 'active' : ''}" data-cat="all">All</button>`;
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    html += `<button class="cat-tab ${catalogFilter === key ? 'active' : ''}" data-cat="${key}">${cat.icon} ${cat.name}</button>`;
  });
  tabs.innerHTML = html;
  tabs.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      catalogFilter = tab.dataset.cat;
      tabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCatalogItems();
    });
  });
  renderCatalogItems();
}

$('#catalog-search').addEventListener('input', e => {
  catalogSearchQuery = e.target.value.toLowerCase();
  renderCatalogItems();
});

function renderCatalogItems() {
  const existingIds = new Set(inventoryItems.map(i => i.catalog_id || i.id));
  let items = MASTER_CATALOG.filter(i => !existingIds.has(i.id));
  if (catalogFilter !== 'all') items = items.filter(i => i.category === catalogFilter);
  if (catalogSearchQuery) items = items.filter(i => i.name.toLowerCase().includes(catalogSearchQuery));

  const container = $('#catalog-items');
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">📦</span><p>No items to add</p></div>';
    return;
  }
  container.innerHTML = items.map(item => {
    const cat = CATEGORIES[item.category];
    return `
      <div class="catalog-item">
        <div class="catalog-item-info">
          <div class="catalog-item-name">${item.name}</div>
          <div class="catalog-item-meta">₹${item.default_price} · ${item.unit} · ${cat ? cat.name : ''}</div>
        </div>
        <button class="catalog-add-btn" onclick="addFromCatalog(${item.id})">+ Add</button>
      </div>
    `;
  }).join('');
}

window.addFromCatalog = async (catalogId) => {
  const item = MASTER_CATALOG.find(i => i.id === catalogId);
  if (!item) return;
  try {
    const resp = await api('/inventory/add', {
      method: 'POST',
      body: JSON.stringify({
        catalog_id: item.id,
        name: item.name,
        category: item.category,
        price: item.default_price,
        unit: item.unit,
        in_stock: 1
      })
    });
    inventoryItems.push(resp.item || { ...item, id: resp.id || item.id, price: item.default_price, in_stock: 1, catalog_id: item.id });
    renderInventory();
    renderInventoryCatTabs();
    renderCatalogItems();
    toast(`${item.name} added!`, 'success');
  } catch { /* toast shown */ }
};

// ─── ADD CUSTOM ITEM MODAL ───────────────────────────────────────
$('#add-custom-btn').addEventListener('click', () => {
  // Populate category dropdown
  const sel = $('#custom-category');
  sel.innerHTML = '<option value="" disabled selected>Select Category</option>';
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    sel.innerHTML += `<option value="${key}">${cat.icon} ${cat.name}</option>`;
  });
  $('#custom-item-form').reset();
  $('#custom-modal').classList.remove('hidden');
});

$('#custom-item-form').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    name: $('#custom-name').value.trim(),
    category: $('#custom-category').value,
    price: parseInt($('#custom-price').value) || 0,
    unit: $('#custom-unit').value.trim(),
    in_stock: 1,
    is_custom: true
  };
  try {
    const resp = await api('/inventory/add', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    inventoryItems.push(resp.item || { ...body, id: resp.id || Date.now() });
    renderInventory();
    renderInventoryCatTabs();
    $('#custom-modal').classList.add('hidden');
    toast('Custom item added!', 'success');
  } catch { /* toast shown */ }
});

// ─── MODAL CLOSE ─────────────────────────────────────────────────
$$('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    $(`#${btn.dataset.modal}`).classList.add('hidden');
  });
});
// Close modal on overlay click
$$('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
});


// ═════════════════════════════════════════════════════════════════
//  5. ORDERS
// ═════════════════════════════════════════════════════════════════

let orders = [];

async function loadOrders() {
  try {
    const data = await api('/orders');
    orders = data.orders || data || [];
  } catch {
    orders = [];
  }
  renderOrders();
}

function renderOrders() {
  const pending = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  $('#pending-count').textContent = `${pending} pending`;
  const badge = $('#orders-badge');
  if (pending > 0) {
    badge.textContent = pending;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  const list = $('#orders-list');
  const empty = $('#orders-empty');

  if (orders.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  list.innerHTML = orders.map(o => {
    const itemsList = (o.items || []).map(i => `${i.name} x${i.qty}`).join(', ');
    return `
      <div class="order-card">
        <div>
          <div class="order-id">#${o.id || o.order_id}</div>
          <div class="order-meta">${o.customer_phone || 'Customer'} · ${o.created_at ? new Date(o.created_at).toLocaleString() : ''}</div>
          <div class="order-items">${itemsList || 'Items N/A'}</div>
          <div class="order-total">₹${o.total || 0}</div>
        </div>
        <select class="order-status-select" onchange="updateOrderStatus('${o.id || o.order_id}', this.value)">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>✅ Confirmed</option>
          <option value="packed" ${o.status === 'packed' ? 'selected' : ''}>📦 Packed</option>
          <option value="out_for_delivery" ${o.status === 'out_for_delivery' ? 'selected' : ''}>🚚 Out for Delivery</option>
          <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>✅ Delivered</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
        </select>
      </div>
    `;
  }).join('');
}

window.updateOrderStatus = async (orderId, status) => {
  try {
    await api(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    const order = orders.find(o => (o.id || o.order_id) == orderId);
    if (order) order.status = status;
    renderOrders();
    toast('Order status updated', 'success');
  } catch { /* toast shown */ }
};


// ═════════════════════════════════════════════════════════════════
//  6. REQUEST INBOX
// ═════════════════════════════════════════════════════════════════

let requests = [];

async function loadRequests() {
  try {
    const data = await api('/requests');
    requests = data.requests || data || [];
  } catch {
    requests = [];
  }
  renderRequests();
}

function renderRequests() {
  const badge = $('#requests-badge');
  if (requests.length > 0) {
    badge.textContent = requests.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  const list = $('#requests-list');
  const empty = $('#requests-empty');

  if (requests.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  list.innerHTML = requests.map(r => {
    const phone = r.customer_phone ? r.customer_phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : 'Unknown';
    const itemName = (r.item_name || r.name || '').replace(/'/g, "\\'");
    return `
      <div class="request-card" data-id="${r.id}">
        <div class="req-info">
          <div class="req-item">${r.item_name || r.name}</div>
          <div class="req-meta">📱 ${phone} · ${r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
        </div>
        <div class="req-actions">
          <button class="btn btn-success btn-sm" onclick="acceptRequest(${r.id}, '${itemName}')">✅ Yes, I have it</button>
          <button class="btn btn-danger btn-sm" onclick="rejectRequest(${r.id})">❌ No</button>
        </div>
      </div>
    `;
  }).join('');
}

let pendingRequestId = null;

window.acceptRequest = (id, itemName) => {
  pendingRequestId = id;
  $('#req-item-name').textContent = itemName;
  $('#req-price-input').value = '';
  $('#request-price-modal').classList.remove('hidden');
};

$('#req-confirm-btn').addEventListener('click', async () => {
  const price = parseInt($('#req-price-input').value) || 0;
  if (price <= 0) return toast('Enter a valid price', 'error');
  try {
    await api(`/requests/${pendingRequestId}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'accept', price })
    });
    requests = requests.filter(r => r.id !== pendingRequestId);
    renderRequests();
    $('#request-price-modal').classList.add('hidden');
    toast('Item added to inventory!', 'success');
    loadInventory(); // refresh
  } catch { /* toast shown */ }
});

window.rejectRequest = async (id) => {
  try {
    await api(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'reject' })
    });
    requests = requests.filter(r => r.id !== id);
    renderRequests();
    toast('Request declined', 'info');
  } catch { /* toast shown */ }
};


// ═════════════════════════════════════════════════════════════════
//  7. PROFILE
// ═════════════════════════════════════════════════════════════════

async function loadProfile() {
  try {
    const data = await api('/profile');
    const p = data.merchant || data;
    $('#prof-shop-name').value = p.shop_name || '';
    $('#prof-owner-name').value = p.owner_name || '';
    $('#prof-phone').value = p.phone || '';
    $('#prof-city').value = p.city || '';
    $('#prof-address').value = p.address || '';
    $('#prof-pincode').value = p.pincode || '';
    $('#prof-type').value = p.shop_type || 'kirana';
    $('#prof-radius').value = p.delivery_radius_km || 3;
    $('#prof-radius-val').textContent = p.delivery_radius_km || 3;
    $('#prof-gstin').value = p.gstin || '';
    $('#prof-gst-registered').checked = !!p.gst_registered;
  } catch { /* toast shown */ }
}

$('#prof-radius').addEventListener('input', e => {
  $('#prof-radius-val').textContent = e.target.value;
});

$('#prof-location-btn').addEventListener('click', () => {
  if (!navigator.geolocation) return toast('Geolocation not supported', 'error');
  toast('Getting location...', 'info');
  navigator.geolocation.getCurrentPosition(
    pos => {
      if (MERCHANT) {
        MERCHANT.lat = pos.coords.latitude;
        MERCHANT.lng = pos.coords.longitude;
      }
      toast('Location updated!', 'success');
    },
    () => toast('Location access denied', 'error')
  );
});

$('#profile-form').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    shop_name: $('#prof-shop-name').value.trim(),
    owner_name: $('#prof-owner-name').value.trim(),
    city: $('#prof-city').value.trim(),
    address: $('#prof-address').value.trim(),
    pincode: $('#prof-pincode').value.trim(),
    shop_type: $('#prof-type').value,
    delivery_radius_km: parseInt($('#prof-radius').value),
    gstin: $('#prof-gstin').value.trim(),
    gst_registered: $('#prof-gst-registered').checked ? 1 : 0,
    lat: MERCHANT?.lat || null,
    lng: MERCHANT?.lng || null,
  };
  try {
    await api('/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    toast('Profile saved!', 'success');
  } catch { /* toast shown */ }
});


// ═════════════════════════════════════════════════════════════════
//  INIT
// ═════════════════════════════════════════════════════════════════
switchScreen('auth-screen');
