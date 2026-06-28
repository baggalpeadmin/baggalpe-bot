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

// ── Products ────────────────────────────────────────────────

function getProducts(merchantId) {
  initDB();
  const products = readCollection('products');
  return products.filter(p => p.merchant_id === merchantId && p.in_stock !== 0);
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
  getUser,
  createUser,
  getMerchant,
  getMerchantsByCity,
  getProducts,
  searchProducts,
  createOrder,
  getOrder,
  updateOrderStatus,
  getConversation,
  upsertConversation,
  clearConversation,
};
