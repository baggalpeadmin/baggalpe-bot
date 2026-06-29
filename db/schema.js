/**
 * @file db/schema.js
 * @description JSON file-based storage for Baggalpe Bot v2.
 * Supports: users, merchants, merchant_inventory, orders, conversations, special_requests.
 * Uses master catalog for pre-built item database.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { MASTER_CATALOG, searchCatalog, getCatalogByCategory, getCatalogItem } = require('./master-catalog');

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

  const collections = ['users', 'merchants', 'merchant_inventory', 'products', 'orders', 'conversations', 'special_requests'];
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

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
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

// ══════════════════════════════════════════════════════════════
//  USERS
// ══════════════════════════════════════════════════════════════

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
    phone, name: name || null, city: city || null,
    lat: null, lng: null, language: 'hi',
    created_at: new Date().toISOString()
  };
  users.push(user);
  writeCollection('users', users);
  return user;
}

function updateUserLocation(phone, lat, lng) {
  initDB();
  const users = readCollection('users');
  let user = users.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: getNextId(users),
      phone, name: null, city: null, lat, lng,
      language: 'hi', created_at: new Date().toISOString()
    };
    users.push(user);
  } else {
    user.lat = lat;
    user.lng = lng;
  }
  writeCollection('users', users);
  return user;
}

// ══════════════════════════════════════════════════════════════
//  MERCHANTS
// ══════════════════════════════════════════════════════════════

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

    if (dist <= merchantRadius) {
      results.push({ ...m, distance_km: Math.round(dist * 100) / 100 });
    }
  }

  results.sort((a, b) => a.distance_km - b.distance_km);
  return results;
}

function getAllMerchants() {
  initDB();
  return readCollection('merchants');
}

function getMerchantByPhone(phone) {
  initDB();
  const merchants = readCollection('merchants');
  const normalizedPhone = phone.replace(/^91/, '');
  return merchants.find(m => {
    const mPhone = (m.phone || '').replace(/^91/, '');
    return mPhone === normalizedPhone;
  }) || undefined;
}

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
    gst_registered: false,
    gstin: '',
    rating: 0,
    is_active: 1,
    onboarded: false,
    created_at: new Date().toISOString()
  };
  merchants.push(merchant);
  writeCollection('merchants', merchants);
  return merchant;
}

function updateMerchant(id, data) {
  initDB();
  const merchants = readCollection('merchants');
  const idx = merchants.findIndex(m => m.id === id);
  if (idx === -1) return null;

  const allowed = ['name', 'owner_name', 'phone', 'address', 'city', 'pincode',
    'lat', 'lng', 'delivery_radius_km', 'pin', 'type', 'is_active',
    'gst_registered', 'gstin', 'onboarded'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      merchants[idx][key] = data[key];
    }
  }
  writeCollection('merchants', merchants);
  return merchants[idx];
}

// ══════════════════════════════════════════════════════════════
//  MERCHANT INVENTORY (Links merchant ↔ catalog items)
// ══════════════════════════════════════════════════════════════

/**
 * Get a merchant's full inventory with catalog details.
 */
function getMerchantInventory(merchantId) {
  initDB();
  const inventory = readCollection('merchant_inventory');
  return inventory
    .filter(i => i.merchant_id === merchantId)
    .map(item => {
      // Enrich with catalog details if it's a catalog item
      if (item.catalog_item_id) {
        const catalogItem = getCatalogItem(item.catalog_item_id);
        if (catalogItem) {
          return {
            ...item,
            name: item.custom_name || catalogItem.name,
            category: catalogItem.category,
            subcategory: catalogItem.subcategory,
            unit: item.unit || catalogItem.unit,
            brand: catalogItem.brand,
            default_price: catalogItem.default_price,
          };
        }
      }
      return item;
    });
}

/**
 * Get in-stock inventory items for a merchant (for customer-facing search).
 */
function getMerchantInStockInventory(merchantId) {
  return getMerchantInventory(merchantId).filter(i => i.in_stock === 1);
}

