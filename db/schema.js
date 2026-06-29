/**
 * @file db/schema.js
 * @description JSON file-based storage for Baggalpe Bot.
 * Drop-in replacement for SQLite — works on any hosting without native compilation.
 * Each collection is a JSON file in the db/data/ directory.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// ── Ensure data directory exists ────────────────────────────
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('[DB] Created data directory:', DATA_DIR);
  }
}

// ── Generic JSON read/write helpers ─────────────────────────

function readCollection(name) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[DB] Error reading ${name}.json:`, err.message);
    return [];
  }
}

function writeCollection(name, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[DB] Error writing ${name}.json:`, err.message);
  }
}

function getNextId(collection) {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map(item => item.id || 0)) + 1;
}

// ── Initialize ──────────────────────────────────────────────

let initialized = false;

function initDB() {
  if (initialized) return;
  ensureDataDir();

  // Create empty files if they don't exist
  const collections = ['users', 'merchants', 'products', 'orders', 'conversations'];
  for (const name of collections) {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      writeCollection(name, []);
    }
  }

  initialized = true;
  console.log('[DB] Database initialised at', DATA_DIR);
}

// ── Haversine Distance Calculator ───────────────────────────

/**
 * Calculate distance between two GPS coordinates using Haversine formula.
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ── Users ───────────────────────────────────────────────────

function getUser(phone) {
  initDB();
  const users = readCollection('users');
  return users.find(u => u.phone === phone) || undefined;
}

function createUser(phone, name, city) {
  initDB();
  const users = readCollection('users');
  const existing = users.find(u => u.phone === phone);
  if (existing) return existing;

  const user = {
    id: getNextId(users),
    phone,
    name: name || null,
    city: city || null,
    lat: null,
    lng: null,
    language: 'hi',
    created_at: new Date().toISOString()
  };
  users.push(user);
  writeCollection('users', users);
  return user;
}

/**
 * Update a user's last known GPS location.
 */
function updateUserLocation(phone, lat, lng) {
  initDB();
  const users = readCollection('users');
  let user = users.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: getNextId(users),
      phone,
      name: null,
      city: null,
      lat, lng,
      language: 'hi',
      created_at: new Date().toISOString()
    };
    users.push(user);
  } else {
    user.lat = lat;
    user.lng = lng;
  }
  writeCollection('users', users);
  return user;
}

// ── Merchants ───────────────────────────────────────────────

function getMerchant(id) {
  initDB();
  const merchants = readCollection('merchants');
  return merchants.find(m => m.id === id) || undefined;
}

function getMerchantsByCity(city, type) {
  initDB();
  const merchants = readCollection('merchants');
  return merchants.filter(m => {
    const cityMatch = m.city && m.city.toLowerCase() === (city || '').toLowerCase();
    const typeMatch = !type || m.type === type;
    const active = m.is_active !== 0;
    return cityMatch && typeMatch && active;
  });
}

/**
 * Find active merchants near a GPS coordinate.
 * A merchant is "nearby" if the user is within the merchant's delivery_radius_km.
 * Default radius is 1km if not set.
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {string} [type] - Optional merchant type filter (kirana, sabzi, etc.)
 * @returns {Array} Merchants sorted by distance, each with a `distance_km` field
 */
function findMerchantsByLocation(lat, lng, type) {
  initDB();
  const merchants = readCollection('merchants');
  const results = [];

  for (const m of merchants) {
    if (m.is_active === 0) continue;
    if (type && m.type !== type) continue;
    if (!m.lat || !m.lng) continue;

    const dist = haversineDistance(lat, lng, m.lat, m.lng);
    const merchantRadius = m.delivery_radius_km || 1;

    // Show merchant if user is within the merchant's delivery radius
    if (dist <= merchantRadius) {
      results.push({ ...m, distance_km: Math.round(dist * 100) / 100 });
    }
  }

  // Sort by distance (nearest first)
  results.sort((a, b) => a.distance_km - b.distance_km);
  return results;
}

