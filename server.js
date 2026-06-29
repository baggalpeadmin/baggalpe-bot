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

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
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

    // Only process text messages — ignore status updates, read receipts, etc.
    if (message.type !== 'text') {
      console.log(`[Webhook] Ignoring non-text message type: ${message.type}`);
      return;
    }

    const from = message.from;        // sender phone number
    const text = message.text?.body;   // message content
    const messageId = message.id;      // unique message id

    if (!from || !text) return;

    console.log(`[Webhook] Message from ${from}: "${text}"`);

    // Fire-and-forget — errors are caught inside handleMessage
    handleMessage(from, text, messageId).catch((err) => {
      console.error(`[Webhook] Error handling message from ${from}:`, err);
    });
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
// Startup
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 4000;

initDB(); // Create / migrate database tables

app.listen(PORT, () => {
  console.log(`\n🛒 Baggalpe Bot Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Webhook: http://localhost:${PORT}/webhook`);
  console.log(`🧪 Test Simulator:  http://localhost:${PORT}/test/simulator.html`);
  console.log(`❤️  Health Check:    http://localhost:${PORT}/health\n`);
});