/**
 * Get inventory items for a merchant filtered by category.
 */
function getMerchantInventoryByCategory(merchantId, category) {
  return getMerchantInStockInventory(merchantId).filter(i => i.category === category);
}

/**
 * Search a merchant's inventory by query (fuzzy matching).
 */
function searchMerchantInventory(merchantId, query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  const inventory = getMerchantInStockInventory(merchantId);

  // Score each item based on match quality
  const scored = inventory.map(item => {
    let score = 0;
    const name = (item.name || '').toLowerCase();
    const brand = (item.brand || '').toLowerCase();

    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (brand.includes(q)) score = 40;

    // Check catalog keywords
    if (score === 0 && item.catalog_item_id) {
      const catalogItem = getCatalogItem(item.catalog_item_id);
      if (catalogItem && catalogItem.keywords) {
        for (const kw of catalogItem.keywords) {
          if (kw.includes(q) || q.includes(kw)) {
            score = 50;
            break;
          }
        }
      }
    }

    return { ...item, _score: score };
  });

  return scored.filter(i => i._score > 0).sort((a, b) => b._score - a._score);
}

/**
 * Onboard a merchant: bulk-add items from master catalog.
 * @param {number} merchantId
 * @param {Array<string>} categories - Selected category keys
 * @param {Array<{catalog_id: number, price: number, in_stock: number}>} [itemOverrides] - Custom prices/stock
 */
function onboardMerchant(merchantId, categories, itemOverrides) {
  initDB();
  const inventory = readCollection('merchant_inventory');
  const overrideMap = {};
  if (itemOverrides) {
    for (const ov of itemOverrides) {
      overrideMap[ov.catalog_id] = ov;
    }
  }

  // Get all catalog items for selected categories
  let newItems = 0;
  for (const cat of categories) {
    const items = getCatalogByCategory(cat);
    for (const item of items) {
      // Skip if already in inventory
      const exists = inventory.find(i => i.merchant_id === merchantId && i.catalog_item_id === item.id);
      if (exists) continue;

      const override = overrideMap[item.id];
      inventory.push({
        id: getNextId(inventory),
        merchant_id: merchantId,
        catalog_item_id: item.id,
        custom_name: null,
        price: override ? override.price : item.default_price,
        unit: item.unit,
        in_stock: override ? override.in_stock : 1,
        is_custom: false,
        created_at: new Date().toISOString()
      });
      newItems++;
    }
  }

  writeCollection('merchant_inventory', inventory);

  // Mark merchant as onboarded
  updateMerchant(merchantId, { onboarded: true });

  console.log(`[DB] Onboarded merchant ${merchantId}: ${newItems} items added from ${categories.length} categories`);
  return newItems;
}

/**
 * Add a single item to merchant inventory (from catalog or custom).
 */
function addInventoryItem(merchantId, data) {
  initDB();
  const inventory = readCollection('merchant_inventory');

  // Check for duplicate catalog item
  if (data.catalog_item_id) {
    const exists = inventory.find(i => i.merchant_id === merchantId && i.catalog_item_id === data.catalog_item_id);
    if (exists) {
      // Just update stock to in_stock
      exists.in_stock = 1;
      if (data.price) exists.price = data.price;
      writeCollection('merchant_inventory', inventory);
      return exists;
    }
  }

  const item = {
    id: getNextId(inventory),
    merchant_id: merchantId,
    catalog_item_id: data.catalog_item_id || null,
    custom_name: data.custom_name || data.name || null,
    category: data.category || 'general',
    price: data.price || 0,
    unit: data.unit || 'piece',
    in_stock: data.in_stock !== undefined ? data.in_stock : 1,
    is_custom: !data.catalog_item_id,
    created_at: new Date().toISOString()
  };
  inventory.push(item);
  writeCollection('merchant_inventory', inventory);
  return item;
}

/**
 * Update a merchant inventory item (price, stock, etc.)
 */
