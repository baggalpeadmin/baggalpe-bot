/**
 * @file server.js
 * @description Baggalpe WhatsApp AI Shopping Concierge — Express Server
 *
 * Endpoints:
 *   GET  /webhook   — Meta webhook verification
 *   POST /webhook   — Receive incoming WhatsApp messages
 *   POST /api/test  — Local test endpoint (no WhatsApp API needed)
 *   GET  /health    — Health check
 *   GET  /test/*    — Browser-based chat simulator (static)
 */

const fs = require('fs');
const envPath = fs.existsSync('.env') ? '.env' : '.env.example';
require('dotenv').config({ path: envPath });
console.log(`[Config] Loaded from: ${envPath}`);

// Validate required env vars
const REQUIRED_ENV = ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_ID', 'WHATSAPP_VERIFY_TOKEN', 'GEMINI_API_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k] || process.env[k].startsWith('your_'));
if (missing.length > 0) {
  console.error(`[Config] ⚠️  Missing env vars: ${missing.join(', ')}`);
  console.error('[Config] Create a .env file on the server with your actual tokens!');
}
console.log(`[Config] PHONE_ID=${process.env.WHATSAPP_PHONE_ID}, BUSINESS_ID=${process.env.WHATSAPP_BUSINESS_ID}`);
const express = require('express');
const path = require('path');
const { initDB, getMerchantsByCity } = require('./db/schema');
const { handleMessage } = require('./conversation/router');

// Auto-seed database on first run if no data exists
initDB();
try {
  const merchants = getMerchantsByCity('Jaipur');
  if (!merchants || merchants.length === 0) {
    console.log('[Server] No merchants found — auto-seeding database...');
    require('./db/seed');
  }
} catch (e) {
  console.log('[Server] Auto-seeding database...');
  require('./db/seed');
}

const app = express();
app.use(express.json());
app.use('/test', express.static(path.join(__dirname, 'test')));

// ---------------------------------------------------------------------------
// GET / — Homepage
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Baggalpe — AI Shopping Assistant</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .container { text-align: center; padding: 2rem; }
        h1 { font-size: 3rem; background: linear-gradient(135deg, #25D366, #00d4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        p { color: #888; margin-top: 1rem; font-size: 1.2rem; }
        .badge { display: inline-block; margin-top: 2rem; padding: 0.8rem 2rem; background: #25D366; color: #000; border-radius: 50px; font-weight: bold; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🛒 Baggalpe</h1>
        <p>AI Shopping Assistant for WhatsApp</p>
        <p style="color:#555; margin-top:0.5rem;">Order grocery, sabzi & services — seedha WhatsApp pe!</p>
        <a href="https://wa.me/918529790840" class="badge">💬 Chat on WhatsApp</a>
      </div>
    </body>
    </html>
  `);
});

// ---------------------------------------------------------------------------
// GET /privacy — Privacy Policy (required by Meta)
// ---------------------------------------------------------------------------
app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy — Baggalpe</title>
    <style>body{font-family:'Segoe UI',sans-serif;max-width:800px;margin:0 auto;padding:2rem;background:#0a0a0a;color:#ccc;line-height:1.8;}h1,h2{color:#25D366;}a{color:#00d4ff;}</style>
    </head><body>
    <h1>Privacy Policy</h1><p><em>Last updated: June 2026</em></p>
    <h2>1. Information We Collect</h2><p>Baggalpe collects your WhatsApp phone number, messages sent to our bot, order details, and delivery address to process your orders.</p>
    <h2>2. How We Use Your Information</h2><p>We use your information solely to: process and deliver your orders, communicate order status, improve our AI shopping assistant, and provide customer support.</p>
    <h2>3. Data Sharing</h2><p>We share your information only with: local merchants to fulfill your orders, payment processors for transactions, and delivery partners. We never sell your personal data.</p>
    <h2>4. Data Security</h2><p>We use industry-standard security measures to protect your data. All communications are encrypted via WhatsApp's end-to-end encryption.</p>
    <h2>5. Data Retention</h2><p>We retain order data for 12 months. You can request deletion of your data by messaging "delete my data" to our WhatsApp number.</p>
    <h2>6. Contact</h2><p>For privacy concerns, message us on WhatsApp at +91 8529790840 or email: privacy@baggalpe.com</p>
    </body></html>
  `);
});

