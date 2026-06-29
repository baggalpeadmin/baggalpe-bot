/**
 * @file db/seed.js
 * @description Seed the JSON database with demo merchants and products.
 * Run: node db/seed.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function writeCollection(name, data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2), 'utf-8');
}

// ── Merchants (with real Jaipur coordinates & delivery radius) ──

const merchants = [
  {
    id: 1, name: 'Ramu Kirana Store', type: 'kirana',
    owner_name: 'Ramu Sharma', phone: '919876543210',
    address: 'Shop 12, Malviya Nagar Main Road', city: 'Jaipur', pincode: '302017',
    lat: 26.8546, lng: 75.8036, delivery_radius_km: 2,
    pin: '1234', rating: 4.5, is_active: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2, name: 'Shyam General Store', type: 'kirana',
    owner_name: 'Shyam Gupta', phone: '919876543211',
    address: '45, Vaishali Nagar Circle', city: 'Jaipur', pincode: '302021',
    lat: 26.9124, lng: 75.7385, delivery_radius_km: 2,
    pin: '1234', rating: 4.3, is_active: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 3, name: 'Geeta Sabzi Mandi', type: 'sabzi',
    owner_name: 'Geeta Devi', phone: '919876543212',
    address: 'Tonk Road Sabzi Market', city: 'Jaipur', pincode: '302015',
    lat: 26.8765, lng: 75.7872, delivery_radius_km: 3,
    pin: '1234', rating: 4.6, is_active: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 4, name: 'MedPlus Pharmacy', type: 'pharmacy',
    owner_name: 'Dr. Anil Joshi', phone: '919876543213',
    address: 'C-Scheme, MI Road', city: 'Jaipur', pincode: '302001',
    lat: 26.9157, lng: 75.8057, delivery_radius_km: 5,
    pin: '1234', rating: 4.4, is_active: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 5, name: 'Rajesh Kumar (Plumber)', type: 'plumber',
    owner_name: 'Rajesh Kumar', phone: '919876543214',
    address: 'Mansarovar Sector 7', city: 'Jaipur', pincode: '302020',
    lat: 26.8592, lng: 75.7632, delivery_radius_km: 10,
    pin: '1234', rating: 4.2, is_active: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 6, name: 'Amit Singh (Electrician)', type: 'electrician',
    owner_name: 'Amit Singh', phone: '919876543215',
    address: 'Jagatpura Main Road', city: 'Jaipur', pincode: '302025',
    lat: 26.8343, lng: 75.8447, delivery_radius_km: 10,
    pin: '1234', rating: 4.3, is_active: 1,
    created_at: new Date().toISOString()
  },
];

// ── Products ────────────────────────────────────────────────

let productId = 1;
const products = [];

// Kirana products (for both stores)
const kiranaItems = [
  { name: 'Ashirvaad Aata 5kg', category: 'grocery', price: 275, unit: '5kg' },
  { name: 'Ashirvaad Aata 10kg', category: 'grocery', price: 520, unit: '10kg' },
  { name: 'Basmati Rice 5kg', category: 'grocery', price: 340, unit: '5kg' },
  { name: 'Toor Dal 1kg', category: 'grocery', price: 140, unit: '1kg' },
  { name: 'Sugar 1kg', category: 'grocery', price: 45, unit: '1kg' },
  { name: 'Sugar 5kg', category: 'grocery', price: 210, unit: '5kg' },
  { name: 'Refined Oil 1L', category: 'grocery', price: 155, unit: '1L' },
  { name: 'Amul Milk 1L', category: 'dairy', price: 28, unit: '1L' },
  { name: 'Bread', category: 'bakery', price: 40, unit: 'pack' },
  { name: 'Amul Butter 100g', category: 'dairy', price: 55, unit: '100g' },
  { name: 'Tata Tea 250g', category: 'beverages', price: 120, unit: '250g' },
  { name: 'Maggi 4-pack', category: 'snacks', price: 56, unit: '4-pack' },
  { name: 'Parle-G Biscuit', category: 'snacks', price: 30, unit: 'pack' },
  { name: 'Lux Soap', category: 'personal care', price: 45, unit: 'piece' },
  { name: 'Sachet Shampoo', category: 'personal care', price: 5, unit: 'sachet' },
  { name: 'Surf Excel 1kg', category: 'household', price: 99, unit: '1kg' },
];

// Add kirana products for store 1 and store 2
for (const merchantId of [1, 2]) {
  for (const item of kiranaItems) {
    // Slightly vary prices for store 2
    const priceVariation = merchantId === 2 ? Math.round(item.price * (0.95 + Math.random() * 0.1)) : item.price;
    products.push({
      id: productId++,
      merchant_id: merchantId,
      name: item.name,
      category: item.category,
      price: priceVariation,
      unit: item.unit,
      in_stock: 1,
    });
  }
}

// Sabzi products for store 3
const sabziItems = [
  { name: 'Tamatar', category: 'sabzi', price: 40, unit: 'kg' },
  { name: 'Pyaaz', category: 'sabzi', price: 30, unit: 'kg' },
  { name: 'Aloo', category: 'sabzi', price: 25, unit: 'kg' },
  { name: 'Mirch', category: 'sabzi', price: 60, unit: 'kg' },
  { name: 'Bhindi', category: 'sabzi', price: 50, unit: 'kg' },
  { name: 'Gobhi', category: 'sabzi', price: 40, unit: 'kg' },
  { name: 'Palak', category: 'sabzi', price: 30, unit: 'bunch' },
  { name: 'Dhaniya', category: 'sabzi', price: 10, unit: 'bunch' },
  { name: 'Adrak', category: 'sabzi', price: 120, unit: 'kg' },
  { name: 'Lehsun', category: 'sabzi', price: 200, unit: 'kg' },
];

for (const item of sabziItems) {
  products.push({
    id: productId++,
    merchant_id: 3,
    name: item.name,
    category: item.category,
    price: item.price,
    unit: item.unit,
    in_stock: 1,
  });
}

// Service providers (visiting charges as products)
products.push({ id: productId++, merchant_id: 5, name: 'Plumbing Visiting Charge', category: 'service', price: 150, unit: 'visit', in_stock: 1 });
products.push({ id: productId++, merchant_id: 5, name: 'Pipe Repair', category: 'service', price: 300, unit: 'job', in_stock: 1 });
products.push({ id: productId++, merchant_id: 6, name: 'Electrician Visiting Charge', category: 'service', price: 200, unit: 'visit', in_stock: 1 });
products.push({ id: productId++, merchant_id: 6, name: 'Wiring Repair', category: 'service', price: 500, unit: 'job', in_stock: 1 });

// ── Write seed data ─────────────────────────────────────────

writeCollection('merchants', merchants);
writeCollection('products', products);
writeCollection('users', []);
writeCollection('orders', []);
writeCollection('conversations', []);

console.log(`\n✅ Seed complete!`);
console.log(`   🏪 ${merchants.length} merchants`);
console.log(`   📦 ${products.length} products`);
console.log(`   📁 Data stored in: ${DATA_DIR}\n`);