function updateInventoryItem(itemId, data) {
  initDB();
  const inventory = readCollection('merchant_inventory');
  const idx = inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return null;

  const allowed = ['price', 'in_stock', 'custom_name', 'unit'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      inventory[idx][key] = data[key];
    }
  }
  writeCollection('merchant_inventory', inventory);
  return inventory[idx];
}

/**
 * Delete a merchant inventory item.
 */
function deleteInventoryItem(itemId) {
  initDB();
  const inventory = readCollection('merchant_inventory');
  const filtered = inventory.filter(i => i.id !== itemId);
  if (filtered.length === inventory.length) return false;
  writeCollection('merchant_inventory', filtered);
  return true;
}

// ══════════════════════════════════════════════════════════════
//  LEGACY PRODUCTS (kept for backward compat, maps to inventory)
// ══════════════════════════════════════════════════════════════

function getProducts(merchantId) {
  // Use new inventory system if merchant has inventory
  const inventory = getMerchantInStockInventory(merchantId);
  if (inventory.length > 0) return inventory;

  // Fallback to old products collection
  initDB();
  const products = readCollection('products');
  return products.filter(p => p.merchant_id === merchantId && p.in_stock !== 0);
}

function searchProducts(merchantId, query) {
  // Use new inventory search if available
  const results = searchMerchantInventory(merchantId, query);
  if (results.length > 0) return results;

  // Fallback to old products
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

// ══════════════════════════════════════════════════════════════
//  SPECIAL REQUESTS (Customer → Shopkeeper relay)
// ══════════════════════════════════════════════════════════════

function createSpecialRequest(customerPhone, merchantId, itemName) {
  initDB();
  const requests = readCollection('special_requests');
  const request = {
    id: getNextId(requests),
    customer_phone: customerPhone,
    merchant_id: merchantId,
    item_name: itemName,
    status: 'pending', // pending | accepted | rejected
    price: null,
    created_at: new Date().toISOString()
  };
  requests.push(request);
  writeCollection('special_requests', requests);
  return request;
}

function getSpecialRequests(merchantId) {
  initDB();
  const requests = readCollection('special_requests');
  return requests
    .filter(r => r.merchant_id === merchantId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getPendingRequests(merchantId) {
  return getSpecialRequests(merchantId).filter(r => r.status === 'pending');
}

function updateSpecialRequest(requestId, data) {
  initDB();
  const requests = readCollection('special_requests');
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx === -1) return null;

  if (data.status) requests[idx].status = data.status;
  if (data.price !== undefined) requests[idx].price = data.price;
  requests[idx].responded_at = new Date().toISOString();
  writeCollection('special_requests', requests);
  return requests[idx];
}

// ══════════════════════════════════════════════════════════════
//  ORDERS
// ══════════════════════════════════════════════════════════════

function createOrder(data) {
  initDB();
  const orders = readCollection('orders');
  const order = {
    id: getNextId(orders),
    order_number: data.orderNumber || data.order_number || `BG-${Math.floor(10000 + Math.random() * 89999)}`,
    user_phone: data.userPhone || data.user_phone,
    merchant_id: data.merchantId || data.merchant_id,
    items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items || []),
    subtotal: data.subtotal || 0,
    platform_fee: data.platformFee || data.platform_fee || 10,
    gst_on_platform: data.gst_on_platform || 1.80,
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

// ══════════════════════════════════════════════════════════════
//  CONVERSATIONS
// ══════════════════════════════════════════════════════════════

function getConversation(phone) {
  initDB();
  const conversations = readCollection('conversations');
  const conv = conversations.find(c => c.user_phone === phone);
  if (!conv) return undefined;
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

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

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
  // Merchant Inventory (v2)
  getMerchantInventory,
  getMerchantInStockInventory,
  getMerchantInventoryByCategory,
  searchMerchantInventory,
  onboardMerchant,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  // Legacy Products (backward compat)
  getProducts,
  searchProducts,
  // Special Requests
  createSpecialRequest,
  getSpecialRequests,
  getPendingRequests,
  updateSpecialRequest,
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