// ---------------------------------------------------------------------------
// GET /terms — Terms of Service
// ---------------------------------------------------------------------------
app.get('/terms', (req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service — Baggalpe</title>
    <style>body{font-family:'Segoe UI',sans-serif;max-width:800px;margin:0 auto;padding:2rem;background:#0a0a0a;color:#ccc;line-height:1.8;}h1,h2{color:#25D366;}a{color:#00d4ff;}</style>
    </head><body>
    <h1>Terms of Service</h1><p><em>Last updated: June 2026</em></p>
    <h2>1. Service</h2><p>Baggalpe is an AI-powered WhatsApp shopping assistant that connects you with local merchants for grocery, sabzi, and service orders.</p>
    <h2>2. Orders</h2><p>All orders placed through Baggalpe are subject to merchant availability. Prices are set by merchants and may vary.</p>
    <h2>3. Payments</h2><p>Payments are processed securely through Baggalpe Pay. A platform fee of ₹10 per order applies.</p>
    <h2>4. Delivery</h2><p>Delivery times are estimates. Baggalpe is not liable for delays caused by merchants or delivery partners.</p>
    <h2>5. Contact</h2><p>For support, message us on WhatsApp at +91 8529790840.</p>
    </body></html>
  `);
});
// ---------------------------------------------------------------------------
// GET /setup-profile — One-time profile setup via WhatsApp Cloud API
// ---------------------------------------------------------------------------
app.get('/setup-profile', async (req, res) => {
  try {
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const response = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/whatsapp_business_profile`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        about: '🛒 AI Shopping Assistant',
        description: 'Baggalpe — Aapka AI Shopping Assistant! Grocery, sabzi, daily needs & services — sab kuch WhatsApp pe order karein.',
        websites: ['https://baggalpe.com'],
      }),
    });
    const data = await response.json();
    console.log('[Setup] Profile updated:', JSON.stringify(data));
    res.json({ success: true, result: data });
  } catch (err) {
    console.error('[Setup] Error:', err.message);
    res.json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /webhook — Meta Verification
// ---------------------------------------------------------------------------

/**
 * Handles the one-time webhook verification handshake required by Meta.
 * Meta sends hub.mode, hub.verify_token, and hub.challenge as query params.
 * We echo back the challenge only when the token matches our env variable.
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[Webhook] Verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ---------------------------------------------------------------------------
// POST /webhook — Receive WhatsApp Messages
// ---------------------------------------------------------------------------

/**
 * Receives incoming messages from the WhatsApp Cloud API webhook.
 *
 * Payload shape (simplified):
 *   body.entry[0].changes[0].value.messages[0]
 *     .from      — sender phone number (string)
 *     .text.body — message text (only for type === 'text')
 *     .id        — unique message id
 *     .type      — 'text', 'image', 'interactive', etc.
 *
 * We always return 200 immediately to avoid retries from Meta's servers.
 * Message processing happens asynchronously.
 */
app.post('/webhook', (req, res) => {
  // Log ALL incoming POST requests for debugging
  console.log('[Webhook] POST received!', JSON.stringify(req.body).substring(0, 500));

  // Acknowledge receipt immediately — Meta retries on non-2xx
  res.sendStatus(200);

  try {
    const entry = req.body?.entry;
    if (!entry || !entry.length) return;

    const changes = entry[0]?.changes;
    if (!changes || !changes.length) return;

    const value = changes[0]?.value;
    if (!value) return;

    const messages = value.messages;
    if (!messages || !messages.length) return;

    const message = messages[0];
    const from = message.from;
    const messageId = message.id;
    if (!from) return;

    // Handle TEXT messages
    if (message.type === 'text') {
      const text = message.text?.body;
      if (!text) return;
      console.log(`[Webhook] Text from ${from}: "${text}"`);
      handleMessage(from, text, messageId).catch((err) => {
        console.error(`[Webhook] Error handling message from ${from}:`, err);
      });
      return;
    }

    // Handle LOCATION messages
    if (message.type === 'location') {
      const loc = message.location;
      if (!loc || !loc.latitude || !loc.longitude) return;
      console.log(`[Webhook] Location from ${from}: ${loc.latitude}, ${loc.longitude}`);
      handleMessage(from, null, messageId, {
        latitude: loc.latitude,
        longitude: loc.longitude,
      }).catch((err) => {
        console.error(`[Webhook] Error handling location from ${from}:`, err);
      });
      return;
    }

    console.log(`[Webhook] Ignoring message type: ${message.type}`);
  } catch (err) {
    console.error('[Webhook] Payload parse error:', err);
  }
});


// ---------------------------------------------------------------------------
// POST /api/test — Local Test Endpoint (NO WhatsApp needed)
// ---------------------------------------------------------------------------

/** @type {Map<string, Array<{type: string, text: string, buttons?: Array}>>} */
const testResponses = new Map();

/**
 * Allows testing the full conversation pipeline from the browser simulator
 * without requiring WhatsApp credentials.
 *
 * We temporarily monkey-patch the whatsapp service's send functions so that
 * instead of calling the Meta API they push messages into an in-memory array.
 * After handleMessage completes we return the collected responses as JSON.
 *
 * Request body: { phone: string, message: string }
 * Response:     { responses: Array<{ type, text, buttons? }> }
 */
app.post('/api/test', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message required' });
  }

  // Initialise a fresh response bucket for this phone
  testResponses.set(phone, []);

  // Monkey-patch whatsapp service to capture outgoing messages
  const whatsapp = require('./services/whatsapp');
  const originalSend = whatsapp.sendText;
  const originalButtons = whatsapp.sendButtons;

  whatsapp.sendText = async (to, text) => {
    const bucket = testResponses.get(phone);
    if (bucket) bucket.push({ type: 'text', text });
  };

  whatsapp.sendButtons = async (to, text, buttons) => {
    const bucket = testResponses.get(phone);
    if (bucket) bucket.push({ type: 'buttons', text, buttons });
  };

  try {
    await handleMessage(phone, message, 'test_msg_' + Date.now());

    // Small delay so any trailing async sends can land
    await new Promise((r) => setTimeout(r, 500));

    const responses = testResponses.get(phone) || [];
    res.json({ responses });
  } catch (err) {
    console.error('[Test] Error:', err);
    res.json({ responses: [{ type: 'text', text: 'Error: ' + err.message }] });
  } finally {
    // Restore original implementations
    whatsapp.sendText = originalSend;
    whatsapp.sendButtons = originalButtons;
    testResponses.delete(phone);
  }
});