/**
 * Get all merchants (for admin/dashboard purposes)
 */
function getAllMerchants() {
  initDB();
  return readCollection('merchants');
}

/**
 * Get a merchant by phone number (for login)
 */
function getMerchantByPhone(phone) {
  initDB();
  const merchants = readCollection('merchants');
  // Normalize phone — strip leading 91 if present
  const normalizedPhone = phone.replace(/^91/, '');
  return merchants.find(m => {
    const mPhone = (m.phone || '').replace(/^91/, '');
    return mPhone === normalizedPhone;
  }) || undefined;
}

/**
 * Create a new merchant (registration)
 */
function createMerchant(data) {
  initDB();
  const merchants = readCollection('merchants');
  const merchant = {
    id: getNextId(merchants),
    name: data.name,
    type: data.type || 'kirana',
    owner_name: data.owner_name || data.name,
    phone: data.phone,
    address: data.address || '',
    city: data.city || '',
    pincode: data.pincode || '',
    lat: data.lat || null,
    lng: data.lng || null,
    delivery_radius_km: data.delivery_radius_km || 1,
    pin: data.pin || '1234',
    rating: 0,
    is_active: 1,
    created_at: new Date().toISOString()
  };
  merchants.push(merchant);
  writeCollection('merchants', merchants);
  return merchant;
}

/**
 * Update a merchant's profile
 */
function updateMerchant(id, data) {
  initDB();
  const merchants = readCollection('merchants');
  const idx = merchants.findIndex(m => m.id === id);
  if (idx === -1) return null;

  // Only update allowed fields
  const allowed = ['name', 'owner_name', 'phone', 'address', 'city', 'pincode',
    'lat', 'lng', 'delivery_radius_km', 'pin', 'type', 'is_active'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      merchants[idx][key] = data[key];
    }
  }
  writeCollection('merchants', merchants);
  return merchants[idx];
}

// ── Products ────────────────────────────────────────────────

function getProducts(merchantId) {
  initDB();
  const products = readCollection('products');
  return products.filter(p => p.merchant_id === merchantId && p.in_stock !== 0);
}

/**
 * Get ALL products for a merchant (including out of stock) — for dashboard
 */
function getAllProducts(merchantId) {
  initDB();
  const products = readCollection('products');
  return products.filter(p => p.merchant_id === merchantId);
}

function searchProducts(merchantId, query) {
  initDB();
  if (!merchantId || !query) return [];
  const products = readCollection('products');
  const q = (query || '').toLowerCase();
  return products.filter(p =>
    p.merchant_id === merchantId &&
    p.in_stock !== 0 &&
    p.name.toLowerCase().includes(q)
  );
}

/**
 * Add a new product to a merchant's catalog
 */
function addProduct(merchantId, data) {
  initDB();
  const products = readCollection('products');
  const product = {
    id: getNextId(products),
    merchant_id: merchantId,
    name: data.name,
    category: data.category || 'general',
    price: data.price || 0,
    unit: data.unit || 'piece',
    in_stock: data.in_stock !== undefined ? data.in_stock : 1,
  };
  products.push(product);
  writeCollection('products', products);
  return product;
}

/**
 * Update a product
 */
function updateProduct(productId, data) {
  initDB();
  const products = readCollection('products');
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return null;

  const allowed = ['name', 'category', 'price', 'unit', 'in_stock'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      products[idx][key] = data[key];
    }
  }
  writeCollection('products', products);
  return products[idx];
}

/**
 * Delete a product
 */
function deleteProduct(productId) {
  initDB();
  const products = readCollection('products');
  const filtered = products.filter(p => p.id !== productId);
  if (filtered.length === products.length) return false;
  writeCollection('products', filtered);
  return true;
}

// ── Orders ──────────────────────────────────────────────────