// ---------------------------------------------------------------------------
// GET /health — Health Check
// ---------------------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Baggalpe Bot',
    uptime: process.uptime(),
  });
});

// ---------------------------------------------------------------------------
// Dashboard Static Files
// ---------------------------------------------------------------------------
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// ---------------------------------------------------------------------------
// Dashboard API — Merchant Management (v2)
// ---------------------------------------------------------------------------

const {
  getMerchantByPhone, createMerchant, updateMerchant, getMerchant: getMerchantById,
  getMerchantInventory, getMerchantInStockInventory, searchMerchantInventory,
  onboardMerchant, addInventoryItem, updateInventoryItem, deleteInventoryItem,
  getOrdersByMerchant, updateOrderStatus: dbUpdateOrderStatus, getAllMerchants,
  getSpecialRequests, getPendingRequests, updateSpecialRequest, addInventoryItem: addFromRequest,
  createSpecialRequest,
} = require('./db/schema');

const { CATEGORIES, searchCatalog, getCatalogByCategory, MASTER_CATALOG } = require('./db/master-catalog');

/** Middleware: extract merchant ID from header */
function authMerchant(req, res, next) {
  const merchantId = parseInt(req.headers['x-merchant-id'], 10);
  if (!merchantId) return res.status(401).json({ error: 'Not authenticated' });
  req.merchantId = merchantId;
  next();
}

// ── Auth ────────────────────────────────────────────────────

app.post('/api/merchant/login', (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) return res.status(400).json({ error: 'Phone and PIN required' });
    const merchant = getMerchantByPhone(phone);
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
    if (merchant.pin !== String(pin)) return res.status(401).json({ error: 'Wrong PIN' });
    res.json({ success: true, merchant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/merchant/register', (req, res) => {
  try {
    const { name, owner_name, phone, address, city, pincode, type, pin, lat, lng, delivery_radius_km } = req.body;
    if (!name || !phone || !pin) return res.status(400).json({ error: 'Name, phone, and PIN required' });
    const existing = getMerchantByPhone(phone);
    if (existing) return res.status(409).json({ error: 'Phone number already registered' });
    const merchant = createMerchant({
      name, owner_name: owner_name || name, phone,
      address: address || '', city: city || '', pincode: pincode || '',
      type: type || 'kirana', pin: String(pin),
      lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null,
      delivery_radius_km: delivery_radius_km ? parseFloat(delivery_radius_km) : 1,
    });
    res.json({ success: true, merchant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Profile ─────────────────────────────────────────────────

app.get('/api/merchant/profile', authMerchant, (req, res) => {
  const merchant = getMerchantById(req.merchantId);
  if (!merchant) return res.status(404).json({ error: 'Not found' });
  res.json(merchant);
});

app.put('/api/merchant/profile', authMerchant, (req, res) => {
  const updated = updateMerchant(req.merchantId, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, merchant: updated });
});

// ── Onboarding (NEW — auto-populates inventory from master catalog) ──

app.post('/api/merchant/onboard', authMerchant, (req, res) => {
  try {
    const { categories, items } = req.body;
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Select at least one category' });
    }
    const count = onboardMerchant(req.merchantId, categories, items || []);
    res.json({ success: true, items_added: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Master Catalog (public — for onboarding/adding items) ───

app.get('/api/catalog/categories', (_req, res) => {
  res.json(CATEGORIES);
});

app.get('/api/catalog/items', (req, res) => {
  const { category } = req.query;
  if (category) {
    res.json(getCatalogByCategory(category));
  } else {
    res.json(MASTER_CATALOG);
  }
});

app.get('/api/catalog/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  res.json(searchCatalog(q));
});

// ── Inventory (v2 — replaces old products) ──────────────────

app.get('/api/merchant/inventory', authMerchant, (req, res) => {
  const inventory = getMerchantInventory(req.merchantId);
  res.json(inventory);
});

app.post('/api/merchant/inventory/add', authMerchant, (req, res) => {
  try {
    const item = addInventoryItem(req.merchantId, req.body);
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/merchant/inventory/:id', authMerchant, (req, res) => {
  const updated = updateInventoryItem(parseInt(req.params.id, 10), req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, item: updated });
});

app.delete('/api/merchant/inventory/:id', authMerchant, (req, res) => {
  const deleted = deleteInventoryItem(parseInt(req.params.id, 10));
  if (!deleted) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true });
});

// ── Special Requests ────────────────────────────────────────

app.get('/api/merchant/requests', authMerchant, (req, res) => {
  const requests = getSpecialRequests(req.merchantId);
  res.json(requests);
});

app.put('/api/merchant/requests/:id', authMerchant, (req, res) => {
  try {
    const { status, price } = req.body;
    const updated = updateSpecialRequest(parseInt(req.params.id, 10), { status, price });
    if (!updated) return res.status(404).json({ error: 'Request not found' });

    // If accepted, auto-add to inventory
    if (status === 'accepted' && updated.item_name) {
      addInventoryItem(req.merchantId, {
        custom_name: updated.item_name,
        category: 'general',
        price: price || 0,
        unit: 'piece',
        in_stock: 1,
      });
    }

    res.json({ success: true, request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Orders ──────────────────────────────────────────────────

app.get('/api/merchant/orders', authMerchant, (req, res) => {
  const orders = getOrdersByMerchant(req.merchantId);
  res.json(orders);
});

app.put('/api/merchant/orders/:id/status', authMerchant, (req, res) => {
  const updated = dbUpdateOrderStatus(req.params.id, req.body.status);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, order: updated });
});

// ── Public ──────────────────────────────────────────────────

app.get('/api/merchants', (_req, res) => {
  const merchants = getAllMerchants().filter(m => m.is_active !== 0);
  const safe = merchants.map(({ pin, ...rest }) => rest);
  res.json(safe);
});

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 4000;

initDB();

app.listen(PORT, () => {
  console.log(`\n🛒 Baggalpe Bot v2 running on port ${PORT}`);
  console.log(`📱 WhatsApp Webhook: http://localhost:${PORT}/webhook`);
  console.log(`🏪 Dashboard:       http://localhost:${PORT}/dashboard/`);
  console.log(`📦 Catalog:         ${MASTER_CATALOG.length} items in master catalog`);
  console.log(`🧪 Test Simulator:  http://localhost:${PORT}/test/simulator.html`);
  console.log(`❤️  Health Check:    http://localhost:${PORT}/health\n`);
});