function createOrder(data) {
  initDB();
  const orders = readCollection('orders');
  const order = {
    id: getNextId(orders),
    order_number: data.orderNumber || data.order_number,
    user_phone: data.userPhone || data.user_phone,
    merchant_id: data.merchantId || data.merchant_id,
    items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items || []),
    subtotal: data.subtotal || 0,
    platform_fee: data.platformFee || data.platform_fee || 10,
    total: data.total || 0,
    status: data.status || 'pending',
    payment_status: data.paymentStatus || data.payment_status || 'unpaid',
    created_at: new Date().toISOString()
  };
  orders.push(order);
  writeCollection('orders', orders);
  return order;
}

function getOrder(orderNumber) {
  initDB();
  const orders = readCollection('orders');
  const order = orders.find(o => o.order_number === orderNumber);
  if (!order) return undefined;
  // Parse items JSON
  if (typeof order.items === 'string') {
    try { order.items = JSON.parse(order.items); } catch (_) {}
  }
  return order;
}

function updateOrderStatus(orderNumber, status) {
  initDB();
  const orders = readCollection('orders');
  const idx = orders.findIndex(o => o.order_number === orderNumber);
  if (idx === -1) return null;
  orders[idx].status = status;
  writeCollection('orders', orders);
  return orders[idx];
}

/**
 * Get all orders for a specific merchant (for dashboard)
 */
function getOrdersByMerchant(merchantId) {
  initDB();
  const orders = readCollection('orders');
  return orders
    .filter(o => o.merchant_id === merchantId)
    .map(o => {
      if (typeof o.items === 'string') {
        try { o.items = JSON.parse(o.items); } catch (_) {}
      }
      return o;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Get the latest order for a user phone
 */
function getLatestOrder(phone) {
  initDB();
  const orders = readCollection('orders');
  const userOrders = orders
    .filter(o => o.user_phone === phone)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (userOrders.length === 0) return undefined;
  const order = userOrders[0];
  if (typeof order.items === 'string') {
    try { order.items = JSON.parse(order.items); } catch (_) {}
  }
  return order;
}

// ── Conversations ───────────────────────────────────────────

function getConversation(phone) {
  initDB();
  const conversations = readCollection('conversations');
  const conv = conversations.find(c => c.user_phone === phone);
  if (!conv) return undefined;
  // Parse context JSON
  if (typeof conv.context === 'string') {
    try { conv.context = JSON.parse(conv.context); } catch (_) {}
  }
  return conv;
}

function upsertConversation(phone, flow, step, context) {
  initDB();
  const conversations = readCollection('conversations');
  const idx = conversations.findIndex(c => c.user_phone === phone);
  const contextStr = typeof context === 'string' ? context : JSON.stringify(context || {});

  if (idx >= 0) {
    conversations[idx].current_flow = flow;
    conversations[idx].current_step = step;
    conversations[idx].context = contextStr;
    conversations[idx].updated_at = new Date().toISOString();
  } else {
    conversations.push({
      id: getNextId(conversations),
      user_phone: phone,
      current_flow: flow,
      current_step: step,
      context: contextStr,
      updated_at: new Date().toISOString()
    });
  }
  writeCollection('conversations', conversations);
}

function clearConversation(phone) {
  initDB();
  const conversations = readCollection('conversations');
  const filtered = conversations.filter(c => c.user_phone !== phone);
  writeCollection('conversations', filtered);
}

// ── Exports ─────────────────────────────────────────────────

module.exports = {
  initDB,
  haversineDistance,
  // Users
  getUser,
  createUser,
  updateUserLocation,
  // Merchants
  getMerchant,
  getMerchantsByCity,
  findMerchantsByLocation,
  getAllMerchants,
  getMerchantByPhone,
  createMerchant,
  updateMerchant,
  // Products
  getProducts,
  getAllProducts,
  searchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  // Orders
  createOrder,
  getOrder,
  updateOrderStatus,
  getOrdersByMerchant,
  getLatestOrder,
  // Conversations
  getConversation,
  upsertConversation,
  clearConversation,
};
